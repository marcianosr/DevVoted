import { Badge } from "./Badge.ui";
import {
	CoverageBar,
	COVERAGE_BAND_COLOR,
	COVERAGE_BAND_WORD,
	type CoverageBandId,
	type CoverageBarProps,
} from "./CoverageBar.ui";
import {
	Lead,
	type LeadBand,
	type LeadFigure,
	type LeadLine,
	type LeadPart,
} from "./Lead.ui";
import { Objectives, type ObjectivesProps } from "./Objectives.ui";
import { Panel, type PanelColumn } from "./Panel.ui";

import { Typography } from "./Typography.ui";

const FATAL = "border-l-2 border-theme";

const COLUMNS = [
	{ label: "band", width: "w-28 shrink-0" },
	{ label: "coverage", width: "min-w-0 flex-1" },
	{ label: "pays", width: "ml-auto shrink-0" },
] as const satisfies readonly PanelColumn[];

const [BAND_COLUMN, RANGE_COLUMN, PAYS_COLUMN] = COLUMNS;

const BAND = `flex self-center ${BAND_COLUMN.width}`;
const RANGE = `text-xs tabular-nums text-theme-muted ${RANGE_COLUMN.width}`;
const PAYS = `self-center ${PAYS_COLUMN.width}`;

const FATAL_BAND: CoverageBandId = "danger";

export type { LeadBand, LeadFigure, LeadLine, LeadPart };

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

type OutcomeProps = {
	outcome: BandOutcome;
};

const Outcome = ({ outcome }: OutcomeProps) => {
	const color = COVERAGE_BAND_COLOR[outcome.band];
	const fatal = outcome.band === FATAL_BAND;

	return (
		<Panel.Row
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
		</Panel.Row>
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
	<Panel>
		<Panel.Header label={title} />
		{lead.length === 0 ? null : (
			<Panel.Body>
				{lead.map((line, index) => (
					<Lead key={index} line={line} />
				))}
			</Panel.Body>
		)}
		{objectives === undefined ? null : <Objectives {...objectives} />}
		{bar === undefined ? null : (
			<Panel.Body>
				<CoverageBar {...bar} />
			</Panel.Body>
		)}
		<Panel.Columns columns={COLUMNS} />
		<Panel.Rows>
			{outcomes.map((outcome) => (
				<Outcome key={outcome.band} outcome={outcome} />
			))}
		</Panel.Rows>
		{note === undefined ? null : (
			<Panel.Footer>
				<Typography variant="hint">{note}</Typography>
			</Panel.Footer>
		)}
	</Panel>
);
