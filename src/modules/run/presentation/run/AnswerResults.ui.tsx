import { useState } from "react";

import type {
	AnswerOutcome,
	AnsweredPoll,
} from "~/modules/run/climb/run.model";
import { getCategoryMetadata } from "~/domains/shared/categories";
import { Button } from "~/ui/Button.component";
import { Swatch } from "~/ui/Swatch.component";
import { categoryTheme } from "~/ui/theme/categoryTheme";
import {
	Paragraph,
	type ParagraphTone,
} from "~/ui/typography/Paragraph.component";
import { Title } from "~/ui/typography/Title.component";
import { OutcomeTile, outcomeText } from "../poll/OutcomeTile.ui";
import { ANSWER_TYPE_HINT } from "../poll/PollCard.ui";
import { PollOptionReview } from "../poll/PollOptionReview.ui";

const OUTCOME_TONE: Record<AnswerOutcome, ParagraphTone> = {
	correct: "viridian",
	partial: "saffron",
	wrong: "cinnabar",
};

type AnswerResultsProps = {
	answered: readonly AnsweredPoll[];
};

const ExplanationBox = ({ explanation }: { explanation: string }) => (
	<div className="space-y-2 rounded-md border border-zinc-700 px-4 py-3">
		<Paragraph tone="lavender" className="font-bold">
			💡 Explanation
		</Paragraph>
		<Paragraph size="sm" tone="muted">
			{explanation}
		</Paragraph>
	</div>
);

const ExpandedAnswer = ({
	poll,
	index,
}: {
	poll: AnsweredPoll;
	index: number;
}) => (
	<div className="space-y-4 rounded-md border border-zinc-700 bg-zinc-900/60 p-6">
		<div className="flex items-baseline gap-3">
			<Paragraph
				as="span"
				size="sm"
				tone={OUTCOME_TONE[poll.outcome]}
				className="font-bold"
			>
				Poll {index + 1}
			</Paragraph>
			<span
				{...categoryTheme(poll.category)}
				className="flex items-center gap-1.5"
			>
				<Swatch size="sm" />
				<Paragraph as="span" size="sm" tone="theme" className="font-bold">
					{getCategoryMetadata(poll.category).name}
				</Paragraph>
			</span>
		</div>
		<div className="space-y-1">
			<Title as="h3" size="sm">
				{poll.question}
			</Title>
			{poll.answerType ? (
				<Paragraph tone="pewter">{ANSWER_TYPE_HINT[poll.answerType]}</Paragraph>
			) : null}
		</div>

		<PollOptionReview
			options={poll.options ?? poll.picked}
			picked={poll.picked}
			correct={poll.correct}
			answerType={poll.answerType}
			outcome={poll.outcome}
		/>

		{poll.explanation ? (
			<ExplanationBox explanation={poll.explanation} />
		) : null}
	</div>
);

const OUTCOME_SUMMARY = [
	{ outcome: "correct", label: "correct" },
	{ outcome: "partial", label: "partial" },
	{ outcome: "wrong", label: "incorrect" },
] as const;

export const OutcomeCounts = ({ answered }: AnswerResultsProps) => {
	const parts = OUTCOME_SUMMARY.map(({ outcome, label }) => ({
		outcome,
		label,
		count: answered.filter((poll) => poll.outcome === outcome).length,
	})).filter((part) => part.count > 0);

	return (
		<Paragraph size="sm" className="flex gap-2">
			{parts.map((part, index) => (
				<span key={part.outcome} className="flex gap-2">
					{index > 0 ? <span className="text-pewter">·</span> : null}
					<Paragraph as="span" size="sm" tone={OUTCOME_TONE[part.outcome]}>
						{part.count} {part.label}
					</Paragraph>
				</span>
			))}
		</Paragraph>
	);
};

const pageDot = (active: boolean, outcomeClass: string): string =>
	active
		? `h-2 w-2 rounded-full bg-current ${outcomeClass}`
		: "h-2 w-2 rounded-full bg-zinc-700";

export const AnswerResults = ({ answered }: AnswerResultsProps) => {
	const [expandedIndex, setExpandedIndex] = useState(0);
	const current = answered[expandedIndex];
	const onLastPoll = expandedIndex >= answered.length - 1;

	return (
		<section className="space-y-4">
			<div className="space-y-1">
				<Title size="sm">Your answers</Title>
				<OutcomeCounts answered={answered} />
			</div>

			<div className="flex flex-wrap gap-2">
				{answered.map((poll, index) => (
					<OutcomeTile
						key={`${poll.id}-${index}`}
						title={`Poll ${index + 1}`}
						subtitle={getCategoryMetadata(poll.category).name}
						outcome={poll.outcome}
						expanded={expandedIndex === index}
						onClick={() => setExpandedIndex(index)}
					/>
				))}
			</div>

			{current ? <ExpandedAnswer poll={current} index={expandedIndex} /> : null}

			{answered.length > 1 ? (
				<div className="flex items-center justify-between">
					<Button
						variant="secondary"
						size="small"
						disabled={expandedIndex === 0}
						onClick={() => setExpandedIndex(expandedIndex - 1)}
					>
						← Previous poll
					</Button>
					<div className="flex items-center gap-2">
						{answered.map((poll, index) => (
							<button
								key={`${poll.id}-${index}`}
								type="button"
								aria-label={`View poll ${index + 1}`}
								onClick={() => setExpandedIndex(index)}
								className={pageDot(
									expandedIndex === index,
									outcomeText({ outcome: poll.outcome })
								)}
							/>
						))}
					</div>
					<Button
						variant="secondary"
						size="small"
						disabled={onLastPoll}
						onClick={() => setExpandedIndex(expandedIndex + 1)}
					>
						Next poll →
					</Button>
				</div>
			) : null}
		</section>
	);
};
