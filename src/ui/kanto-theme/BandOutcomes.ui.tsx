import { Badge } from "./Badge.ui";
import {
	CoverageBar,
	COVERAGE_BAND_COLOR,
	COVERAGE_BAND_WORD,
	type CoverageBandId,
	type CoverageBarProps,
} from "./CoverageBar.ui";
import type { KantoColor } from "./colors";
import { Objectives, type ObjectivesProps } from "./Objectives.ui";
import { PanelV2, type PanelV2Column } from "./PanelV2.ui";

import { Typography } from "./Typography.ui";

const FATAL = "border-l-2 border-theme";

const LEAD_FIGURE_COLOR: KantoColor = "pewter";
const LEAD_GAIN_COLOR: KantoColor = "viridian";

const COLUMNS = [
	{ label: "band", width: "w-28 shrink-0" },
	{ label: "coverage", width: "min-w-0 flex-1" },
	{ label: "pays", width: "ml-auto shrink-0" },
] as const satisfies readonly PanelV2Column[];

const [BAND_COLUMN, RANGE_COLUMN, PAYS_COLUMN] = COLUMNS;

const BAND = `flex self-center ${BAND_COLUMN.width}`;
const RANGE = `text-xs tabular-nums text-theme-muted ${RANGE_COLUMN.width}`;
const PAYS = `self-center ${PAYS_COLUMN.width}`;

const FATAL_BAND: CoverageBandId = "danger";

export type LeadBand = { band: CoverageBandId; figure?: never };
export type LeadFigure = { figure: string; gain?: boolean; band?: never };
export type LeadPart = string | LeadBand | LeadFigure;
export type LeadLine = readonly LeadPart[];

export type BandOutcome = {
	band: CoverageBandId;
	range: string;
	pays: string;
};

export type BandOutcomesProps = {
	title: string;
	outcomes: readonly BandOutcome[];
	lead?: readonly LeadLine[];
	objectives?: ObjectivesProps;
	note?: string;
	bar?: CoverageBarProps;
};

const Mark = ({ part }: { part: LeadBand | LeadFigure }) => {
	if (part.band === undefined) {
		const color = part.gain === true ? LEAD_GAIN_COLOR : LEAD_FIGURE_COLOR;
		return <Badge color={color}>{part.figure}</Badge>;
	}

	return (
		<Badge color={COVERAGE_BAND_COLOR[part.band]}>
			{COVERAGE_BAND_WORD[part.band]}
		</Badge>
	);
};

const Lead = ({ line }: { line: LeadLine }) => (
	<Typography variant="hint">
		{line.map((part, index) =>
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
};

const Outcome = ({ outcome }: OutcomeProps) => {
	const color = COVERAGE_BAND_COLOR[outcome.band];
	const fatal = outcome.band === FATAL_BAND;

	return (
		<PanelV2.Row
			theme={fatal ? color : undefined}
			className={fatal ? FATAL : undefined}
		>
			<span className={BAND}>
				<Badge color={color}>{COVERAGE_BAND_WORD[outcome.band]}</Badge>
			</span>
			<span className={RANGE}>{outcome.range}</span>
			<span className={PAYS}>
				<Badge color={color}>{outcome.pays}</Badge>
			</span>
		</PanelV2.Row>
	);
};

export const BandOutcomes = ({
	title,
	outcomes,
	lead = [],
	objectives,
	note,
	bar,
}: BandOutcomesProps) => (
	<PanelV2>
		<PanelV2.Header label={title} />
		{lead.length === 0 ? null : (
			<PanelV2.Body>
				{lead.map((line, index) => (
					<Lead key={index} line={line} />
				))}
			</PanelV2.Body>
		)}
		{objectives === undefined ? null : <Objectives {...objectives} />}
		{bar === undefined ? null : (
			<PanelV2.Body>
				<CoverageBar {...bar} />
			</PanelV2.Body>
		)}
		<PanelV2.Columns columns={COLUMNS} />
		<PanelV2.Rows>
			{outcomes.map((outcome) => (
				<Outcome key={outcome.band} outcome={outcome} />
			))}
		</PanelV2.Rows>
		{note === undefined ? null : (
			<PanelV2.Footer>
				<Typography variant="hint">{note}</Typography>
			</PanelV2.Footer>
		)}
	</PanelV2>
);
