import { isKnownRouteId } from "~/modules/ops/pulse/domain/visit.model";
import { upsertVisit } from "~/modules/ops/pulse/infrastructure/visit.repository";
import {
	isSameOrigin,
	readRequestFacts,
	visitorContextOf,
} from "~/modules/ops/pulse/infrastructure/visitor.repository";
import { findAuthenticatedUserId } from "~/shared/utils/authorization";
import { reportHandledFailure } from "~/shared/utils/errorReporting";

/**
 * Counts one visitor's screen. Every rejection is silent and every failure is
 * swallowed: this hangs off the root route's beforeLoad, so it runs on every
 * navigation the app serves and must never be able to slow one down, break one,
 * or tell a caller anything about itself.
 */
export const recordVisitService = async (args: {
	routeId: string;
	date: string;
}): Promise<void> => {
	try {
		if (!isKnownRouteId(args.routeId)) return;

		const facts = readRequestFacts();
		if (!isSameOrigin(facts)) return;

		const context = visitorContextOf(args.date, facts);
		if (!context) return;

		await upsertVisit({
			date: args.date,
			routeId: args.routeId,
			userId: await findAuthenticatedUserId(),
			visitorHash: context.visitorHash,
			device: context.device,
			country: context.country,
			referrerHost: context.referrerHost,
		});
	} catch (error) {
		reportHandledFailure(error, "recordVisit", { routeId: args.routeId });
	}
};
