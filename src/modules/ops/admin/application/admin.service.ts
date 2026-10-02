import { Resend } from "resend";

import {
	type AdminPastPollRow,
	type AdminPollRow,
	type AdminResponseRow,
	type AdminUserRow,
	countActiveRuns,
	fetchPastDailyPolls,
	fetchRecentResponses,
	fetchTodaysDailyPolls,
	fetchUsersWithActiveRun,
} from "~/modules/ops/admin/infrastructure/admin.repository";
import { getTodayDateString } from "~/shared/lib/dateUtils";
import { handleApiOperation } from "~/shared/utils/errorHandling";

export type AdminDashboard = {
	readonly activePolls: readonly AdminPollRow[];
	readonly pastPolls: readonly AdminPastPollRow[];
	readonly recentResponses: readonly AdminResponseRow[];
	readonly users: readonly AdminUserRow[];
	readonly stats: { readonly totalUsers: number; readonly activeRuns: number };
};

export const getAdminDashboardService = () =>
	handleApiOperation(async (): Promise<AdminDashboard> => {
		const today = getTodayDateString();
		const [activePolls, pastPolls, recentResponses, users, activeRuns] =
			await Promise.all([
				fetchTodaysDailyPolls(today),
				fetchPastDailyPolls(today),
				fetchRecentResponses(),
				fetchUsersWithActiveRun(),
				countActiveRuns(),
			]);

		return {
			activePolls,
			pastPolls,
			recentResponses,
			users,
			stats: { totalUsers: users.length, activeRuns },
		};
	}, "getAdminDashboard");

const REMINDER = {
	from: "DevVoted <noreply@devvoted.dev>",
	subject: "Reminder: Don't forget to vote today!",
	body: (displayName: string) => `
		<p>Hey ${displayName}!,</p>
		<p>Just a small reminder for you to vote on the poll of today!</p>
		<br />
		<a href='https://www.devvoted.dev/daily-poll'>Cast your vote!</a>
		<p>Team DevVoted</p>
	`,
} as const;

export type ReminderRecipient = {
	readonly email: string;
	readonly displayName: string;
};

export const sendReminderEmailService = (recipient: ReminderRecipient) =>
	handleApiOperation(async () => {
		const resend = new Resend(process.env.RESEND_API_KEY);
		const { error } = await resend.emails.send({
			from: REMINDER.from,
			to: recipient.email,
			subject: REMINDER.subject,
			html: REMINDER.body(recipient.displayName),
		});
		if (error) throw new Error(error.message);

		return { sentTo: recipient.email };
	}, "sendReminderEmail");
