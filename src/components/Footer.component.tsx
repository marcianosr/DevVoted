import { useNavigate } from "@tanstack/react-router";
import { format } from "date-fns";

import { getPublishedPollCount } from "~/modules/polls/poll/application/poll.serverfn";
import { CONFIG_LIST } from "~/modules/run/config/domain/configRoster.model";
import { useApiQuery } from "~/shared/hooks/useApiQuery.hook";
import { getCategories } from "~/shared/lib/categories";
import { pollQueryKeys } from "~/shared/queryKeys";
import { AppFooter } from "~/ui/kanto-theme/AppFooter.ui";

declare const __LAST_COMMIT_DATE__: string;
declare const __LAST_COMMIT_AUTHOR__: string;

export const Footer = () => {
	const navigate = useNavigate();
	const { view: pollCount } = useApiQuery({
		queryKey: pollQueryKeys.publishedCount(),
		queryFn: () => getPublishedPollCount(),
		staleTime: 1000 * 60 * 30,
	});

	return (
		<AppFooter
			pollCount={pollCount}
			categoryCount={getCategories().length}
			configCount={CONFIG_LIST.length}
			lastCommitDate={format(new Date(__LAST_COMMIT_DATE__), "d MMM yyyy")}
			lastCommitAuthor={__LAST_COMMIT_AUTHOR__}
			onNavigate={(href) => navigate({ href })}
		/>
	);
};
