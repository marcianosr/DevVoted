import type {
	AnswerOutcome,
	AnsweredPoll,
} from "~/modules/run/climb/run.model";
import { StatusBadge, type StatusBadgeVariant } from "~/ui/StatusBadge.ui";
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

const Badge = ({ outcome }: { outcome: AnswerOutcome }) => (
	<span className="shrink-0">
		<StatusBadge variant={OUTCOME_VARIANT[outcome]} />
	</span>
);

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
			size="sm"
			tone={GLYPH_TONE[status]}
			className="w-4 shrink-0 text-center"
		>
			{IT_GLYPH[status]}
		</Paragraph>
		<Paragraph
			as="span"
			size="sm"
			tone={LABEL_TONE[status]}
			className="min-w-0 flex-1"
		>
			{label}
		</Paragraph>
		{note ? (
			<Paragraph as="span" size="sm" tone="muted" className="shrink-0 pl-2">
				{note}
			</Paragraph>
		) : null}
	</div>
);

const AnswerTree = ({ poll }: { poll: AnsweredPoll }) => (
	<div className="space-y-0.5 pb-3 pl-7">
		{itRowsFor(poll).map((row) => (
			<ItLine key={row.label} {...row} />
		))}
		{poll.explanation ? (
			<Paragraph size="sm" tone="muted" className="pt-1">
				› {poll.explanation}
			</Paragraph>
		) : null}
	</div>
);

const ReporterRow = ({
	poll,
	defaultOpen,
}: {
	poll: AnsweredPoll;
	defaultOpen: boolean;
}) => {
	const count = (poll.options ?? poll.picked).length;
	const hasScore = poll.coverageEarned !== undefined;
	return (
		<details open={defaultOpen} className="group">
			<summary className="flex cursor-pointer list-none items-start gap-3 rounded py-1 hover:bg-zinc-800/40 [&::-webkit-details-marker]:hidden">
				<Badge outcome={poll.outcome} />
				<Paragraph as="span" className="min-w-0 flex-1">
					{poll.question}
				</Paragraph>
				<Paragraph
					as="span"
					size="sm"
					tone="muted"
					className="shrink-0 tabular-nums"
				>
					({count})
				</Paragraph>
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
					className="shrink-0 text-zinc-500 transition-transform group-open:rotate-90"
				>
					▸
				</span>
			</summary>

			<AnswerTree poll={poll} />
		</details>
	);
};

const OUTCOME_SUMMARY = [
	{ outcome: "correct", label: "correct" },
	{ outcome: "partial", label: "partial" },
	{ outcome: "wrong", label: "incorrect" },
] as const;

type AnswerResultsProps = {
	answered: readonly AnsweredPoll[];
};

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

export const AnswerResults = ({ answered }: AnswerResultsProps) => (
	<section className="space-y-4">
		<div className="space-y-1">
			<Title size="sm">Your answers</Title>
			<OutcomeCounts answered={answered} />
		</div>

		<div className="font-mono">
			{answered.map((poll, index) => (
				<ReporterRow
					key={`${poll.id}-${index}`}
					poll={poll}
					defaultOpen={index === 0}
				/>
			))}
		</div>
	</section>
);
