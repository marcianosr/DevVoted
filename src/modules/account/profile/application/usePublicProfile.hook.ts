import { getPublicProfile } from "~/modules/account/profile/application/profile.serverfn";
import { useApiQuery } from "~/shared/hooks/useApiQuery.hook";
import { userQueryKeys } from "~/shared/queryKeys";

export const usePublicProfile = (userId: string | undefined) =>
	useApiQuery({
		queryKey: userQueryKeys.profile(userId ?? ""),
		queryFn: () => getPublicProfile({ data: { userId: userId ?? "" } }),
		enabled: !!userId,
	});
