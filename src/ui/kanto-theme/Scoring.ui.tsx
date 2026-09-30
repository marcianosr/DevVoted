import { Fragment } from "react";

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
import { type Redactable, SealedFigure } from "./Redaction.ui";
import { Typography } from "./Typography.ui";

const COPY = {
	title: "Scoring",
	gate: "gate",
	slots: "slots",
	unit: "1 unit",
	healthy: COVERAGE_BAND_WORD.healthy,
	sealed: "Sealed until the run reaches this gate",
} as const;

export const SCORING_TITLE = COPY.title;

const GAP_GLYPH = "⋮";

const PRICES = "flex flex-col gap-3";
const PRICE = "flex flex-wrap items-center gap-3";
const PRICE_LABEL = "w-28 shrink-0";
const STEPS = "flex flex-wrap items-center gap-1.5";
const STATEMENTS = "flex flex-col gap-3 border-t border-theme-faint pt-4";
const STATEMENT = "flex items-start gap-3";
const ROW = "items-center gap-3";
const ACCENT = "border-l-2 border-theme";
const GAP_ROW = "text-theme-muted";

const COLUMNS = [
	{ label: COPY.gate, width: "min-w-0 flex-1" },
	{ label: COPY.slots, width: "w-14 shrink-0 text-right" },
	{ label: COPY.unit, width: "w-20 shrink-0 text-right" },
	{ label: COPY.healthy, width: "w-20 shrink-0 text-right" },
] as const satisfies readonly PanelTableColumn[];

const [GATE_COLUMN, SLOTS_COLUMN, UNIT_COLUMN, HEALTHY_COLUMN] = COLUMNS;

const GATE = GATE_COLUMN.width;
const SLOTS = `flex justify-end ${SLOTS_COLUMN.width}`;
const UNIT = `flex justify-end ${UNIT_COLUMN.width}`;
const HEALTHY = `flex justify-end ${HEALTHY_COLUMN.width}`;

const UNIT_COLOR: KantoColor = "viridian";
const HEALTHY_COLOR = COVERAGE_BAND_COLOR.healthy;

export type ScoringTone = "none" | "partial" | "full";

const TONE_COLOR = {
	none: "cinnabar",
	partial: "saffron",
	full: "viridian",
} satisfies Record<ScoringTone, KantoColor>;

export type ScoringStep = { figure: string; tone: ScoringTone };

export type ScoringPrice = { label: string; steps: readonly ScoringStep[] };

export type ScoringGateFigures = {
	slots: string;
	unit: string;
	healthy: string;
};

export type ScoringGateStated = {
	gate: number;
	name: string;
	current?: boolean;
};

export type ScoringGateRow = Redactable<ScoringGateFigures, ScoringGateStated>;

export type ScoringProps = {
	meta: LeadLine;
	prices: readonly ScoringPrice[];
	hint: LeadLine;
	statements: readonly LeadLine[];
	rows: readonly ScoringGateRow[];
};

const Price = ({ price }: { price: ScoringPrice }) => (
	<div className={PRICE}>
		<span className={PRICE_LABEL}>
			<Typography variant="caption">{price.label}</Typography>
		</span>
		<span className={STEPS}>
			{price.steps.map((step, index) => (
				<Badge key={index} color={TONE_COLOR[step.tone]}>
					{step.figure}
				</Badge>
			))}
		</span>
	</div>
);

const Statement = ({ line, number }: { line: LeadLine; number: number }) => (
	<div className={STATEMENT}>
		<Badge>{number}</Badge>
		<Lead line={line} variant="paragraph" />
	</div>
);

const Figures = ({ row }: { row: ScoringGateRow }) => {
	if (row.locked === true)
		return (
			<>
				<span className={SLOTS}>
					<SealedFigure label={COPY.sealed} />
				</span>
				<span className={UNIT}>
					<SealedFigure />
				</span>
				<span className={HEALTHY}>
					<SealedFigure />
				</span>
			</>
		);

	return (
		<>
			<span className={SLOTS}>
				<Badge>{row.slots}</Badge>
			</span>
			<span className={UNIT}>
				<Badge color={UNIT_COLOR}>{row.unit}</Badge>
			</span>
			<span className={HEALTHY}>
				<Badge color={HEALTHY_COLOR}>{row.healthy}</Badge>
			</span>
		</>
	);
};

const Row = ({ row, ruled }: { row: ScoringGateRow; ruled: boolean }) => (
	<div
		className={clsx(
			TABLE_ROW,
			ROW,
			ruled && TABLE_DIVIDER,
			row.current === true && ACCENT
		)}
	>
		<span className={GATE}>
			<Typography variant="caption">{row.name}</Typography>
		</span>
		<Figures row={row} />
	</div>
);

const skipsGatesBefore = (rows: readonly ScoringGateRow[], index: number) =>
	index > 0 && rows[index].gate - rows[index - 1].gate > 1;

export const Scoring = ({
	meta,
	prices,
	hint,
	statements,
	rows,
}: ScoringProps) => (
	<Fold title={COPY.title} meta={meta}>
		<div className={PRICES}>
			{prices.map((price) => (
				<Price key={price.label} price={price} />
			))}
			<Lead line={hint} />
		</div>
		<div className={STATEMENTS}>
			{statements.map((line, index) => (
				<Statement key={index} line={line} number={index + 1} />
			))}
		</div>
		<PanelTable columns={COLUMNS} bleed="sides">
			{rows.map((row, index) => (
				<Fragment key={row.gate}>
					{skipsGatesBefore(rows, index) ? (
						<div
							aria-hidden
							className={clsx(TABLE_ROW, TABLE_DIVIDER, GAP_ROW)}
						>
							{GAP_GLYPH}
						</div>
					) : null}
					<Row row={row} ruled={index > 0} />
				</Fragment>
			))}
		</PanelTable>
	</Fold>
);
