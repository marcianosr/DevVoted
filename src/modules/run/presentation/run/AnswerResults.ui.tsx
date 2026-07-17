import { cva } from "class-variance-authority";
import type {
	AnswerOutcome,
	AnsweredPoll,
} from "~/modules/run/climb/run.model";
import { getCategoryMetadata } from "~/domains/shared/categories";
import { categoryTheme } from "~/ui/theme/categoryTheme";
import { Paragraph } from "~/ui/typography/Paragraph.component";
import { Title } from "~/ui/typography/Title.component";

type AnswerResultsProps = {
	answered: readonly AnsweredPoll[];
};

const OUTCOME_MARKERS: Record<AnswerOutcome, string> = {
	correct: "✓",
	partial: "◐",
	wrong: "✕",
};

const resultRow = cva("flex items-center gap-3 px-4 py-3", {
	variants: {
		outcome: {
			correct: "bg-celadon/10",
			partial: "bg-saffron/10",
			wrong: "bg-cinnabar/10",
		} satisfies Record<AnswerOutcome, string>,
	},
});

const resultText = cva("shrink-0 font-bold", {
	variants: {
		outcome: {
			correct: "text-celadon",
			partial: "text-saffron",
			wrong: "text-cinnabar",
		} satisfies Record<AnswerOutcome, string>,
	},
});

export const AnswerResults = ({ answered }: AnswerResultsProps) => (
	<section className="flex flex-col gap-2">
		<Title size="sm">Your answers</Title>
		<ul className="divide-y divide-zinc-800 overflow-hidden rounded-xl border border-zinc-700">
			{answered.map((poll, index) => (
				<li
					key={`${poll.id}-${index}`}
					className={resultRow({ outcome: poll.outcome })}
				>
					<span className={resultText({ outcome: poll.outcome })}>
						{OUTCOME_MARKERS[poll.outcome]}
					</span>
					<span
						{...categoryTheme(poll.category)}
						className="flex shrink-0 items-center gap-1.5 font-bold text-theme"
					>
						<span className="inline-block h-3.5 w-3.5 rounded bg-theme" />
						{getCategoryMetadata(poll.category).name}
					</span>
					<Paragraph size="sm" className="min-w-0 truncate font-black">
						{poll.question}
					</Paragraph>
					<span
						className={`ml-auto min-w-0 max-w-[40%] truncate text-right text-xs ${resultText(
							{ outcome: poll.outcome }
						)}`}
					>
						{poll.picked.join(", ")}
					</span>
				</li>
			))}
		</ul>
	</section>
);
