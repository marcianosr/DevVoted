import { useQueryClient } from "@tanstack/react-query";

import {
	acknowledgePollApprovals,
	getPollApprovalNotice,
} from "~/modules/polls/authoring/application/authoring.serverfn";
import type { ApprovalNotice } from "~/modules/polls/authoring/application/authoring.service";
import { useApiMutation } from "~/shared/hooks/useApiMutation.hook";
import { useApiQuery } from "~/shared/hooks/useApiQuery.hook";
import { pollQueryKeys } from "~/shared/queryKeys";
import type { ApiResponse } from "~/shared/utils/errorHandling";

const NOTICE_STALE_MS = 1000 * 60 * 30;

const NOTHING_APPROVED: ApiResponse<ApprovalNotice> = {
	success: true,
	data: { polls: [] },
};

export const usePollApprovalNotice = (userId: string | undefined) =>
	useApiQuery({
		queryKey: pollQueryKeys.approvalNotice(userId),
		queryFn: () => getPollApprovalNotice(),
		enabled: !!userId,
		staleTime: NOTICE_STALE_MS,
	});

export const useAcknowledgePollApprovals = (userId: string | undefined) => {
	const queryClient = useQueryClient();

	return useApiMutation({
		mutationFn: (pollIds: readonly number[]) =>
			acknowledgePollApprovals({ data: { pollIds: [...pollIds] } }),
		onSuccess: (result) => {
			if (!result.success) return;
			queryClient.setQueryData(
				pollQueryKeys.approvalNotice(userId),
				NOTHING_APPROVED
			);
		},
	});
};
