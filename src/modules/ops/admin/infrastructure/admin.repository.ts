import {
	and,
	asc,
	count,
	countDistinct,
	desc,
	eq,
	gte,
	isNull,
	lt,
	notExists,
	notInArray,
	or,
	sql,
	sum,
} from "drizzle-orm";

import type { PgColumn } from "drizzle-orm/pg-core";

import { db } from "~/database/db";
import {
	appVisitsTable,
	dailyRunPollsTable,
	pollResponsesTable,
	pollsTable,
	runsTable,
	usersTable,
} from "~/database/schema";
import { ADMIN_EMAILS } from "~/shared/utils/adminAuth";

const RECENT_RESPONSES = 20;
const RECENT_VISITS = 100;
const TOP_VALUES = 5;
const DORMANT_SHOWN = 50;

export type AdminResponseRow = {
	readonly responseId: number;
	readonly pollId: number;
	readonly question: string;
	readonly createdAt: Date | null;
	readonly displayName: string | null;
	readonly email: string | null;
};

export type AdminUserRow = {
	readonly id: string;
	readonly displayName: string;
	readonly email: string;
	readonly pollsSubmitted: number;
	readonly runId: number | null;
};

export type AdminVisitRow = {
	readonly id: number;
	readonly visitDate: string;
	readonly visitorHash: string;
	readonly routeId: string;
	readonly hits: number;
	readonly device: string;
	readonly country: string | null;
	readonly referrerHost: string | null;
	readonly firstSeenAt: Date;
	readonly lastSeenAt: Date;
	readonly displayName: string | null;
	readonly photoUrl: string | null;
};

export const fetchRecentResponses = async (): Promise<AdminResponseRow[]> =>
	db
		.select({
			responseId: pollResponsesTable.response_id,
			pollId: pollResponsesTable.poll_id,
			question: pollsTable.question,
			createdAt: pollResponsesTable.created_at,
			displayName: usersTable.display_name,
			email: usersTable.email,
		})
		.from(pollResponsesTable)
		.innerJoin(pollsTable, eq(pollResponsesTable.poll_id, pollsTable.id))
		.leftJoin(usersTable, eq(pollResponsesTable.user_id, usersTable.id))
		.orderBy(desc(pollResponsesTable.created_at))
		.limit(RECENT_RESPONSES);

export const fetchUsersWithActiveRun = async (): Promise<AdminUserRow[]> =>
	db
		.select({
			id: usersTable.id,
			displayName: usersTable.display_name,
			email: usersTable.email,
			pollsSubmitted: usersTable.total_polls_submitted,
			runId: runsTable.id,
		})
		.from(usersTable)
		.leftJoin(
			runsTable,
			and(eq(runsTable.user_id, usersTable.id), eq(runsTable.status, "active"))
		)
		.orderBy(desc(usersTable.total_polls_submitted));

export const countActiveRuns = async (): Promise<number> => {
	const [row] = await db
		.select({ active: count() })
		.from(runsTable)
		.where(eq(runsTable.status, "active"));

	return row?.active ?? 0;
};

export const fetchRecentVisits = async (): Promise<AdminVisitRow[]> =>
	db
		.select({
			id: appVisitsTable.id,
			visitDate: appVisitsTable.visit_date,
			visitorHash: appVisitsTable.visitor_hash,
			routeId: appVisitsTable.route_id,
			hits: appVisitsTable.hits,
			device: appVisitsTable.device,
			country: appVisitsTable.country,
			referrerHost: appVisitsTable.referrer_host,
			firstSeenAt: appVisitsTable.first_seen_at,
			lastSeenAt: appVisitsTable.last_seen_at,
			displayName: usersTable.display_name,
			photoUrl: usersTable.photo_url,
		})
		.from(appVisitsTable)
		.leftJoin(usersTable, eq(appVisitsTable.user_id, usersTable.id))
		.where(isNotAnAdminVisit)
		.orderBy(desc(appVisitsTable.last_seen_at))
		.limit(RECENT_VISITS);

export type AdminVisitDayRow = {
	readonly visitDate: string;
	readonly signedIn: number;
	readonly anonymous: number;
};

export type AdminVisitTopRow = {
	readonly value: string | null;
	readonly visitors: number;
};

export type AdminVisitTops = {
	readonly devices: readonly AdminVisitTopRow[];
	readonly countries: readonly AdminVisitTopRow[];
	readonly referrers: readonly AdminVisitTopRow[];
};

export type AdminRouteHitsRow = {
	readonly routeId: string;
	readonly visitDate: string;
	readonly hits: number;
};

export type AdminSignupRow = {
	readonly id: string;
	readonly displayName: string;
	readonly createdDate: string;
	readonly visitDates: readonly string[];
};

export type AdminPollPoolRow = {
	readonly categoryCode: string;
	readonly published: number;
	readonly drafts: number;
	readonly neverDealt: number;
};

export type AdminDormantRow = {
	readonly id: string;
	readonly displayName: string;
	readonly email: string;
	readonly pollsSubmitted: number;
	readonly lastSeenAt: Date | null;
};

const isNotAnAdmin = notInArray(usersTable.email, [...ADMIN_EMAILS]);
const isNotAnAdminVisit = or(isNull(usersTable.email), isNotAnAdmin);

const visitsSince = (since: string) =>
	db
		.select({
			visitDate: appVisitsTable.visit_date,
			visitorHash: appVisitsTable.visitor_hash,
			routeId: appVisitsTable.route_id,
			userId: appVisitsTable.user_id,
			hits: appVisitsTable.hits,
			device: appVisitsTable.device,
			country: appVisitsTable.country,
			referrerHost: appVisitsTable.referrer_host,
		})
		.from(appVisitsTable)
		.leftJoin(usersTable, eq(appVisitsTable.user_id, usersTable.id))
		.where(and(gte(appVisitsTable.visit_date, since), isNotAnAdminVisit))
		.as("visits");

export const fetchVisitDays = async (
	since: string
): Promise<AdminVisitDayRow[]> => {
	const visits = visitsSince(since);

	return db
		.select({
			visitDate: visits.visitDate,
			signedIn:
				sql<number>`count(distinct ${visits.visitorHash}) filter (where ${visits.userId} is not null)`.mapWith(
					Number
				),
			anonymous:
				sql<number>`count(distinct ${visits.visitorHash}) filter (where ${visits.userId} is null)`.mapWith(
					Number
				),
		})
		.from(visits)
		.groupBy(visits.visitDate)
		.orderBy(desc(visits.visitDate));
};

const fetchTopVisitValues = async (
	since: string,
	value: PgColumn
): Promise<AdminVisitTopRow[]> =>
	db
		.select({
			value: sql<string | null>`${value}`,
			visitors: countDistinct(appVisitsTable.visitor_hash),
		})
		.from(appVisitsTable)
		.leftJoin(usersTable, eq(appVisitsTable.user_id, usersTable.id))
		.where(and(gte(appVisitsTable.visit_date, since), isNotAnAdminVisit))
		.groupBy(value)
		.orderBy(desc(countDistinct(appVisitsTable.visitor_hash)))
		.limit(TOP_VALUES);

export const fetchVisitTops = async (
	since: string
): Promise<AdminVisitTops> => {
	const [devices, countries, referrers] = await Promise.all([
		fetchTopVisitValues(since, appVisitsTable.device),
		fetchTopVisitValues(since, appVisitsTable.country),
		fetchTopVisitValues(since, appVisitsTable.referrer_host),
	]);

	return { devices, countries, referrers };
};

export const fetchRouteHits = async (
	since: string
): Promise<AdminRouteHitsRow[]> => {
	const visits = visitsSince(since);

	return db
		.select({
			routeId: visits.routeId,
			visitDate: visits.visitDate,
			hits: sum(visits.hits).mapWith(Number),
		})
		.from(visits)
		.groupBy(visits.routeId, visits.visitDate);
};

export const fetchSignups = async (since: Date): Promise<AdminSignupRow[]> =>
	db
		.select({
			id: usersTable.id,
			displayName: usersTable.display_name,
			createdDate: sql<string>`to_char(${usersTable.created_at}, 'YYYY-MM-DD')`,
			visitDates: sql<
				string[]
			>`coalesce(array_agg(distinct ${appVisitsTable.visit_date}::text) filter (where ${appVisitsTable.visit_date} is not null), '{}')`,
		})
		.from(usersTable)
		.leftJoin(appVisitsTable, eq(appVisitsTable.user_id, usersTable.id))
		.where(and(gte(usersTable.created_at, since), isNotAnAdmin))
		.groupBy(usersTable.id, usersTable.display_name, usersTable.created_at)
		.orderBy(desc(usersTable.created_at));

const isDealt = (pollId: PgColumn) =>
	db
		.select({ pollId: dailyRunPollsTable.poll_id })
		.from(dailyRunPollsTable)
		.where(eq(dailyRunPollsTable.poll_id, pollId));

export const fetchPollPool = async (): Promise<AdminPollPoolRow[]> =>
	db
		.select({
			categoryCode: pollsTable.category_code,
			published:
				sql<number>`count(*) filter (where ${pollsTable.status} = 'published')`.mapWith(
					Number
				),
			drafts:
				sql<number>`count(*) filter (where ${pollsTable.status} = 'draft')`.mapWith(
					Number
				),
			neverDealt:
				sql<number>`count(*) filter (where ${pollsTable.status} = 'published' and ${notExists(isDealt(pollsTable.id))})`.mapWith(
					Number
				),
		})
		.from(pollsTable)
		.groupBy(pollsTable.category_code)
		.orderBy(asc(pollsTable.category_code));

export const fetchDormantUsers = async (
	seenBefore: Date
): Promise<AdminDormantRow[]> =>
	db
		.select({
			id: usersTable.id,
			displayName: usersTable.display_name,
			email: usersTable.email,
			pollsSubmitted: usersTable.total_polls_submitted,
			lastSeenAt: usersTable.last_seen_at,
		})
		.from(usersTable)
		.where(
			and(
				or(
					isNull(usersTable.last_seen_at),
					lt(usersTable.last_seen_at, seenBefore)
				),
				isNotAnAdmin
			)
		)
		.orderBy(sql`${usersTable.last_seen_at} desc nulls last`)
		.limit(DORMANT_SHOWN);
