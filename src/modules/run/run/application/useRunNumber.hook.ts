import { sessionRunQueryKeys } from "~/shared/queryKeys";
import { useApiQuery } from "~/shared/hooks/useApiQuery.hook";
import { getRunNumber } from "~/modules/run/run/application/run.serverfn";

export const useRunNumber = () =>
	useApiQuery<number>({
		queryKey: sessionRunQueryKeys.runNumber(),
		queryFn: () => getRunNumber(),
	});
