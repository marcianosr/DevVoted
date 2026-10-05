import { addDays, differenceInCalendarDays, format, subDays } from "date-fns";

import type {
	AdminDashboard,
	ReminderRecipient,
} from "~/modules/ops/admin/application/admin.service";
import type {
	AdminDormantRow,
	AdminPollPoolRow,
	AdminRouteHitsRow,
	AdminSignupRow,
	AdminUserRow,
	AdminVisitRow,
	AdminVisitTopRow,
} from "~/modules/ops/admin/infrastructure/admin.repository";
import { VISIT_WINDOW_DAYS } from "~/modules/ops/admin/domain/adminWindow.model";

const NEXT_DAY = 1;
const FIRST_WEEK = 7;
const AS_PERCENT = 100;

const STAMP_FORMAT = "MM/dd/yyyy HH:mm:ss";
const NO_VALUE = "—";
const ANONYMOUS = "Anonymous";
const DAY_FORMAT = "yyyy-MM-dd";
const NEVER = "never";
const AVERAGE_DIGITS = 1;

export type AdminUser = ReminderRecipient & {
	readonly id: string;
	readonly pollsSubmitted: number;
};

export type AdminPanelData = {
	readonly stats: AdminDashboard["stats"];
	readonly recentResponses: readonly {
		readonly id: number;
		readonly pollId: number;
		readonly question: string;
		readonly name: string;
		readonly email: string | null;
		readonly at: string;
	}[];
	readonly users: {
		readonly inRun: readonly AdminUser[];
		readonly idle: readonly AdminUser[];
	};
	readonly visits: readonly AdminVisit[];
	readonly visitBreakdown: AdminVisitBreakdown;
	readonly routeTraffic: readonly AdminRouteTraffic[];
	readonly signups: AdminSignups;
	readonly pollPool: readonly AdminPollPool[];
	readonly dormant: readonly AdminDormant[];
};

export type AdminVisitDay = {
	readonly date: string;
	readonly signedIn: number;
	readonly anonymous: number;
	readonly total: number;
};

export type AdminTopValue = {
	readonly label: string;
	readonly visitors: number;
};

export type AdminVisitBreakdown = {
	readonly days: readonly AdminVisitDay[];
	readonly devices: readonly AdminTopValue[];
	readonly countries: readonly AdminTopValue[];
	readonly referrers: readonly AdminTopValue[];
};

export type AdminRouteTraffic = {
	readonly route: string;
	readonly today: number;
	readonly average: string;
};

export type AdminSignups = {
	readonly days: readonly { readonly date: string; readonly count: number }[];
	readonly nextDay: string;
	readonly firstWeek: string;
};

export type AdminPollPool = {
	readonly category: string;
	readonly published: number;
	readonly drafts: number;
	readonly neverDealt: number;
};

export type AdminDormant = AdminUser & { readonly lastSeen: string };

export type AdminVisit = {
	readonly id: number;
	readonly name: string;
	readonly avatarUrl: string | null;
	readonly visitor: string;
	readonly date: string;
	readonly route: string;
	readonly hits: number;
	readonly device: string;
	readonly country: string;
	readonly referrer: string;
	readonly firstSeen: string;
	readonly lastSeen: string;
};

const stampOf = (at: Date | null): string =>
	at === null ? NO_VALUE : format(at, STAMP_FORMAT);

const userOf = (row: AdminUserRow): AdminUser => ({
	id: row.id,
	displayName: row.displayName,
	email: row.email,
	pollsSubmitted: row.pollsSubmitted,
});

const visitOf = (row: AdminVisitRow): AdminVisit => ({
	id: row.id,
	name: row.displayName ?? ANONYMOUS,
	avatarUrl: row.photoUrl,
	visitor: row.visitorHash,
	date: row.visitDate,
	route: row.routeId,
	hits: row.hits,
	device: row.device,
	country: row.country ?? NO_VALUE,
	referrer: row.referrerHost ?? NO_VALUE,
	firstSeen: stampOf(row.firstSeenAt),
	lastSeen: stampOf(row.lastSeenAt),
});

const windowDaysOf = (today: string): readonly string[] =>
	Array.from({ length: VISIT_WINDOW_DAYS }, (_, back) =>
		format(subDays(new Date(`${today}T12:00:00`), back), DAY_FORMAT)
	);

const dayAfter = (date: string, days: number) =>
	format(addDays(new Date(`${date}T12:00:00`), days), DAY_FORMAT);

const topValuesOf = (rows: readonly AdminVisitTopRow[]): AdminTopValue[] =>
	rows.map((row) => ({ label: row.value ?? NO_VALUE, visitors: row.visitors }));

const visitBreakdownFor = (dashboard: AdminDashboard): AdminVisitBreakdown => ({
	days: windowDaysOf(dashboard.today).map((date) => {
		const day = dashboard.visitDays.find((row) => row.visitDate === date);
		const signedIn = day?.signedIn ?? 0;
		const anonymous = day?.anonymous ?? 0;
		return { date, signedIn, anonymous, total: signedIn + anonymous };
	}),
	devices: topValuesOf(dashboard.visitTops.devices),
	countries: topValuesOf(dashboard.visitTops.countries),
	referrers: topValuesOf(dashboard.visitTops.referrers),
});

const hitsOf = (rows: readonly AdminRouteHitsRow[]) =>
	rows.reduce((total, row) => total + row.hits, 0);

const routeTrafficFor = (
	rows: readonly AdminRouteHitsRow[],
	today: string
): AdminRouteTraffic[] =>
	[...new Set(rows.map((row) => row.routeId))]
		.map((route) => {
			const ofRoute = rows.filter((row) => row.routeId === route);
			return {
				route,
				today: hitsOf(ofRoute.filter((row) => row.visitDate === today)),
				average: (hitsOf(ofRoute) / VISIT_WINDOW_DAYS).toFixed(AVERAGE_DIGITS),
			};
		})
		.sort((a, b) => b.today - a.today || Number(b.average) - Number(a.average));

const returnedWithin = (signup: AdminSignupRow, days: number) =>
	signup.visitDates.some(
		(date) =>
			date > signup.createdDate && date <= dayAfter(signup.createdDate, days)
	);

const returnedNextDay = (signup: AdminSignupRow) =>
	signup.visitDates.includes(dayAfter(signup.createdDate, NEXT_DAY));

const returnShareOf = (
	signups: readonly AdminSignupRow[],
	today: string,
	days: number,
	returned: (signup: AdminSignupRow) => boolean
): string => {
	const measurable = signups.filter(
		(signup) => dayAfter(signup.createdDate, days) <= today
	);
	if (measurable.length === 0) return NO_VALUE;

	const back = measurable.filter(returned).length;
	const share = Math.round((back / measurable.length) * AS_PERCENT);
	return `${back} of ${measurable.length} · ${share}%`;
};

const signupsFor = (dashboard: AdminDashboard): AdminSignups => ({
	days: windowDaysOf(dashboard.today).map((date) => ({
		date,
		count: dashboard.signups.filter((signup) => signup.createdDate === date)
			.length,
	})),
	nextDay: returnShareOf(
		dashboard.signups,
		dashboard.today,
		NEXT_DAY,
		returnedNextDay
	),
	firstWeek: returnShareOf(
		dashboard.signups,
		dashboard.today,
		FIRST_WEEK,
		(signup) => returnedWithin(signup, FIRST_WEEK)
	),
});

const pollPoolFor = (rows: readonly AdminPollPoolRow[]): AdminPollPool[] =>
	rows
		.map((row) => ({
			category: row.categoryCode,
			published: row.published,
			drafts: row.drafts,
			neverDealt: row.neverDealt,
		}))
		.sort(
			(a, b) =>
				a.neverDealt - b.neverDealt || a.category.localeCompare(b.category)
		);

const lastSeenOf = (lastSeenAt: Date | null, today: string): string => {
	if (lastSeenAt === null) return NEVER;
	const days = differenceInCalendarDays(
		new Date(`${today}T12:00:00`),
		lastSeenAt
	);
	return `${days} days ago`;
};

const dormantOf =
	(today: string) =>
	(row: AdminDormantRow): AdminDormant => ({
		id: row.id,
		displayName: row.displayName,
		email: row.email,
		pollsSubmitted: row.pollsSubmitted,
		lastSeen: lastSeenOf(row.lastSeenAt, today),
	});

export const adminPanelDataFor = (
	dashboard: AdminDashboard
): AdminPanelData => ({
	stats: dashboard.stats,
	recentResponses: dashboard.recentResponses.map((response) => ({
		id: response.responseId,
		pollId: response.pollId,
		question: response.question,
		name: response.displayName ?? ANONYMOUS,
		email: response.email,
		at: stampOf(response.createdAt),
	})),
	users: {
		inRun: dashboard.users.filter((user) => user.runId !== null).map(userOf),
		idle: dashboard.users.filter((user) => user.runId === null).map(userOf),
	},
	visits: dashboard.visits.map(visitOf),
	visitBreakdown: visitBreakdownFor(dashboard),
	routeTraffic: routeTrafficFor(dashboard.routeHits, dashboard.today),
	signups: signupsFor(dashboard),
	pollPool: pollPoolFor(dashboard.pollPool),
	dormant: dashboard.dormant.map(dormantOf(dashboard.today)),
});

export const reminderFailureFor = (email: string): string =>
	`Failed to send email to ${email}`;
