import { clsx } from "clsx";

import type {
	AnswerOutcome,
	AnsweredPoll,
} from "~/modules/run/run/domain/run.model";
import { correctCount } from "~/modules/run/gate/domain/gateReward.model";
import { Disclosure } from "~/ui/Disclosure.ui";
import { CodeBlockMarkdown } from "~/modules/run/poll/presentation/PollMarkdown.ui";
import { StatusLine } from "~/ui/StatusLine.ui";
import type { StatusBadgeVariant } from "~/ui/StatusBadge.ui";
import {
	Paragraph,
	type ParagraphTone,
} from "~/ui/typography/Paragraph.component";
import { Title } from "~/ui/typography/Title.component";

// The poll outcome maps onto the shared test-runner badge.
const OUTCOME_VARIANT: Record<AnswerOutcome, StatusBadgeVariant> = {
	correct: "pass",
	partial: "part",
	wrong: "fail",
};

/**
 * What you got back, in the colour of how well it went. A zero stays grey: the
 * FAIL badge has already delivered that news, and a red number beside a red
 * badge just doubles the volume on the row you are least likely to re-read.
 */
const SCORE_TONE: Record<AnswerOutcome, ParagraphTone> = {
	correct: "celadon",
	partial: "saffron",
	wrong: "faint",
};

/**
 * A poll you got right is not study material. Its question drops to pewter so
 * the eye slides past it to the rows that still owe you something.
 */
const QUESTION_TONE: Record<AnswerOutcome, ParagraphTone> = {
	correct: "pewter",
	partial: "default",
	wrong: "default",
};

type ChipTone = "celadon" | "vermillion" | "saffron" | "faint";

// Expected is always celadon — it is what was true, regardless of how you did.
// Received wears the outcome, so the two rows are the same colour only when you
// were right, and the mismatch is visible before you read a single option.
const RECEIVED_TONE: Record<AnswerOutcome, ChipTone> = {
	correct: "celadon",
	partial: "saffron",
	wrong: "vermillion",
};

const CHIP_OUTLINE: Record<ChipTone, string> = {
	celadon: "border-celadon text-celadon",
	vermillion: "border-vermillion text-vermillion",
	saffron: "border-saffron text-saffron",
	faint: "border-zinc-700 text-zinc-500",
};

const CHIP_FILLED: Record<ChipTone, string> = {
	celadon: "border-celadon bg-celadon text-zinc-950",
	vermillion: "border-vermillion bg-vermillion text-zinc-950",
	saffron: "border-saffron bg-saffron text-zinc-950",
	faint: "border-zinc-700 bg-zinc-700 text-zinc-950",
};

const TEXT_TONE: Record<ChipTone, ParagraphTone> = {
	celadon: "celadon",
	vermillion: "vermillion",
	saffron: "saffron",
	faint: "faint",
};

const OPTION_LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

const letterAt = (index: number): string =>
	OPTION_LETTERS[index] ?? String(index + 1);

type ReviewOption = { readonly letter: string; readonly label: string };

// Legacy snapshots carry no option list. Rebuilding one from what the answer
// does remember keeps every line letterable — the letters mean less there, but
// they stay consistent within the row, which is all they are used for.
const optionsOf = (poll: AnsweredPoll): readonly string[] =>
	poll.options ?? [...new Set([...poll.picked, ...(poll.correct ?? [])])];

type AnswerDiff = {
	readonly expected: readonly ReviewOption[];
	readonly received: readonly ReviewOption[];
	readonly others: readonly ReviewOption[];
	readonly missed: readonly ReviewOption[];
	readonly hits: number;
};

/**
 * The row as an assertion diff: what the poll wanted, what you handed it, and
 * everything that took no part. Expected and Received keep their source order
 * rather than option order, because the pairing between the two lists is what
 * you read, and re-sorting either one breaks the eye's line between them.
 */
const diffOf = (poll: AnsweredPoll): AnswerDiff => {
	const options = optionsOf(poll);
	const letters = new Map(
		options.map((label, index) => [label, letterAt(index)] as const)
	);
	const asOption = (label: string): ReviewOption => ({
		label,
		letter: letters.get(label) ?? "?",
	});

	const expectedLabels = poll.correct ?? [];
	const picked = new Set(poll.picked);
	const involved = new Set([...expectedLabels, ...poll.picked]);
	const missedLabels = expectedLabels.filter((label) => !picked.has(label));

	return {
		expected: expectedLabels.map(asOption),
		received: poll.picked.map(asOption),
		others: options.filter((label) => !involved.has(label)).map(asOption),
		missed: missedLabels.map(asOption),
		hits: expectedLabels.length - missedLabels.length,
	};
};

/**
 * The option's seat in the list it was asked in. Round for a single-answer poll,
 * square for a multi-answer one — the same shapes as the radio and checkbox the
 * answer was given with, so the chip says "one of these" or "any of these"
 * before you have read a word of it.
 */
const OptionChip = ({
	letter,
	tone,
	filled,
	multi,
}: {
	letter: string;
	tone: ChipTone;
	filled: boolean;
	multi: boolean;
}) => (
	<span
		aria-hidden
		className={clsx(
			"inline-flex h-5 w-5 shrink-0 items-center justify-center border text-[10px] font-bold",
			multi ? "rounded-md" : "rounded-full",
			filled ? CHIP_FILLED[tone] : CHIP_OUTLINE[tone]
		)}
	>
		{letter}
	</span>
);

const OptionLine = ({
	option,
	tone,
	filled,
	multi,
}: {
	option: ReviewOption;
	tone: ChipTone;
	filled: boolean;
	multi: boolean;
}) => (
	<div className="flex items-start gap-3">
		<OptionChip
			letter={option.letter}
			tone={tone}
			filled={filled}
			multi={multi}
		/>
		<Paragraph as="span" tone={TEXT_TONE[tone]} className="min-w-0 flex-1">
			{option.label}
		</Paragraph>
	</div>
);

const DiffSide = ({
	label,
	options,
	tone,
	filled,
	multi,
}: {
	label: string;
	options: readonly ReviewOption[];
	tone: ChipTone;
	filled: boolean;
	multi: boolean;
}) => (
	<div className="flex gap-4">
		<Paragraph as="span" tone={TEXT_TONE[tone]} className="w-20 shrink-0">
			{label}
		</Paragraph>
		<div className="min-w-0 flex-1 space-y-1.5">
			{options.map((option) => (
				<OptionLine
					key={option.letter}
					option={option}
					tone={tone}
					filled={filled}
					multi={multi}
				/>
			))}
		</div>
	</div>
);

/**
 * How much of a multi-answer poll you actually caught. Single-answer polls get
 * no tally — Expected over Received already says the whole thing, and "1 of 1"
 * is a sentence that has never taught anybody anything.
 */
const MultiTally = ({
	hits,
	expected,
	missed,
}: {
	hits: number;
	expected: number;
	missed: readonly ReviewOption[];
}) => (
	<div className="border-t border-zinc-900 pt-3">
		<Paragraph tone="faint">
			{hits} of {expected}
			{missed.length > 0 ? (
				<>
					{" — you missed "}
					<Paragraph as="span" tone="default" className="font-bold">
						{missed.map((option) => option.letter).join(", ")}
					</Paragraph>
				</>
			) : null}
		</Paragraph>
	</div>
);

const AnswerDiffPanel = ({
	poll,
	diff,
}: {
	poll: AnsweredPoll;
	diff: AnswerDiff;
}) => {
	const multi = poll.answerType === "multiple";
	const receivedTone = RECEIVED_TONE[poll.outcome];
	return (
		<div className="space-y-3 rounded-lg bg-zinc-950 p-4 ring-1 ring-zinc-900">
			{diff.expected.length > 0 ? (
				<DiffSide
					label="Expected"
					options={diff.expected}
					tone="celadon"
					filled={false}
					multi={multi}
				/>
			) : null}
			{diff.received.length > 0 ? (
				<DiffSide
					label="Received"
					options={diff.received}
					tone={receivedTone}
					filled
					multi={multi}
				/>
			) : null}
			{multi && diff.expected.length > 0 ? (
				<MultiTally
					hits={diff.hits}
					expected={diff.expected.length}
					missed={diff.missed}
				/>
			) : null}
		</div>
	);
};

/**
 * Everything the poll offered that neither side of the diff touched. Folded
 * away by default: on a nine-option poll they are seven lines of noise between
 * you and the next question, but they are still the distractors you talked
 * yourself out of, so they stay one tap away.
 */
const OtherOptions = ({
	options,
	multi,
}: {
	options: readonly ReviewOption[];
	multi: boolean;
}) => (
	<Disclosure
		summary={`${options.length} other ${options.length === 1 ? "option" : "options"}`}
	>
		<div className="space-y-1.5">
			{options.map((option) => (
				<OptionLine
					key={option.letter}
					option={option}
					tone="faint"
					filled={false}
					multi={multi}
				/>
			))}
		</div>
	</Disclosure>
);

/**
 * The snippet the question was asked against, above the assertions. Half these
 * polls ask "which of these is not valid?" about code that is nowhere in the
 * question text, so without it the review is unreadable for exactly the polls
 * worth re-reading. Sized down from the answering screen's block: here it is
 * evidence for a row you already answered, not the thing under examination.
 */
const AnswerCode = ({ codeBlock }: { codeBlock: string }) => (
	// The highlight.js theme paints its own surface on <code> from an unlayered
	// stylesheet, so it outranks any utility here without `!`. Emptying the <pre>
	// and padding that surface directly is what puts the snippet's left edge on
	// the same line as the diff panel below it, instead of 16px inside it.
	<div className="markdown max-w-3xl text-xs [&_pre]:my-0 [&_pre]:p-0 [&_code]:!block [&_code]:!rounded-lg [&_code]:!px-4 [&_code]:!py-3">
		<CodeBlockMarkdown>{codeBlock}</CodeBlockMarkdown>
	</div>
);

const formatScore = (coverageEarned: number): string =>
	coverageEarned > 0 ? `+${coverageEarned}%` : `${coverageEarned}%`;

// Spans, not paragraphs: StatusLine already wraps the line in one, and a <p>
// inside a <span> is invalid markup the browser silently reflows.
const QuestionLine = ({ poll }: { poll: AnsweredPoll }) => (
	<>
		{poll.question}
		{poll.answerType === "multiple" ? (
			<Paragraph as="span" tone="faint" className="block">
				multiple choice
			</Paragraph>
		) : null}
	</>
);

/**
 * A poll you got right needs no unfolding — the badge is the whole story. The
 * ones you fumbled open on arrival, because the reason you came to this page is
 * sitting inside them and a page of closed rows makes you hunt for it.
 */
const ReporterRow = ({ poll }: { poll: AnsweredPoll }) => {
	const hasScore = poll.coverageEarned !== undefined;
	const diff = diffOf(poll);
	return (
		<details
			data-testid="answer-row"
			className="group"
			open={poll.outcome !== "correct"}
		>
			<StatusLine
				as="summary"
				badge={OUTCOME_VARIANT[poll.outcome]}
				badgeEmphasis="outline"
				lineSize="sm"
				lineTone={QUESTION_TONE[poll.outcome]}
				line={<QuestionLine poll={poll} />}
				className="cursor-pointer list-none rounded hover:bg-zinc-800/40 [&::-webkit-details-marker]:hidden"
				trailing={
					<>
						<Paragraph
							as="span"
							size="sm"
							tone={hasScore ? SCORE_TONE[poll.outcome] : "faint"}
							className="w-14 shrink-0 text-right tabular-nums"
						>
							{hasScore ? formatScore(poll.coverageEarned) : "—"}
						</Paragraph>
						<span
							aria-hidden
							className="shrink-0 text-zinc-600 transition-transform group-open:rotate-90"
						>
							▸
						</span>
					</>
				}
			/>

			{/* The explanation outranks the folded distractors: it is the sentence
			    you came for, and burying it under a disclosure that pushes it down
			    when opened makes the row rearrange itself around a footnote. */}
			<div className="space-y-2 pt-1 pl-17">
				{poll.codeBlock ? <AnswerCode codeBlock={poll.codeBlock} /> : null}
				<AnswerDiffPanel poll={poll} diff={diff} />
				{poll.explanation ? (
					<Paragraph tone="muted">› {poll.explanation}</Paragraph>
				) : null}
				{diff.others.length > 0 ? (
					<OtherOptions
						options={diff.others}
						multi={poll.answerType === "multiple"}
					/>
				) : null}
			</div>
		</details>
	);
};

type AnswerResultsProps = {
	answered: readonly AnsweredPoll[];
};

export const AnswerResults = ({ answered }: AnswerResultsProps) => {
	const correct = correctCount(answered);
	return (
		<section className="space-y-2">
			<div className="flex items-baseline justify-between border-b border-zinc-900 pb-2">
				<Title>Review your answers</Title>
				<Paragraph as="span" size="sm" tone="pewter" className="tabular-nums">
					{correct} of {answered.length} correct
				</Paragraph>
			</div>

			<div className="space-y-4 font-mono">
				{answered.map((poll, index) => (
					<ReporterRow key={`${poll.id}-${index}`} poll={poll} />
				))}
			</div>
		</section>
	);
};
