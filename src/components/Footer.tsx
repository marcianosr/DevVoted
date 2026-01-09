import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";

import { configs } from "~/domains/configs/data/configs";
import { getAllPolls } from "~/domains/polls/api/polls";
import { getCategories } from "~/domains/shared/categories";

const Footer = () => {
	const { data, error, isLoading } = useQuery({
		queryKey: ["all-polls"],
		queryFn: () => getAllPolls(),
		staleTime: 1000 * 60 * 30, // Cache for 30 min
	});

	return (
		<footer className="p-4 mt-auto bg-zinc-900 text-white flex flex-col items-center">
			<section className="flex gap-2 items-center">
				{!isLoading && !error && data?.success && (
					<div>{data.data.length} polls</div>
				)}
				<span>·</span>
				<div>{getCategories().length} categories</div>
				<span>·</span>
				<div>{configs.length} configs</div>
				<span>·</span>
				<Link to="/stats" className="underline">
					See all game info stats
				</Link>
			</section>

			<hr className="border-theme my-4" />
			<section className="">
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
			</section>
		</footer>
	);
};
export default Footer;
