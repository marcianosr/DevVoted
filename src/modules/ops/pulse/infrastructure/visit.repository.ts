import { sql } from "drizzle-orm";

import { db } from "~/database/db";
import { appVisitsTable } from "~/database/schema";

import type { Visit } from "~/modules/ops/pulse/domain/visit.model";

/**
 * A ceiling, not a rate limit: the unique key already caps an abusive client to
 * one row per screen per day, and this stops that handful of rows carrying a
 * number big enough to skew the funnel.
 */
const MAX_DAILY_HITS = 500;

/**
 * One row per visitor per day per screen. `coalesce(excluded.user_id, …)` is
 * what makes the sign-in visible: the row is born anonymous on `/login` and is
 * upgraded the moment a session appears on that same screen the same day, and
 * never downgraded back to null by a later signed-out hit.
 */
export const upsertVisit = async (visit: Visit): Promise<void> => {
	await db
		.insert(appVisitsTable)
		.values({
			visit_date: visit.date,
			visitor_hash: visit.visitorHash,
			route_id: visit.routeId,
			user_id: visit.userId,
			device: visit.device,
			country: visit.country,
			referrer_host: visit.referrerHost,
		})
		.onConflictDoUpdate({
			target: [
				appVisitsTable.visit_date,
				appVisitsTable.visitor_hash,
				appVisitsTable.route_id,
			],
			set: {
				hits: sql`least(${appVisitsTable.hits} + 1, ${MAX_DAILY_HITS})`,
				last_seen_at: sql`now()`,
				user_id: sql`coalesce(excluded.user_id, ${appVisitsTable.user_id})`,
			},
		});
};
