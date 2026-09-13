import { clsx } from "clsx";

import { Badge } from "./Badge.ui";
import {
	CoverageBar,
	COVERAGE_BAND_COLOR,
	COVERAGE_BAND_WORD,
	type CoverageBandId,
	type CoverageBarProps,
} from "./CoverageBar.ui";
import type { KantoColor } from "./colors";
import { Panel } from "./Panel.ui";
import {
	PanelTable,
	TABLE_DIVIDER,
	TABLE_ROW,
	type PanelTableColumn,
} from "./PanelTable.ui";
import { Typography } from "./Typography.ui";

const SECTION = "flex w-full flex-col gap-3";
const ROW = `${TABLE_ROW} items-baseline gap-4`;
const FATAL = "border-l-2 border-theme";

const LEAD_FIGURE_COLOR: KantoColor = "pewter";

const COLUMNS = [
	{ label: "band", width: "w-28 shrink-0" },
	{ label: "coverage", width: "min-w-0 flex-1" },
	{ label: "pays", width: "ml-auto shrink-0" },
] as const satisfies readonly PanelTableColumn[];

const [BAND_COLUMN, RANGE_COLUMN, PAYS_COLUMN] = COLUMNS;

const BAND = `flex self-center ${BAND_COLUMN.width}`;
const RANGE = `text-xs tabular-nums text-theme-muted ${RANGE_COLUMN.width}`;
const PAYS = `self-center ${PAYS_COLUMN.width}`;

const FATAL_BAND: CoverageBandId = "danger";

export type LeadBand = { band: CoverageBandId; figure?: never };
export type LeadFigure = { figure: string; band?: never };
export type LeadPart = string | LeadBand | LeadFigure;

export type BandOutcome = {
	band: CoverageBandId;
	range: string;
	pays: string;
};

export type BandOutcomesProps = {
	title: string;
	outcomes: readonly BandOutcome[];
	lead?: readonly LeadPart[];
	note?: string;
	bar?: CoverageBarProps;
};

const Mark = ({ part }: { part: LeadBand | LeadFigure }) => {
	if (part.band === undefined) {
		return <Badge color={LEAD_FIGURE_COLOR}>{part.figure}</Badge>;
	}

	return (
		<Badge color={COVERAGE_BAND_COLOR[part.band]}>
			{COVERAGE_BAND_WORD[part.band]}
		</Badge>
	);
};

const Lead = ({ parts }: { parts: readonly LeadPart[] }) => (
	<Typography variant="hint">
		{parts.map((part, index) =>
			typeof part === "string" ? (
				<span key={`${part}-${index}`}>{part}</span>
			) : (
				<Mark key={`${part.band ?? part.figure}-${index}`} part={part} />
			)
		)}
	</Typography>
);

type OutcomeProps = {
	outcome: BandOutcome;
	first: boolean;
};

const Outcome = ({ outcome, first }: OutcomeProps) => {
	const color = COVERAGE_BAND_COLOR[outcome.band];
	const fatal = outcome.band === FATAL_BAND;

	return (
		<div
			data-screen-theme={fatal ? color : undefined}
			className={clsx(ROW, !first && TABLE_DIVIDER, fatal && FATAL)}
		>
			<span className={BAND}>
				<Badge color={color}>{COVERAGE_BAND_WORD[outcome.band]}</Badge>
			</span>
			<span className={RANGE}>{outcome.range}</span>
			<span className={PAYS}>
				<Badge color={color}>{outcome.pays}</Badge>
			</span>
		</div>
	);
};

export const BandOutcomes = ({
	title,
	outcomes,
	lead,
	note,
	bar,
}: BandOutcomesProps) => (
	<section className={SECTION}>
		<Typography variant="title" as="h3">
			{title}
		</Typography>
		{lead === undefined ? null : <Lead parts={lead} />}
		{bar === undefined ? null : <CoverageBar {...bar} />}
		<Panel>
			<PanelTable columns={COLUMNS}>
				{outcomes.map((outcome, index) => (
					<Outcome key={outcome.band} outcome={outcome} first={index === 0} />
				))}
			</PanelTable>
		</Panel>
		{note === undefined ? null : <Typography variant="hint">{note}</Typography>}
	</section>
);
