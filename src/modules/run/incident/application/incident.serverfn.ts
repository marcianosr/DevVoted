import { createServerFn } from "@tanstack/react-start";

import { getTodayDateString } from "~/shared/lib/dateUtils";
import { withAuthenticatedUser } from "~/shared/utils/authorization";

import { getAttackTargetsService } from "~/modules/run/incident/application/attackTargets.service";
import { fireAuditService } from "~/modules/run/incident/application/fireAudit.service";
import { fireAuditSchema } from "~/modules/run/incident/application/incident.validation";
import { getIncidentsFeedService } from "~/modules/run/incident/application/incidentsFeed.service";

/** The armed attack and the three rivals it may be aimed at, dealt for today. */
export const getAttackTargets = createServerFn({ method: "GET" }).handler(
	async () =>
		withAuthenticatedUser((userId) =>
			getAttackTargetsService({ userId, date: getTodayDateString() })
		)
);

/** Spends the armed attack on one offered pair. The attacker is the session, never the payload. */
export const fireAudit = createServerFn({ method: "POST" })
	.validator(fireAuditSchema)
	.handler(async ({ data }) =>
		withAuthenticatedUser((userId) =>
			fireAuditService({ userId, date: getTodayDateString(), ...data })
		)
	);

/** Everyone's incidents filed today. */
export const getIncidentsFeed = createServerFn({ method: "GET" }).handler(
	async () =>
		withAuthenticatedUser((userId) =>
			getIncidentsFeedService({ userId, date: getTodayDateString() })
		)
);
