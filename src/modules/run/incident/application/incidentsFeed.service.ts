import {
	type ApiResponse,
	handleApiOperation,
} from "~/shared/utils/errorHandling";

import {
	type IncidentFeedRowView,
	incidentFeedRowFor,
	rivalIdsFor,
} from "~/modules/run/incident/application/incident.viewmodel";
import { fetchIncidentsForDate } from "~/modules/run/incident/infrastructure/incident.repository";

export type IncidentsFeedView = {
	readonly rows: readonly IncidentFeedRowView[];
	readonly rivals: readonly string[];
};

export const getIncidentsFeedService = async ({
	userId,
	date,
}: {
	userId: string;
	date: string;
}): Promise<ApiResponse<IncidentsFeedView>> =>
	handleApiOperation(async () => {
		const rows = await fetchIncidentsForDate(date);
		return {
			rows: rows.map((row) => incidentFeedRowFor(row, userId)),
			rivals: rivalIdsFor(rows, userId),
		};
	}, "getIncidentsFeed");
