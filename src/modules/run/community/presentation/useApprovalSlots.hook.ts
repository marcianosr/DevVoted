import { sessionRunQueryKeys } from "~/shared/queryKeys";
import { useApiQuery } from "~/shared/hooks/useApiQuery.hook";

import type { ApprovalBoard } from "~/modules/run/run/domain/approval.model";
import { getApprovalSlots } from "~/modules/run/community/application/community.serverfn";

export const useApprovalSlots = (installed: boolean) => {
	const result = useApiQuery<ApprovalBoard>({
		queryKey: sessionRunQueryKeys.todaysApprovalSlots(),
		queryFn: () => getApprovalSlots(),
		enabled: installed,
	});

	return result.view ?? null;
};
