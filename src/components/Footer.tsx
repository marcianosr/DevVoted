import { useQuery } from "@tanstack/react-query";

import { getAllPolls } from "~/domains/polls/api/polls";
import PollCategoryCount from "~/domains/polls/components/PollCategoryCount";

const Footer = () => {
	const { data, error, isLoading } = useQuery({
		queryKey: ["all-polls"],
		queryFn: () => getAllPolls(),
		staleTime: 1000 * 60 * 5, // Cache for 5 min
	});

	return (
		<footer className="p-4 mt-auto bg-zinc-900 text-center text-white">
			{!isLoading && !error && data?.success && (
				<div className="flex justify-center">
					<PollCategoryCount polls={data.data || []} />
				</div>
			)}
			<hr className="border-theme my-4" />
			<p>
				A crazy roguelike obsession build with craftsmanship, passion, ❤️ &
				Tanstack Start by Marciano Schildmeijer | EST may 2022
			</p>
			<p className="mt-2 text-zinc-400">
				Found a bug?{" "}
				<a
					href="https://github.com/marcianosr/DevVoted/issues"
					target="_blank"
					rel="noopener noreferrer"
					className="text-blue-400 hover:text-blue-300 underline"
				>
					Report it on GitHub
				</a>
			</p>
		</footer>
	);
};
export default Footer;
