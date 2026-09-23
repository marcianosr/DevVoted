import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";

import { getAllPolls } from "~/modules/polls/poll/application/poll.serverfn";
import { CONFIG_LIST } from "~/modules/run/config/domain/configRoster.model";
import { getCategories } from "~/shared/lib/categories";
import { pollQueryKeys } from "~/shared/queryKeys";
import { FooterUI } from "~/ui/old-theme/FooterUI.component";

declare const __LAST_COMMIT_DATE__: string;

const Footer = () => {
	const { data, isLoading } = useQuery({
		queryKey: pollQueryKeys.list(),
		queryFn: () => getAllPolls(),
		staleTime: 1000 * 60 * 30,
	});

	const pollCount = !isLoading && data?.success ? data.data.length : null;

	return (
		<FooterUI
			pollCount={pollCount}
			isLoading={isLoading}
			categoryCount={getCategories().length}
			configCount={CONFIG_LIST.length}
			lastCommitDate={format(new Date(__LAST_COMMIT_DATE__), "d MMM yyyy")}
		/>
	);
};

export default Footer;
