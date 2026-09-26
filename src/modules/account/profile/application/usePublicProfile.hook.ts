import { useQuery } from "@tanstack/react-query";

import { getPublicProfile } from "~/modules/account/profile/application/profile.serverfn";
import { userQueryKeys } from "~/shared/queryKeys";

export const usePublicProfile = (userId: string | undefined) =>
	useQuery({
		queryKey: userQueryKeys.profile(userId ?? ""),
		queryFn: async () => {
			const response = await getPublicProfile({
				data: { userId: userId ?? "" },
			});
			if (!response.success) throw new Error(response.error);
			return response.data;
		},
		enabled: !!userId,
	});
