import { format } from "date-fns";

import type {
	AdminDashboard,
	ReminderRecipient,
} from "~/modules/ops/admin/application/admin.service";
import type {
	AdminUserRow,
	AdminVisitRow,
} from "~/modules/ops/admin/infrastructure/admin.repository";

const STAMP_FORMAT = "MM/dd/yyyy HH:mm:ss";
const NO_VALUE = "—";
const ANONYMOUS = "Anonymous";
const DATE_JOIN = ", ";

export type AdminUser = ReminderRecipient & {
	readonly id: string;
	readonly pollsSubmitted: number;
};

export type AdminPanelData = {
	readonly stats: AdminDashboard["stats"];
	readonly activePolls: readonly {
		readonly id: number;
		readonly question: string;
		readonly category: string;
		readonly opens: string;
		readonly closes: string;
	}[];
	readonly recentResponses: readonly {
		readonly id: number;
		readonly pollId: number;
		readonly question: string;
		readonly name: string;
		readonly email: string | null;
		readonly at: string;
	}[];
	readonly pastPolls: readonly {
		readonly pollId: number;
		readonly question: string;
		readonly category: string;
		readonly occurrences: number;
		readonly lastShown: string;
		readonly allDates: string;
	}[];
	readonly users: {
		readonly inRun: readonly AdminUser[];
		readonly idle: readonly AdminUser[];
	};
	readonly visits: readonly AdminVisit[];
};

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

export const adminPanelDataFor = (
	dashboard: AdminDashboard
): AdminPanelData => ({
	stats: dashboard.stats,
	activePolls: dashboard.activePolls.map((poll) => ({
		id: poll.id,
		question: poll.question,
		category: poll.categoryCode,
		opens: stampOf(poll.openingTime),
		closes: stampOf(poll.closingTime),
	})),
	recentResponses: dashboard.recentResponses.map((response) => ({
		id: response.responseId,
		pollId: response.pollId,
		question: response.question,
		name: response.displayName ?? ANONYMOUS,
		email: response.email,
		at: stampOf(response.createdAt),
	})),
	pastPolls: dashboard.pastPolls.map((poll) => ({
		pollId: poll.pollId,
		question: poll.question,
		category: poll.categoryCode,
		occurrences: poll.occurrences,
		lastShown: poll.lastDate,
		allDates: poll.allDates.join(DATE_JOIN),
	})),
	users: {
		inRun: dashboard.users.filter((user) => user.runId !== null).map(userOf),
		idle: dashboard.users.filter((user) => user.runId === null).map(userOf),
	},
	visits: dashboard.visits.map(visitOf),
});

export const reminderFailureFor = (email: string): string =>
	`Failed to send email to ${email}`;
