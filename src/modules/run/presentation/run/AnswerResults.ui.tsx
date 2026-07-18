import { useState } from "react";

import type { AnsweredPoll } from "~/modules/run/climb/run.model";
import { getCategoryMetadata } from "~/domains/shared/categories";
import { Swatch } from "~/ui/Swatch.component";
import { categoryTheme } from "~/ui/theme/categoryTheme";
import { Title } from "~/ui/typography/Title.component";
import { OutcomeTile, outcomeText } from "../poll/OutcomeTile.ui";

type AnswerResultsProps = {
	answered: readonly AnsweredPoll[];
};

const ExpandedAnswer = ({
	poll,
	index,
}: {
	poll: AnsweredPoll;
	index: number;
}) => (
	<div className="space-y-3 rounded-md border border-zinc-700 bg-zinc-900/60 p-6 font-mono">
		<div className="flex items-baseline gap-3">
			<h3 className={`text-lg ${outcomeText({ outcome: poll.outcome })}`}>
				Poll {index + 1}
			</h3>
			<span
				{...categoryTheme(poll.category)}
				className="flex items-center gap-1.5 font-bold text-theme"
			>
				<Swatch size="sm" />
				{getCategoryMetadata(poll.category).name}
			</span>
		</div>
		<p className="text-zinc-100">{poll.question}</p>
		<p className={outcomeText({ outcome: poll.outcome })}>
			You picked: “{poll.picked.join("”, “")}”
		</p>
	</div>
);

export const AnswerResults = ({ answered }: AnswerResultsProps) => {
	const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

	return (
		<section className="space-y-4">
			<Title size="sm">Your answers</Title>
			<div className="flex flex-wrap gap-2">
				{answered.map((poll, index) => (
					<OutcomeTile
						key={`${poll.id}-${index}`}
						title={`Poll ${index + 1}`}
						subtitle={getCategoryMetadata(poll.category).name}
						outcome={poll.outcome}
						expanded={expandedIndex === index}
						onClick={() =>
							setExpandedIndex(expandedIndex === index ? null : index)
						}
					/>
				))}
			</div>
			{expandedIndex !== null && answered[expandedIndex] ? (
				<ExpandedAnswer poll={answered[expandedIndex]} index={expandedIndex} />
			) : null}
		</section>
	);
};
