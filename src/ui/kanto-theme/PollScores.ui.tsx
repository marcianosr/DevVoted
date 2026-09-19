import type { GateSwatch } from "~/modules/run/gate/domain/swatch.model";

import { Badge } from "./Badge.ui";
import type { KantoColor } from "./colors";
import { Swatch, type SwatchFill } from "./Swatch.ui";
import { Typography } from "./Typography.ui";

const COLUMN = "flex w-full flex-col gap-2";
const ROW = "flex w-full items-center gap-3";
const LABEL = "w-24 shrink-0 truncate tabular-nums";
const TRACK = "flex min-w-0 flex-1 flex-wrap items-center gap-1";
const TAG = "shrink-0";
const SCORE = "ml-auto w-20 shrink-0 text-right tabular-nums";
const EMPTY =
	"inline-flex items-center justify-center rounded-md border border-dashed border-theme-faint px-2 py-0.5 text-xs font-bold tabular-nums text-theme-muted";

const SWATCH_SIZE = "small";
const CORRECT_WORD = "correct";
const PAID_WORD = "paid";
const OUT_OF = "out of";

export type PollPaid = {
	figure: string;
	color: KantoColor;
};

export type PollPayouts = {
	slots: readonly (PollPaid | undefined)[];
	total: string;
};

export type PollScoreTag = { label: string; color?: KantoColor };

export type PollScoreRow = {
	swatch: GateSwatch;
	correct: number;
	polls: number;
	current?: boolean;
	payouts?: PollPayouts;
	/**
	 * Names the gate where the payout track would otherwise count answers. The run
	 * debrief lists every gate at once, and "4 out of 5" five times over says which
	 * row you are on only by counting down from the top.
	 */
	label?: string;
	tag?: PollScoreTag;
};

export type PollScoresProps = {
	rows: readonly PollScoreRow[];
};

const answeredOf = (payouts: PollPayouts): number =>
	payouts.slots.filter((paid) => paid !== undefined).length;

const labelOf = (row: PollScoreRow): string => {
	if (row.label !== undefined) return row.label;

	return row.payouts === undefined
		? row.swatch.gateName
		: `${answeredOf(row.payouts)} ${OUT_OF} ${row.polls}`;
};

const scoreOf = (row: PollScoreRow): string =>
	row.payouts === undefined
		? `${row.correct} of ${row.polls}`
		: row.payouts.total;

const readingOf = (row: PollScoreRow): string => {
	const score =
		row.payouts === undefined
			? `${scoreOf(row)} ${CORRECT_WORD}`
			: `${PAID_WORD} ${row.payouts.total}`;

	return row.tag === undefined ? score : `${score} — ${row.tag.label}`;
};

const fillsFor = ({
	swatch,
	correct,
	polls,
	current = false,
}: PollScoreRow): SwatchFill[] =>
	Array.from({ length: polls }, (_, position) => {
		if (position < correct) return { state: "discovered", swatch };
		return current ? { state: "current", swatch } : { state: "undiscovered" };
	});

const markFor = ({ swatch, current = false }: PollScoreRow): SwatchFill =>
	current ? { state: "current", swatch } : { state: "discovered", swatch };

const Track = ({ row }: { row: PollScoreRow }) => {
	if (row.payouts === undefined)
		return (
			<>
				{fillsFor(row).map((fill, position) => (
					<Swatch key={position} size={SWATCH_SIZE} {...fill} />
				))}
			</>
		);

	return (
		<>
			{row.payouts.slots.map((paid, position) =>
				paid === undefined ? (
					<span key={position} className={EMPTY}>
						{position + 1}
					</span>
				) : (
					<Badge key={position} color={paid.color}>
						{paid.figure}
					</Badge>
				)
			)}
		</>
	);
};

const Row = ({ row }: { row: PollScoreRow }) => (
	<div
		data-gate-theme={row.swatch.theme}
		aria-label={`${row.swatch.gateName} — ${readingOf(row)}`}
		className={ROW}
	>
		<Swatch size={SWATCH_SIZE} {...markFor(row)} />

		<span className={LABEL}>
			<Typography variant="caption">{labelOf(row)}</Typography>
		</span>

		<span aria-hidden className={TRACK}>
			<Track row={row} />
		</span>

		{row.tag === undefined ? null : (
			<span aria-hidden className={TAG}>
				<Badge color={row.tag.color}>{row.tag.label}</Badge>
			</span>
		)}

		<span aria-hidden className={SCORE}>
			<Typography variant="hint" as="span">
				{scoreOf(row)}
			</Typography>
		</span>
	</div>
);

export const PollScores = ({ rows }: PollScoresProps) => (
	<div className={COLUMN}>
		{rows.map((row) => (
			<Row key={row.swatch.gateName} row={row} />
		))}
	</div>
);
