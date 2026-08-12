import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { format } from "date-fns";

import { configs } from "~/domains/economy/data/configs";
import { getAllPolls } from "~/domains/polls/api/polls";
import { getCategories } from "~/shared/lib/categories";
import { FooterUI } from "~/ui/FooterUI.component";

declare const __LAST_COMMIT_DATE__: string;

const Footer = () => {
	const { data, isLoading } = useQuery({
		queryKey: ["all-polls"],
		queryFn: () => getAllPolls(),
		staleTime: 1000 * 60 * 30,
	});

	const pollCount = !isLoading && data?.success ? data.data.length : null;

	return (
		<FooterUI
			pollCount={pollCount}
			isLoading={isLoading}
			categoryCount={getCategories().length}
			configCount={configs.length}
			lastCommitDate={format(new Date(__LAST_COMMIT_DATE__), "d MMM yyyy")}
			statsLink={
				<Link to="/stats" className="underline">
					See all game info stats
				</Link>
			}
		/>
	);
};

export default Footer;
