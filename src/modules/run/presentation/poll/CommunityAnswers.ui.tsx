import { cva } from "class-variance-authority";
import { Subtitle } from "~/ui/typography/Subtitle.component";

const optionLabel = cva("", {
	variants: {
		correct: {
			true: "font-bold text-viridian",
			false: "text-white",
		},
	},
});

const barFill = cva("block h-full rounded-full", {
	variants: {
		correct: {
			true: "bg-viridian",
			false: "bg-zinc-600",
		},
	},
});

export type CommunityOption = {
	id: string;
	label: string;
	percentage: number;
	correct?: boolean;
	chosen?: boolean;
};

type CommunityAnswersProps = {
	options: readonly CommunityOption[];
	totalVotes: number;
};

const clampPercent = (value: number) => Math.max(0, Math.min(100, value));

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
						<span className={optionLabel({ correct: Boolean(option.correct) })}>
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
							className={barFill({ correct: Boolean(option.correct) })}
							style={{ width: `${clampPercent(option.percentage)}%` }}
						/>
					</span>
				</li>
			))}
		</ul>
	</section>
);
