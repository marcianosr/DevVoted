import { getTodayDateString } from "~/shared/lib/dateUtils";
import { sessionRunQueryKeys } from "~/shared/queryKeys";
import { useApiQuery } from "~/shared/hooks/useApiQuery.hook";

import type { ApprovalBoard } from "~/modules/run/run/domain/approval.model";
import { getApprovalSlots } from "~/modules/run/community/application/community.serverfn";

export const approvalSlotsQueryKey = () =>
	sessionRunQueryKeys.approvalSlots(getTodayDateString());

export const useApprovalSlots = (installed: boolean) => {
	const result = useApiQuery<ApprovalBoard>({
		queryKey: approvalSlotsQueryKey(),
		queryFn: () => getApprovalSlots(),
		enabled: installed,
	});

	return result.view ?? null;
};
