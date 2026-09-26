import { createServerFn } from "@tanstack/react-start";

import { getTodayDateString } from "~/shared/lib/dateUtils";
import { withAuthenticatedUser } from "~/shared/utils/authorization";

import { getAttackTargetsService } from "~/modules/run/incident/application/attackTargets.service";
import { fireAuditService } from "~/modules/run/incident/application/fireAudit.service";
import { fireAuditSchema } from "~/modules/run/incident/application/incident.validation";
import { getIncidentsFeedService } from "~/modules/run/incident/application/incidentsFeed.service";

export const getAttackTargets = createServerFn({ method: "GET" }).handler(
	async () =>
		withAuthenticatedUser((userId) =>
			getAttackTargetsService({ userId, date: getTodayDateString() })
		)
);

export const fireAudit = createServerFn({ method: "POST" })
	.validator(fireAuditSchema)
	.handler(async ({ data }) =>
		withAuthenticatedUser((userId) =>
			fireAuditService({ userId, date: getTodayDateString(), ...data })
		)
	);

export const getIncidentsFeed = createServerFn({ method: "GET" }).handler(
	async () =>
		withAuthenticatedUser((userId) =>
			getIncidentsFeedService({ userId, date: getTodayDateString() })
		)
);
