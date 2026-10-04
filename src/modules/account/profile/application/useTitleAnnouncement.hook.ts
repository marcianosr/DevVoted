import { useQueryClient } from "@tanstack/react-query";

import {
	acknowledgeTitles,
	getTitleAnnouncement,
} from "~/modules/account/profile/application/title.serverfn";
import type { TitleAnnouncement } from "~/modules/account/profile/application/title.service";
import { useApiMutation } from "~/shared/hooks/useApiMutation.hook";
import { useApiQuery } from "~/shared/hooks/useApiQuery.hook";
import { titleQueryKeys } from "~/shared/queryKeys";
import type { ApiResponse } from "~/shared/utils/errorHandling";

const ANNOUNCEMENT_STALE_MS = 1000 * 60 * 30;

const NOTHING_PENDING: ApiResponse<TitleAnnouncement> = {
	success: true,
	data: {
		titleIds: [],
		archivedRunStartedAt: null,
		legacyBonusBytes: null,
	},
};

export const useTitleAnnouncement = (userId: string | undefined) =>
	useApiQuery({
		queryKey: titleQueryKeys.announcement(userId),
		queryFn: () => getTitleAnnouncement(),
		enabled: !!userId,
		staleTime: ANNOUNCEMENT_STALE_MS,
	});

export const useAcknowledgeTitles = (userId: string | undefined) => {
	const queryClient = useQueryClient();

	return useApiMutation({
		mutationFn: (titleIds: readonly string[]) =>
			acknowledgeTitles({ data: { titleIds: [...titleIds] } }),
		onSuccess: (result) => {
			if (!result.success) return;
			queryClient.setQueryData(
				titleQueryKeys.announcement(userId),
				NOTHING_PENDING
			);
		},
	});
};
