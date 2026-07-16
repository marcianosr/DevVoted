import { Subtitle } from "~/ui/typography/Subtitle.component";

export type CommunityOption = {
	id: string;
	label: string;
	/** Share of the community that picked this option, 0–100. */
	percentage: number;
	/** The server-judged correct option. */
	correct?: boolean;
	/** The option this player picked. */
	chosen?: boolean;
};

type CommunityAnswersProps = {
	options: readonly CommunityOption[];
	totalVotes: number;
};

const clampPercent = (value: number) => Math.max(0, Math.min(100, value));

/** Post-answer reveal of what the community chose, one bar per option. */
export const CommunityAnswers = ({
	options,
	totalVotes,
}: CommunityAnswersProps) => (
	<section className="flex flex-col gap-2">
		<Subtitle>What the community chose · {totalVotes} answers</Subtitle>
		<ul className="flex flex-col gap-2">
			{options.map((option) => (
				<li key={option.id} className="flex flex-col gap-1">
					<span className="flex items-baseline justify-between gap-2 text-sm">
						<span
							className={
								option.correct ? "font-bold text-viridian" : "text-white"
							}
						>
							{option.label}
							{option.chosen ? (
								<span className="ml-2 text-xs text-zinc-400">you</span>
							) : null}
						</span>
						<span className="shrink-0 tabular-nums text-zinc-400">
							{option.percentage}%
						</span>
					</span>
					<span className="h-2 w-full overflow-hidden rounded-full bg-zinc-800">
						<span
							className={`block h-full rounded-full ${option.correct ? "bg-viridian" : "bg-zinc-600"}`}
							style={{ width: `${clampPercent(option.percentage)}%` }}
						/>
					</span>
				</li>
			))}
		</ul>
	</section>
);
