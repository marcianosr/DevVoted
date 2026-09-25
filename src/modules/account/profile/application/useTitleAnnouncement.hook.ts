import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
	acknowledgeTitles,
	getTitleAnnouncement,
} from "~/modules/account/profile/application/title.serverfn";
import type { TitleAnnouncement } from "~/modules/account/profile/application/title.service";
import { titleQueryKeys } from "~/shared/queryKeys";

/**
 * A grant is dealt by a migration and a title settles at run end, so the answer
 * changes at most a handful of times in an account's life. Mounted on every
 * authenticated screen, this would otherwise re-ask on every navigation.
 */
const ANNOUNCEMENT_STALE_MS = 1000 * 60 * 30;

const NOTHING_PENDING: TitleAnnouncement = {
	titleIds: [],
	archivedRunStartedAt: null,
};

export const useTitleAnnouncement = (userId: string | undefined) =>
	useQuery({
		queryKey: titleQueryKeys.announcement(userId),
		queryFn: async () => {
			const response = await getTitleAnnouncement();
			if (!response.success) throw new Error(response.error);
			return response.data;
		},
		enabled: !!userId,
		staleTime: ANNOUNCEMENT_STALE_MS,
	});

/**
 * The stamp is the authority, so the cache is written straight to empty rather
 * than invalidated: a refetch would leave the notice on screen for a round trip
 * after the player closed it.
 */
export const useAcknowledgeTitles = (userId: string | undefined) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (titleIds: readonly string[]) => {
			const response = await acknowledgeTitles({
				data: { titleIds: [...titleIds] },
			});
			if (!response.success) throw new Error(response.error);
			return response.data;
		},
		onSuccess: () => {
			queryClient.setQueryData(
				titleQueryKeys.announcement(userId),
				NOTHING_PENDING
			);
		},
	});
};
