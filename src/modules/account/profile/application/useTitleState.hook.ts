import { getTitleState } from "~/modules/account/profile/application/title.serverfn";
import { useApiQuery } from "~/shared/hooks/useApiQuery.hook";
import { titleQueryKeys } from "~/shared/queryKeys";

export const useTitleState = (userId: string | undefined) =>
	useApiQuery({
		queryKey: titleQueryKeys.state(userId),
		queryFn: () => getTitleState(),
		enabled: !!userId,
	});
