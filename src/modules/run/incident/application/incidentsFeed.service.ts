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
	/** Everyone the viewer traded an audit with today, so the climb map can ring them. */
	readonly rivals: readonly string[];
};

/** Everyone's incidents filed today: public, attributable, newest first. */
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
