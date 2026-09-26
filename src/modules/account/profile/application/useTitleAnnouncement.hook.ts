import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
	acknowledgeTitles,
	getTitleAnnouncement,
} from "~/modules/account/profile/application/title.serverfn";
import type { TitleAnnouncement } from "~/modules/account/profile/application/title.service";
import { titleQueryKeys } from "~/shared/queryKeys";

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
