import { Resend } from "resend";

import { format, subDays } from "date-fns";

import {
	type AdminDormantRow,
	type AdminPollPoolRow,
	type AdminResponseRow,
	type AdminRouteHitsRow,
	type AdminSignupRow,
	type AdminUserRow,
	type AdminVisitDayRow,
	type AdminVisitRow,
	type AdminVisitTops,
	countActiveRuns,
	fetchDormantUsers,
	fetchPollPool,
	fetchRecentResponses,
	fetchRecentVisits,
	fetchRouteHits,
	fetchSignups,
	fetchUsersWithActiveRun,
	fetchVisitDays,
	fetchVisitTops,
} from "~/modules/ops/admin/infrastructure/admin.repository";
import {
	DORMANT_AFTER_DAYS,
	RETENTION_WINDOW_DAYS,
	VISIT_WINDOW_DAYS,
} from "~/modules/ops/admin/domain/adminWindow.model";

const DATE_FORMAT = "yyyy-MM-dd";
import { handleApiOperation } from "~/shared/utils/errorHandling";

export type AdminDashboard = {
	readonly today: string;
	readonly recentResponses: readonly AdminResponseRow[];
	readonly users: readonly AdminUserRow[];
	readonly visits: readonly AdminVisitRow[];
	readonly stats: { readonly totalUsers: number; readonly activeRuns: number };
	readonly visitDays: readonly AdminVisitDayRow[];
	readonly visitTops: AdminVisitTops;
	readonly routeHits: readonly AdminRouteHitsRow[];
	readonly signups: readonly AdminSignupRow[];
	readonly pollPool: readonly AdminPollPoolRow[];
	readonly dormant: readonly AdminDormantRow[];
};

export const getAdminDashboardService = () =>
	handleApiOperation(async (): Promise<AdminDashboard> => {
		const now = new Date();
		const visitsSince = format(
			subDays(now, VISIT_WINDOW_DAYS - 1),
			DATE_FORMAT
		);
		const [
			recentResponses,
			users,
			activeRuns,
			visits,
			visitDays,
			visitTops,
			routeHits,
			signups,
			pollPool,
			dormant,
		] = await Promise.all([
			fetchRecentResponses(),
			fetchUsersWithActiveRun(),
			countActiveRuns(),
			fetchRecentVisits(),
			fetchVisitDays(visitsSince),
			fetchVisitTops(visitsSince),
			fetchRouteHits(visitsSince),
			fetchSignups(subDays(now, RETENTION_WINDOW_DAYS)),
			fetchPollPool(),
			fetchDormantUsers(subDays(now, DORMANT_AFTER_DAYS)),
		]);

		return {
			today: format(now, DATE_FORMAT),
			recentResponses,
			users,
			visits,
			stats: { totalUsers: users.length, activeRuns },
			visitDays,
			visitTops,
			routeHits,
			signups,
			pollPool,
			dormant,
		};
	}, "getAdminDashboard");

const REMINDER = {
	from: "DevVoted <noreply@devvoted.dev>",
	subject: "Today's five are up",
	body: (displayName: string) => `
		<p>Hey ${displayName},</p>
		<p>Today's five polls are up and your run is waiting at the next gate.</p>
		<br />
		<a href='https://www.devvoted.dev/run'>Continue your run</a>
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
