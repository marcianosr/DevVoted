import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";

import { getAllPolls } from "~/modules/polls/poll/application/poll.serverfn";
import { CONFIG_LIST } from "~/modules/run/config/domain/configRoster.model";
import { getCategories } from "~/shared/lib/categories";
import { pollQueryKeys } from "~/shared/queryKeys";
import { AppFooter } from "~/ui/kanto-theme/AppFooter.ui";

declare const __LAST_COMMIT_DATE__: string;

export const Footer = () => {
	const { data, isLoading } = useQuery({
		queryKey: pollQueryKeys.list(),
		queryFn: () => getAllPolls(),
		staleTime: 1000 * 60 * 30,
	});

	const pollCount = !isLoading && data?.success ? data.data.length : null;

	return (
		<AppFooter
			pollCount={pollCount}
			categoryCount={getCategories().length}
			configCount={CONFIG_LIST.length}
			lastCommitDate={format(new Date(__LAST_COMMIT_DATE__), "d MMM yyyy")}
		/>
	);
};
