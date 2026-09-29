import { clsx } from "clsx";

import { Badge } from "./Badge.ui";
import type { KantoColor } from "./colors";
import { COVERAGE_BAND_COLOR, COVERAGE_BAND_WORD } from "./CoverageBar.ui";
import { Fold } from "./Fold.ui";
import { Lead, type LeadLine } from "./Lead.ui";
import {
	PanelTable,
	type PanelTableColumn,
	TABLE_DIVIDER,
	TABLE_ROW,
} from "./PanelTable.ui";
import { Typography } from "./Typography.ui";

const COPY = {
	title: "Gate strictness",
	gate: "gate",
	slots: "slots",
	unit: "one unit",
	healthy: COVERAGE_BAND_WORD.healthy,
} as const;

export const GATE_STRICTNESS_TITLE = COPY.title;

const STATEMENTS = "flex flex-col gap-3";
const STATEMENT = "flex items-start gap-3";
const ROW = "items-center gap-3";
const ACCENT = "border-l-2 border-theme";

const COLUMNS = [
	{ label: COPY.gate, width: "min-w-0 flex-1" },
	{ label: COPY.slots, width: "w-12 shrink-0 text-right" },
	{ label: COPY.unit, width: "w-20 shrink-0 text-right" },
	{ label: COPY.healthy, width: "w-20 shrink-0 text-right" },
] as const satisfies readonly PanelTableColumn[];

const [GATE_COLUMN, SLOTS_COLUMN, UNIT_COLUMN, HEALTHY_COLUMN] = COLUMNS;

const GATE = GATE_COLUMN.width;
const SLOTS = `tabular-nums ${SLOTS_COLUMN.width}`;
const UNIT = `flex justify-end ${UNIT_COLUMN.width}`;
const HEALTHY = `flex justify-end ${HEALTHY_COLUMN.width}`;

const UNIT_COLOR: KantoColor = "viridian";
const HEALTHY_COLOR = COVERAGE_BAND_COLOR.healthy;

export type StrictnessRow = {
	gate: string;
	slots: string;
	unit: string;
	healthy: string;
	current?: boolean;
};

export type GateStrictnessProps = {
	summary: string;
	statements: readonly LeadLine[];
	rows: readonly StrictnessRow[];
	note: LeadLine;
};

const Statement = ({ line, number }: { line: LeadLine; number: number }) => (
	<div className={STATEMENT}>
		<Badge>{number}</Badge>
		<Lead line={line} variant="paragraph" />
	</div>
);

const Row = ({ row, ruled }: { row: StrictnessRow; ruled: boolean }) => (
	<div
		className={clsx(
			TABLE_ROW,
			ROW,
			ruled && TABLE_DIVIDER,
			row.current === true && ACCENT
		)}
	>
		<span className={GATE}>
			<Typography variant="caption">{row.gate}</Typography>
		</span>
		<span className={SLOTS}>
			<Typography variant="caption">{row.slots}</Typography>
		</span>
		<span className={UNIT}>
			<Badge color={UNIT_COLOR}>{row.unit}</Badge>
		</span>
		<span className={HEALTHY}>
			<Badge color={HEALTHY_COLOR}>{row.healthy}</Badge>
		</span>
	</div>
);

export const GateStrictness = ({
	summary,
	statements,
	rows,
	note,
}: GateStrictnessProps) => (
	<Fold title={COPY.title} summary={summary}>
		<div className={STATEMENTS}>
			{statements.map((line, index) => (
				<Statement key={index} line={line} number={index + 1} />
			))}
		</div>
		<PanelTable columns={COLUMNS} bleed="sides">
			{rows.map((row, index) => (
				<Row key={row.gate} row={row} ruled={index > 0} />
			))}
		</PanelTable>
		<Lead line={note} />
	</Fold>
);
