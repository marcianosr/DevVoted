import type {
	AnswerOutcome,
	AnsweredPoll,
} from "~/modules/run/climb/run.model";
import { StatusLine } from "~/ui/runs/StatusLine.ui";
import type { StatusBadgeVariant } from "~/ui/StatusBadge.ui";
import { Swatch } from "~/ui/Swatch.component";
import { categoryTheme } from "~/ui/theme/categoryTheme";
import {
	Paragraph,
	type ParagraphTone,
} from "~/ui/typography/Paragraph.component";
import { Title } from "~/ui/typography/Title.component";

const OUTCOME_TONE: Record<AnswerOutcome, ParagraphTone> = {
	correct: "viridian",
	partial: "saffron",
	wrong: "cinnabar",
};

// The poll outcome maps onto the shared test-runner badge.
const OUTCOME_VARIANT: Record<AnswerOutcome, StatusBadgeVariant> = {
	correct: "pass",
	partial: "part",
	wrong: "fail",
};

const formatScore = (coverageEarned: number): string =>
	coverageEarned > 0 ? `+${coverageEarned}%` : `${coverageEarned}%`;

type ItStatus = "pass" | "fail" | "skip";

const IT_GLYPH: Record<ItStatus, string> = { pass: "✓", fail: "✕", skip: "○" };
const GLYPH_TONE: Record<ItStatus, ParagraphTone> = {
	pass: "viridian",
	fail: "cinnabar",
	skip: "muted",
};
// A passing assertion reads as normal text (like a green test name); failures
// and skips carry their own colour so they stand out in the list.
const LABEL_TONE: Record<ItStatus, ParagraphTone> = {
	pass: "default",
	fail: "cinnabar",
	skip: "muted",
};

type ItRow = { label: string; status: ItStatus; note?: string };

const itRowsFor = (poll: AnsweredPoll): ItRow[] => {
	const options = poll.options ?? poll.picked;
	const picked = new Set(poll.picked);
	const correct = new Set(poll.correct ?? []);
	const keyed = poll.correct !== undefined;

	return options.map((label): ItRow => {
		const wasPicked = picked.has(label);
		// Legacy snapshots without a correct set: judge picks by the poll outcome.
		if (!keyed) {
			if (!wasPicked) return { label, status: "skip" };
			if (poll.outcome === "correct") return { label, status: "pass" };
			return { label, status: "fail", note: "picked, wrong" };
		}
		const isCorrect = correct.has(label);
		if (wasPicked && isCorrect) return { label, status: "pass" };
		if (wasPicked) return { label, status: "fail", note: "picked, wrong" };
		if (isCorrect) return { label, status: "fail", note: "missed" };
		return { label, status: "skip" };
	});
};

const ItLine = ({ label, status, note }: ItRow) => (
	<div className="flex items-start gap-2">
		<Paragraph
			as="span"
			size="xs"
			tone={GLYPH_TONE[status]}
			className="w-4 shrink-0 text-center"
		>
			{IT_GLYPH[status]}
		</Paragraph>
		<Paragraph
			as="span"
			size="xs"
			tone={LABEL_TONE[status]}
			className="min-w-0 flex-1"
		>
			{label}
		</Paragraph>
		{note ? (
			<Paragraph as="span" size="xs" tone="muted" className="shrink-0 pl-2">
				{note}
			</Paragraph>
		) : null}
	</div>
);

const AnswerTree = ({ poll }: { poll: AnsweredPoll }) => (
	<div className="space-y-0.5 pb-3 pl-23">
		{itRowsFor(poll).map((row) => (
			<ItLine key={row.label} {...row} />
		))}
		{poll.explanation ? (
			<Paragraph size="xs" tone="muted" className="pt-1">
				› {poll.explanation}
			</Paragraph>
		) : null}
	</div>
);

const ReporterRow = ({ poll }: { poll: AnsweredPoll }) => {
	const hasScore = poll.coverageEarned !== undefined;
	return (
		<details
			data-testid="answer-row"
			{...categoryTheme(poll.category)}
			className="group"
		>
			<StatusLine
				as="summary"
				badge={OUTCOME_VARIANT[poll.outcome]}
				leading={<Swatch size="sm" />}
				line={
					poll.answerType === "multiple" ? (
						<>
							{poll.question}{" "}
							<Paragraph as="p" tone="faint" size="xs">
								multiple choice
							</Paragraph>
						</>
					) : (
						poll.question
					)
				}
				className="cursor-pointer list-none rounded hover:bg-zinc-800/40 [&::-webkit-details-marker]:hidden"
				trailing={
					<>
						<Paragraph
							as="span"
							size="sm"
							tone={hasScore ? OUTCOME_TONE[poll.outcome] : "muted"}
							className="w-14 shrink-0 text-right font-bold tabular-nums"
						>
							{hasScore ? formatScore(poll.coverageEarned) : "—"}
						</Paragraph>
						<span
							aria-hidden
							className="shrink-0 text-zinc-300 transition-transform group-open:rotate-90"
						>
							▸
						</span>
					</>
				}
			/>

			<AnswerTree poll={poll} />
		</details>
	);
};

type AnswerResultsProps = {
	answered: readonly AnsweredPoll[];
};

export const AnswerResults = ({ answered }: AnswerResultsProps) => {
	const correct = answered.filter((poll) => poll.outcome === "correct").length;
	return (
		<section className="space-y-2">
			<div className="flex items-baseline justify-between">
				<Title>Review your answers</Title>
				<Paragraph
					as="span"
					size="sm"
					tone="viridian"
					className="font-bold tabular-nums"
				>
					{correct} of {answered.length} correct
				</Paragraph>
			</div>

			<div className="font-mono">
				{answered.map((poll, index) => (
					<ReporterRow key={`${poll.id}-${index}`} poll={poll} />
				))}
			</div>
		</section>
	);
};
