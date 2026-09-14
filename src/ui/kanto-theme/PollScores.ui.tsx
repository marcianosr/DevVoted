import type { GateSwatch } from "~/modules/run/gate/domain/swatch.model";

import { Swatch, type SwatchFill } from "./Swatch.ui";
import { Typography } from "./Typography.ui";

const COLUMN = "flex w-full flex-col gap-2";
const ROW = "flex w-full items-center gap-3";
const NAME = "w-24 shrink-0 truncate";
const TRACK = "flex shrink-0 items-center gap-1";
const SCORE = "w-16 shrink-0 text-right tabular-nums";
const HERE = "shrink-0 text-xs text-theme";

const SWATCH_SIZE = "small";
const HERE_LABEL = "this gate";
const CORRECT_WORD = "correct";

export type PollScoreRow = {
	swatch: GateSwatch;
	correct: number;
	polls: number;
	current?: boolean;
};

export type PollScoresProps = {
	rows: readonly PollScoreRow[];
	hereLabel?: string;
};

const scoreOf = ({ correct, polls }: PollScoreRow) => `${correct} of ${polls}`;

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

const Row = ({ row, hereLabel }: { row: PollScoreRow; hereLabel: string }) => (
	<div
		data-gate-theme={row.swatch.theme}
		aria-label={`${row.swatch.gateName} — ${scoreOf(row)} ${CORRECT_WORD}`}
		className={ROW}
	>
		<Swatch size={SWATCH_SIZE} {...markFor(row)} />

		<span className={NAME}>
			<Typography variant="caption">{row.swatch.gateName}</Typography>
		</span>

		<span aria-hidden className={TRACK}>
			{fillsFor(row).map((fill, position) => (
				<Swatch key={position} size={SWATCH_SIZE} {...fill} />
			))}
		</span>

		<span aria-hidden className={SCORE}>
			<Typography variant="hint" as="span">
				{scoreOf(row)}
			</Typography>
		</span>

		{row.current === true ? <span className={HERE}>{hereLabel}</span> : null}
	</div>
);

export const PollScores = ({
	rows,
	hereLabel = HERE_LABEL,
}: PollScoresProps) => (
	<div className={COLUMN}>
		{rows.map((row) => (
			<Row key={row.swatch.gateName} row={row} hereLabel={hereLabel} />
		))}
	</div>
);
