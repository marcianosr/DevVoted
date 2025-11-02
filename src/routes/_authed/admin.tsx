import { createFileRoute, useRouter } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { format } from "date-fns";
import { getSupabaseServerClient } from "../../utils/supabase";
import { PrimaryButton } from "../../ui/PrimaryButton";
import { ADMIN_EMAILS } from "../../utils/adminAuth";

const checkAdminAccess = createServerFn({ method: "GET" }).handler(async () => {
	const supabase = await getSupabaseServerClient();
	const {
		data: { user },
		error,
	} = await supabase.auth.getUser();

	if (error || !user) {
		return { hasAccess: false, message: "Not authenticated" };
	}

	const hasAccess = ADMIN_EMAILS.includes(user.email as any);

	return {
		hasAccess,
		email: user.email,
		message: hasAccess
			? "Admin access granted"
			: "Access denied - Admin only",
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

	const hasAccess = ADMIN_EMAILS.includes(user.email as any);
	if (!hasAccess) {
		throw new Error("Admin access required");
	}

	return user;
};

const createSeasonFn = createServerFn({ method: "POST" })
	.inputValidator(
		(data: {
			name: string;
			description?: string;
			startDate: string;
			endDate: string;
		}) => data
	)
	.handler(async ({ data }) => {
		await checkAdminAccessForAction();

		const { createSeason } = await import(
			"~/domains/seasons/services/seasonService"
		);

		try {
			const season = await createSeason({
				name: data.name,
				description: data.description,
				startDate: new Date(data.startDate),
				endDate: new Date(data.endDate),
			});

			return { success: true, season };
		} catch (error) {
			return {
				success: false,
				error:
					error instanceof Error
						? error.message
						: "Failed to create season",
			};
		}
	});

const startSeasonFn = createServerFn({ method: "POST" })
	.inputValidator((data: { seasonId: number }) => data)
	.handler(async ({ data }) => {
		await checkAdminAccessForAction();

		const { startSeason } = await import(
			"~/domains/seasons/services/seasonService"
		);

		try {
			const season = await startSeason(data.seasonId);
			return { success: true, season };
		} catch (error) {
			return {
				success: false,
				error:
					error instanceof Error
						? error.message
						: "Failed to start season",
			};
		}
	});

const finishSeasonFn = createServerFn({ method: "POST" })
	.inputValidator((data: { seasonId: number }) => data)
	.handler(async ({ data }) => {
		await checkAdminAccessForAction();

		const { finishSeason } = await import(
			"~/domains/seasons/services/seasonService"
		);

		try {
			const season = await finishSeason(data.seasonId);
			return { success: true, season };
		} catch (error) {
			return {
				success: false,
				error:
					error instanceof Error
						? error.message
						: "Failed to finish season",
			};
		}
	});

const getAdminData = createServerFn({ method: "GET" }).handler(async () => {
	const { getAllSeasons, getCurrentSeason } = await import(
		"~/domains/seasons/services/seasonService"
	);
	const { db } = await import("~/database/db");
	const { pollsTable, pollResponsesTable, usersTable, runsTable } =
		await import("~/database/schema");
	const { eq, desc } = await import("drizzle-orm");

	try {
		const currentSeason = await getCurrentSeason();
		const allSeasons = await getAllSeasons();

		const activePolls = await db
			.select({
				id: pollsTable.id,
				question: pollsTable.question,
				status: pollsTable.status,
				opening_time: pollsTable.opening_time,
				closing_time: pollsTable.closing_time,
				category_code: pollsTable.category_code,
			})
			.from(pollsTable)
			.where(eq(pollsTable.status, "open"))
			.orderBy(desc(pollsTable.opening_time));

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
			.innerJoin(
				pollsTable,
				eq(pollResponsesTable.poll_id, pollsTable.id)
			)
			.leftJoin(usersTable, eq(pollResponsesTable.user_id, usersTable.id))
			.orderBy(desc(pollResponsesTable.created_at))
			.limit(20);

		const totalUsers = await db.select().from(usersTable);
		const activeRuns = await db
			.select()
			.from(runsTable)
			.where(eq(runsTable.status, "active"));

		return {
			currentSeason,
			allSeasons,
			activePolls,
			recentResponses,
			stats: {
				totalUsers: totalUsers.length,
				activeRuns: activeRuns.length,
			},
		};
	} catch (error) {
		console.error("Error fetching admin data:", error);
		return {
			currentSeason: null,
			allSeasons: [],
			activePolls: [],
			recentResponses: [],
			stats: { totalUsers: 0, activeRuns: 0 },
			error: "Failed to load admin data",
		};
	}
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
						<h1 className="text-2xl font-bold text-red-600 mb-4">
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
						<h1 className="text-2xl font-bold text-red-600 mb-4">
							Access Denied
						</h1>
						<p>This area is restricted to administrators only.</p>
						<p className="text-sm text-gray-600 mt-2">
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

function AdminPanel() {
	const data = Route.useLoaderData();
	const router = useRouter();
	const [showCreateForm, setShowCreateForm] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [message, setMessage] = useState<{
		type: "success" | "error";
		text: string;
	} | null>(null);

	const formatDate = (date: Date | string) => {
		const d = typeof date === "string" ? new Date(date) : date;
		return format(d, "MM/dd/yyyy HH:mm:ss");
	};

	const showMessage = (type: "success" | "error", text: string) => {
		setMessage({ type, text });
		setTimeout(() => setMessage(null), 5000);
	};

	const handleCreateSeason = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setIsLoading(true);

		const formData = new FormData(e.currentTarget);
		const result = await createSeasonFn({
			data: {
				name: formData.get("name") as string,
				description: formData.get("description") as string,
				startDate: formData.get("startDate") as string,
				endDate: formData.get("endDate") as string,
			},
		});

		setIsLoading(false);

		if (result.success) {
			showMessage(
				"success",
				`Season "${result.season?.name || "New season"}" created successfully!`
			);
			setShowCreateForm(false);
			router.invalidate();
		} else {
			showMessage("error", result.error || "Failed to create season");
		}
	};

	const handleStartSeason = async () => {
		const upcomingSeason = data.allSeasons.find(
			(s) => s.status === "upcoming"
		);
		if (!upcomingSeason) {
			showMessage("error", "No upcoming season to start");
			return;
		}

		setIsLoading(true);
		const result = await startSeasonFn({
			data: { seasonId: upcomingSeason.id },
		});
		setIsLoading(false);

		if (result.success) {
			showMessage("success", "Season started successfully!");
			router.invalidate();
		} else {
			showMessage("error", result.error || "Failed to start season");
		}
	};

	const handleFinishSeason = async () => {
		if (!data.currentSeason) {
			showMessage("error", "No active season to finish");
			return;
		}

		if (
			confirm(
				`Are you sure you want to finish "${data.currentSeason.name}"?`
			)
		) {
			setIsLoading(true);
			const result = await finishSeasonFn({
				data: { seasonId: data.currentSeason.id },
			});
			setIsLoading(false);

			if (result.success) {
				showMessage("success", "Season finished successfully!");
				await router.invalidate();
			} else {
				showMessage("error", result.error || "Failed to finish season");
			}
		}
	};

	const upcomingSeasons = data.allSeasons.filter(
		(s) => s.status === "upcoming"
	);
	const hasUpcomingSeason = upcomingSeasons.length > 0;

	return (
		<div className="container mx-auto px-4 py-8">
			<div className="mb-8">
				<h1 className="text-3xl font-bold text-gray-900 mb-2">
					DevVoted Admin Panel
				</h1>
				<p className="text-gray-600">
					Manage seasons, monitor active polls, and track user
					responses.
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
				{/* Season Management */}
				<div className="bg-white rounded-lg shadow-md p-6">
					<h2 className="text-xl font-semibold mb-4 text-gray-900">
						Season Management
					</h2>
					<div className="space-y-4">
						{/* Current Season */}
						<div className="p-4 bg-blue-50 rounded-lg">
							<h3 className="font-medium text-blue-900 mb-2">
								Current Season
							</h3>
							{data.currentSeason ? (
								<div className="text-sm space-y-1">
									<p>
										<strong>Name:</strong>{" "}
										{data.currentSeason.name}
									</p>
									<p>
										<strong>Status:</strong>{" "}
										<span className="capitalize">
											{data.currentSeason.status}
										</span>
									</p>
									<p>
										<strong>Start:</strong>{" "}
										{formatDate(
											data.currentSeason.startDate
										)}
									</p>
									<p>
										<strong>End:</strong>{" "}
										{formatDate(data.currentSeason.endDate)}
									</p>
								</div>
							) : (
								<p className="text-sm text-blue-700">
									No active season
								</p>
							)}
						</div>

						{/* Upcoming Seasons */}
						{hasUpcomingSeason && (
							<div className="p-4 bg-yellow-50 rounded-lg">
								<h3 className="font-medium text-yellow-900 mb-2">
									Upcoming Seasons
								</h3>
								{upcomingSeasons.map((season) => (
									<div
										key={season.id}
										className="text-sm space-y-1 mb-2"
									>
										<p>
											<strong>{season.name}</strong>
										</p>
										<p>
											Starts:{" "}
											{formatDate(season.startDate)}
										</p>
									</div>
								))}
							</div>
						)}

						{/* Actions */}
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
							<button
								className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
								onClick={() =>
									setShowCreateForm(!showCreateForm)
								}
								disabled={isLoading}
							>
								Create New Season
							</button>
							<PrimaryButton
								onClick={handleStartSeason}
								disabled={isLoading || !hasUpcomingSeason}
							>
								Start Season
							</PrimaryButton>
							<button
								className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors disabled:opacity-50"
								onClick={handleFinishSeason}
								disabled={isLoading || !data.currentSeason}
							>
								Finish Season
							</button>
							<button
								className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors disabled:opacity-50"
								onClick={() =>
									alert("Archive functionality coming soon!")
								}
								disabled={isLoading}
							>
								Archive Season
							</button>
						</div>

						{/* Create Season Form */}
						{showCreateForm && (
							<form
								onSubmit={handleCreateSeason}
								className="mt-4 p-4 border border-gray-200 rounded-lg"
							>
								<h3 className="font-medium mb-3">
									Create New Season
								</h3>
								<div className="space-y-3">
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-1">
											Season Name
										</label>
										<input
											name="name"
											type="text"
											required
											placeholder="e.g., Season 2: Meta Layer"
											className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
										/>
									</div>
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-1">
											Description
										</label>
										<textarea
											name="description"
											placeholder="Optional description"
											className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
										/>
									</div>
									<div className="grid grid-cols-2 gap-3">
										<div>
											<label className="block text-sm font-medium text-gray-700 mb-1">
												Start Date
											</label>
											<input
												name="startDate"
												type="datetime-local"
												required
												className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
											/>
										</div>
										<div>
											<label className="block text-sm font-medium text-gray-700 mb-1">
												End Date
											</label>
											<input
												name="endDate"
												type="datetime-local"
												required
												className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
											/>
										</div>
									</div>
									<div className="flex gap-2">
										<button
											type="submit"
											disabled={isLoading}
											className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
										>
											{isLoading
												? "Creating..."
												: "Create Season"}
										</button>
										<button
											type="button"
											onClick={() =>
												setShowCreateForm(false)
											}
											className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
										>
											Cancel
										</button>
									</div>
								</div>
							</form>
						)}
					</div>
				</div>

				{/* System Status */}
				<div className="bg-white rounded-lg shadow-md p-6">
					<h2 className="text-xl font-semibold mb-4 text-gray-900">
						System Status
					</h2>
					<div className="space-y-3">
						<div className="flex justify-between items-center">
							<span className="text-gray-600">Database</span>
							<span className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm">
								Connected
							</span>
						</div>
						<div className="flex justify-between items-center">
							<span className="text-gray-600">Active Runs</span>
							<span className="text-gray-900 font-medium">
								{data.stats.activeRuns}
							</span>
						</div>
						<div className="flex justify-between items-center">
							<span className="text-gray-600">Total Users</span>
							<span className="text-gray-900 font-medium">
								{data.stats.totalUsers}
							</span>
						</div>
					</div>
				</div>

				{/* Active Polls */}
				<div className="bg-white rounded-lg shadow-md p-6">
					<h2 className="text-xl font-semibold mb-4 text-gray-900">
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
										<h3 className="font-medium text-gray-900">
											Poll #{poll.id}
										</h3>
										<span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
											{poll.category_code}
										</span>
									</div>
									<p className="text-sm text-gray-700 mb-2">
										{poll.question}
									</p>
									<div className="flex justify-between text-xs text-gray-500">
										<span>
											Opens:{" "}
											{formatDate(poll.opening_time)}
										</span>
										<span>
											Closes:{" "}
											{formatDate(poll.closing_time)}
										</span>
									</div>
								</div>
							))}
						</div>
					) : (
						<p className="text-gray-600">
							No active polls currently.
						</p>
					)}
				</div>

				{/* Recent Responses */}
				<div className="bg-white rounded-lg shadow-md p-6">
					<h2 className="text-xl font-semibold mb-4 text-gray-900">
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
										<span className="font-medium text-sm text-gray-900">
											{response.display_name ||
												"Anonymous"}
										</span>
										<span className="text-xs text-gray-500">
											{formatDate(response.created_at!)}
										</span>
									</div>
									<p className="text-xs text-gray-600 mb-1">
										Poll #{response.poll_id}:{" "}
										{response.question}
									</p>
									{response.email && (
										<p className="text-xs text-gray-500">
											{response.email}
										</p>
									)}
								</div>
							))}
						</div>
					) : (
						<p className="text-gray-600">No recent responses.</p>
					)}
				</div>
			</div>
		</div>
	);
}
