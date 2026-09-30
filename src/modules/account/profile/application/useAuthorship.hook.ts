import { useQuery } from "@tanstack/react-query";

import { getAuthorship } from "~/modules/account/profile/application/profile.serverfn";
import { userQueryKeys } from "~/shared/queryKeys";

export const useAuthorship = (userId: string) =>
	useQuery({
		queryKey: userQueryKeys.authorship(userId),
		queryFn: async () => {
			const response = await getAuthorship({ data: { userId } });
			if (!response.success) throw new Error(response.error);
			return response.data;
		},
	});
