import {
	type ApiResponse,
	handleApiOperation,
} from "~/shared/utils/errorHandling";

import {
	type IncidentFeedRowView,
	incidentFeedRowFor,
} from "~/modules/run/incident/application/incident.viewmodel";
import { fetchIncidentsForDate } from "~/modules/run/incident/infrastructure/incident.repository";

export type IncidentsFeedView = {
	readonly rows: readonly IncidentFeedRowView[];
};

/** Everyone's incidents filed today: public, attributable, newest first. */
export const getIncidentsFeedService = async ({
	userId,
	date,
}: {
	userId: string;
	date: string;
}): Promise<ApiResponse<IncidentsFeedView>> =>
	handleApiOperation(
		async () => ({
			rows: (await fetchIncidentsForDate(date)).map((row) =>
				incidentFeedRowFor(row, userId)
			),
		}),
		"getIncidentsFeed"
	);
