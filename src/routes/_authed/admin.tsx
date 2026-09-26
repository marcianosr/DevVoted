import { useState } from "react";

import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { format } from "date-fns";
import { Resend } from "resend";

import { isAdminEmail } from "~/shared/utils/adminAuth";
import { getSupabaseServerClient } from "~/shared/utils/supabase";

const checkAdminAccess = createServerFn({ method: "GET" }).handler(async () => {
	const supabase = await getSupabaseServerClient();
	const {
		data: { user },
		error,
	} = await supabase.auth.getUser();

	if (error || !user) {
		return { hasAccess: false, message: "Not authenticated" };
	}

	const hasAccess = isAdminEmail(user.email);

	return {
		hasAccess,
		email: user.email,
		message: hasAccess ? "Admin access granted" : "Access denied - Admin only",
	};
});

const checkAdminAccessForAction = async () => {
	const supabase = await getSupabaseServerClient();
	const {
		data: { user },
		error,
	} = await supabase.auth.getUser();

	if (error || !user) {
		throw new Error("Not authenticated");
	}

	const hasAccess = isAdminEmail(user.email);
	if (!hasAccess) {
		throw new Error("Admin access required");
	}

	return user;
};

const getAdminData = createServerFn({ method: "GET" }).handler(async () => {
	const { db } = await import("~/database/db");
	const {
		pollsTable,
		pollResponsesTable,
		usersTable,
		runsTable,
		dailyPollsTable,
	} = await import("~/database/schema");
	const { eq, desc, lt, sql, count, and } = await import("drizzle-orm");
	const { getTodayDateString } = await import("~/shared/lib/dateUtils");

	try {
		const todayDate = getTodayDateString();
		const activePolls = await db
			.select({
				id: pollsTable.id,
				question: pollsTable.question,
				opening_time: pollsTable.opening_time,
				closing_time: pollsTable.closing_time,
				category_code: pollsTable.category_code,
				date: dailyPollsTable.date,
			})
			.from(dailyPollsTable)
			.innerJoin(pollsTable, eq(dailyPollsTable.poll_id, pollsTable.id))
			.where(eq(dailyPollsTable.date, todayDate))
			.orderBy(desc(dailyPollsTable.created_at));

		const pastPolls = await db
			.select({
				poll_id: dailyPollsTable.poll_id,
				question: pollsTable.question,
				category_code: pollsTable.category_code,
				occurrences: count(dailyPollsTable.id),
				last_date: sql<string>`max(${dailyPollsTable.date})`,
				all_dates: sql<
					string[]
				>`array_agg(${dailyPollsTable.date} order by ${dailyPollsTable.date} desc)`,
			})
			.from(dailyPollsTable)
			.innerJoin(pollsTable, eq(dailyPollsTable.poll_id, pollsTable.id))
			.where(lt(dailyPollsTable.date, todayDate))
			.groupBy(
				dailyPollsTable.poll_id,
				pollsTable.question,
				pollsTable.category_code
			)
			.orderBy(desc(sql`max(${dailyPollsTable.date})`));

		const recentResponses = await db
			.select({
				response_id: pollResponsesTable.response_id,
				poll_id: pollResponsesTable.poll_id,
				created_at: pollResponsesTable.created_at,
				display_name: usersTable.display_name,
				email: usersTable.email,
				question: pollsTable.question,
			})
			.from(pollResponsesTable)
			.innerJoin(pollsTable, eq(pollResponsesTable.poll_id, pollsTable.id))
			.leftJoin(usersTable, eq(pollResponsesTable.user_id, usersTable.id))
			.orderBy(desc(pollResponsesTable.created_at))
			.limit(20);

		const allUsers = await db
			.select({
				id: usersTable.id,
				display_name: usersTable.display_name,
				email: usersTable.email,
				total_polls_submitted: usersTable.total_polls_submitted,
				run_id: runsTable.id,
			})
			.from(usersTable)
			.leftJoin(
				runsTable,
				and(
					eq(runsTable.user_id, usersTable.id),
					eq(runsTable.status, "active")
				)
			)
			.orderBy(desc(usersTable.total_polls_submitted));

		const activeRuns = await db
			.select({
				id: runsTable.id,
				userId: runsTable.user_id,
				displayName: usersTable.display_name,
				email: usersTable.email,
			})
			.from(runsTable)
			.leftJoin(usersTable, eq(runsTable.user_id, usersTable.id))
			.where(eq(runsTable.status, "active"));

		return {
			activePolls,
			pastPolls,
			recentResponses,
			allUsers,
			stats: {
				totalUsers: allUsers.length,
				activeRuns: activeRuns.length,
			},
		};
	} catch (error) {
		console.error("Error fetching admin data:", error);
		return {
			activePolls: [],
			pastPolls: [],
			recentResponses: [],
			allUsers: [],
			stats: { totalUsers: 0, activeRuns: 0 },
			error: "Failed to load admin data",
		};
	}
});

const sendReminderEmailFn = createServerFn({ method: "POST" })
	.validator((data: { email: string; displayName: string }) => data)
	.handler(async ({ data }) => {
		await checkAdminAccessForAction();

		const resend = new Resend(process.env.RESEND_API_KEY);

		const from = "DevVoted <noreply@devvoted.dev>";

		const { error } = await resend.emails.send({
			from,
			to: data.email,
			subject: `Reminder: Don't forget to vote today!`,
			html: `
				<p>Hey ${data.displayName}!,</p>
				<p>Just a small reminder for you to vote on the poll of today!</p>
				<br />
				<a href='https://www.devvoted.dev/daily-poll'>Cast your vote!</a>
				<p>Team DevVoted</p>
			`,
		});

		if (error) throw new Error(error.message);

		return { success: true };
	});

export const Route = createFileRoute("/_authed/admin")({
	beforeLoad: async ({ context }) => {
		if (!context.user) {
			throw new Error("Not authenticated");
		}

		const result = await checkAdminAccess();
		if (!result.hasAccess) {
			throw new Error("Admin access required");
		}
	},
	loader: async () => {
		return await getAdminData();
	},
	errorComponent: ({ error }) => {
		if (error.message === "Not authenticated") {
			return (
				<div className="flex items-center justify-center min-h-screen">
					<div className="text-center">
						<h1 className="text-2xl text-red-600 mb-4">
							Authentication Required
						</h1>
						<p>Please log in to access the admin panel.</p>
					</div>
				</div>
			);
		}

		if (error.message === "Admin access required") {
			return (
				<div className="flex items-center justify-center min-h-screen">
					<div className="text-center">
						<h1 className="text-2xl text-red-600 mb-4">Access Denied</h1>
						<p>This area is restricted to administrators only.</p>
						<p className="text-sm text-white mt-2">
							Contact marciano@kabisa.nl if you need access.
						</p>
					</div>
				</div>
			);
		}

		throw error;
	},
	component: AdminPanel,
});

type UserRow = {
	id: string;
	display_name: string;
	email: string;
	total_polls_submitted: number;
	run_id: number | null;
};

function AdminPanel() {
	const data = Route.useLoaderData();
	const [message, setMessage] = useState<{
		type: "success" | "error";
		text: string;
	} | null>(null);
	const [emailSending, setEmailSending] = useState<string | null>(null);
	const [emailSent, setEmailSent] = useState<Set<string>>(new Set());

	const formatDate = (date: Date | string) => {
		const d = typeof date === "string" ? new Date(date) : date;
		return format(d, "MM/dd/yyyy HH:mm:ss");
	};

	const showMessage = (type: "success" | "error", text: string) => {
		setMessage({ type, text });
		setTimeout(() => setMessage(null), 5000);
	};

	const handleSendReminder = async (user: UserRow) => {
		setEmailSending(user.id);
		try {
			await sendReminderEmailFn({
				data: { email: user.email, displayName: user.display_name },
			});
			setEmailSent((prev) => new Set(prev).add(user.id));
		} catch {
			showMessage("error", `Failed to send email to ${user.email}`);
		} finally {
			setEmailSending(null);
		}
	};

	return (
		<div className="container mx-auto px-4 py-8">
			<div className="mb-8">
				<h1 className="text-3xl text-white mb-2">DevVoted Admin Panel</h1>
				<p className="text-white">
					Monitor active polls and track user responses.
				</p>
			</div>

			{data.error && (
				<div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
					<p className="text-red-600">{data.error}</p>
				</div>
			)}

			{message && (
				<div
					className={`mb-6 p-4 rounded-lg ${
						message.type === "success"
							? "bg-green-50 border border-green-200 text-green-600"
							: "bg-red-50 border border-red-200 text-red-600"
					}`}
				>
					<p>{message.text}</p>
				</div>
			)}

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
				<div className=" rounded-lg shadow-md p-6">
					<h2 className="text-xl font-semibold mb-4 text-white">
						System Status
					</h2>
					<div className="space-y-3">
						<div className="flex justify-between items-center">
							<span className="text-white">Database</span>
							<span className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm">
								Connected
							</span>
						</div>
						<div className="flex justify-between items-center">
							<span className="text-white">Active Runs</span>
							<span className="text-white font-medium">
								{data.stats.activeRuns}
							</span>
						</div>
						<div className="flex justify-between items-center">
							<span className="text-white">Total Users</span>
							<span className="text-white font-medium">
								{data.stats.totalUsers}
							</span>
						</div>
					</div>
				</div>

				<div className=" rounded-lg shadow-md p-6">
					<h2 className="text-xl font-semibold mb-4 text-white">
						Active Polls
					</h2>
					{data.activePolls.length > 0 ? (
						<div className="space-y-3">
							{data.activePolls.map((poll) => (
								<div
									key={poll.id}
									className="p-3 border border-gray-200 rounded-lg"
								>
									<div className="flex justify-between items-start mb-2">
										<h3 className="font-medium text-white">Poll #{poll.id}</h3>
										<span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
											{poll.category_code}
										</span>
									</div>
									<p className="text-sm text-white mb-2">{poll.question}</p>
									<div className="flex justify-between text-xs text-white">
										<span>Opens: {formatDate(poll.opening_time)}</span>
										<span>Closes: {formatDate(poll.closing_time)}</span>
									</div>
								</div>
							))}
						</div>
					) : (
						<p className="text-white">No active polls currently.</p>
					)}
				</div>

				<div className=" rounded-lg shadow-md p-6">
					<h2 className="text-xl font-semibold mb-4 text-white">
						Recent Responses
					</h2>
					{data.recentResponses.length > 0 ? (
						<div className="space-y-2 max-h-96 overflow-y-auto">
							{data.recentResponses.map((response) => (
								<div
									key={response.response_id}
									className="p-3 bg-gray-50 rounded-lg"
								>
									<div className="flex justify-between items-start mb-1">
										<span className="font-medium text-sm text-white">
											{response.display_name || "Anonymous"}
										</span>
										<span className="text-xs text-white">
											{formatDate(response.created_at!)}
										</span>
									</div>
									<p className="text-xs text-white mb-1">
										Poll #{response.poll_id}: {response.question}
									</p>
									{response.email && (
										<p className="text-xs text-white">{response.email}</p>
									)}
								</div>
							))}
						</div>
					) : (
						<p className="text-white">No recent responses.</p>
					)}
				</div>
			</div>

			<div className="mt-8 rounded-lg shadow-md p-6">
				<h2 className="text-xl font-semibold mb-4 text-white">
					Past Daily Polls ({data.pastPolls.length})
				</h2>
				{data.pastPolls.length > 0 ? (
					<div className="overflow-x-auto">
						<table className="w-full text-sm">
							<thead>
								<tr className="border-b border-gray-600">
									<th className="text-left py-2 px-3 font-medium text-white">
										Poll ID
									</th>
									<th className="text-left py-2 px-3 font-medium text-white">
										Question
									</th>
									<th className="text-left py-2 px-3 font-medium text-white">
										Category
									</th>
									<th className="text-left py-2 px-3 font-medium text-white">
										Times used
									</th>
									<th className="text-left py-2 px-3 font-medium text-white">
										Last shown
									</th>
									<th className="text-left py-2 px-3 font-medium text-white">
										All dates
									</th>
								</tr>
							</thead>
							<tbody>
								{data.pastPolls.map((poll) => (
									<tr
										key={poll.poll_id}
										className="border-b border-gray-700 hover:bg-gray-800"
									>
										<td className="py-2 px-3 text-white text-xs">
											#{poll.poll_id}
										</td>
										<td className="py-2 px-3 text-white max-w-sm">
											{poll.question}
										</td>
										<td className="py-2 px-3">
											<span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
												{poll.category_code}
											</span>
										</td>
										<td className="py-2 px-3 text-center">
											<span
												className={`px-2 py-1 rounded text-xs font-medium ${
													poll.occurrences > 1
														? "bg-orange-100 text-orange-800"
														: "bg-gray-700 text-white"
												}`}
											>
												{poll.occurrences}×
											</span>
										</td>
										<td className="py-2 px-3 text-white text-xs whitespace-nowrap">
											{poll.last_date}
										</td>
										<td className="py-2 px-3 text-white text-xs">
											{poll.all_dates.join(", ")}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				) : (
					<p className="text-white">No past polls yet.</p>
				)}
			</div>

			<UsersSection
				users={data.allUsers as UserRow[]}
				emailSending={emailSending}
				emailSent={emailSent}
				onSendReminder={handleSendReminder}
			/>
		</div>
	);
}

function UsersSection({
	users,
	emailSending,
	emailSent,
	onSendReminder,
}: {
	users: UserRow[];
	emailSending: string | null;
	emailSent: Set<string>;
	onSendReminder: (user: UserRow) => void;
}) {
	const inRun = users.filter((u) => u.run_id !== null);
	const notInRun = users.filter((u) => u.run_id === null);

	return (
		<div className="mt-8 rounded-lg shadow-md p-6">
			<h2 className="text-xl font-semibold mb-6 text-white">
				Users ({users.length})
			</h2>
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
				<UserGroup
					title="In Active Run"
					users={inRun}
					emailSending={emailSending}
					emailSent={emailSent}
					onSendReminder={onSendReminder}
				/>
				<UserGroup
					title="No Active Run"
					users={notInRun}
					emailSending={emailSending}
					emailSent={emailSent}
					onSendReminder={onSendReminder}
				/>
			</div>
		</div>
	);
}

function UserGroup({
	title,
	users,
	emailSending,
	emailSent,
	onSendReminder,
}: {
	title: string;
	users: UserRow[];
	emailSending: string | null;
	emailSent: Set<string>;
	onSendReminder: (user: UserRow) => void;
}) {
	return (
		<div>
			<h3 className="text-sm font-semibold uppercase tracking-wide text-white mb-3">
				{title} ({users.length})
			</h3>
			{users.length === 0 ? (
				<p className="text-white text-sm">None</p>
			) : (
				<ul className="space-y-2">
					{users.map((user) => (
						<li
							key={user.id}
							className="flex items-center justify-between gap-3 p-3 bg-gray-800 rounded-lg"
						>
							<div className="min-w-0">
								<p className="text-sm font-medium text-white truncate">
									{user.display_name}
								</p>
								<p className="text-xs text-white truncate">{user.email}</p>
								<p className="text-xs text-white">
									{user.total_polls_submitted} polls submitted
								</p>
							</div>
							<button
								onClick={() => onSendReminder(user)}
								disabled={emailSending === user.id || emailSent.has(user.id)}
								className="shrink-0 px-3 py-1.5 text-xs rounded-md transition-colors disabled:opacity-50 bg-indigo-600 hover:bg-indigo-700 text-white disabled:cursor-not-allowed"
							>
								{emailSending === user.id
									? "Sending..."
									: emailSent.has(user.id)
										? "Sent ✓"
										: "Send reminder"}
							</button>
						</li>
					))}
				</ul>
			)}
		</div>
	);
}
