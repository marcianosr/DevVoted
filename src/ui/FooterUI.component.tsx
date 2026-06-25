import { ReactNode } from "react";

type FooterUIProps = {
	pollCount: number | null;
	isLoading: boolean;
	categoryCount: number;
	configCount: number;
	lastCommitDate: string;
	statsLink: ReactNode;
};

export const FooterUI = ({
	pollCount,
	isLoading,
	categoryCount,
	configCount,
	lastCommitDate,
	statsLink,
}: FooterUIProps) => (
	<footer className="p-4 mt-auto bg-zinc-900 text-white flex flex-col items-center">
		<section className="flex gap-2 items-center">
			{!isLoading && pollCount !== null && <div>{pollCount} polls</div>}
			<span>·</span>
			<div>{categoryCount} categories</div>
			<span>·</span>
			<div>{configCount} configs</div>
			<span>·</span>
			{statsLink}
		</section>

		<hr className="border-theme my-4" />
		<section>
			<p>
				A crazy roguelite obsession build with craftsmanship, passion, ❤️ &
				Tanstack Start by Marciano Schildmeijer | EST may 2022 | Last updated:{" "}
				{lastCommitDate}
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
