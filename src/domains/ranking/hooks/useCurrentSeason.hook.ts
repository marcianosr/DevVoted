import { useQuery } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";

import { findCurrentSeason } from "../api/season.queries";

const getCurrentSeasonFn = createServerFn().handler(async () => {
	const season = await findCurrentSeason();
	return { success: true, data: season };
});

export const useCurrentSeason = () => {
	return useQuery({
		queryKey: ["season", "current"],
		queryFn: () => getCurrentSeasonFn(),
		staleTime: 1000 * 60 * 5, // 5 minutes
	});
};
