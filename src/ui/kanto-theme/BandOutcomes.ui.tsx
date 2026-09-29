import { Badge } from "./Badge.ui";
import {
	COVERAGE_BAND_COLOR,
	COVERAGE_BAND_WORD,
	type CoverageBandId,
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
import { PollScores, type PollScoresProps } from "./PollScores.ui";

import { Typography } from "./Typography.ui";

const ACCENT = "border-l-2 border-theme";
const RULED = "border-t border-theme-faint";

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
	scores?: PollScoresProps;
	note?: string;
	standing?: CoverageBandId;
};

type OutcomeProps = {
	outcome: BandOutcome;
	standing: boolean;
};

const Outcome = ({ outcome, standing }: OutcomeProps) => {
	const color = COVERAGE_BAND_COLOR[outcome.band];
	const accented = standing || outcome.band === FATAL_BAND;

	return (
		<Panel.Row
			theme={accented ? color : undefined}
			className={accented ? ACCENT : undefined}
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
	scores,
	note,
	standing,
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
		{scores === undefined ? null : (
			<Panel.Body className={RULED}>
				<PollScores {...scores} />
			</Panel.Body>
		)}
		<Panel.Columns columns={COLUMNS} />
		<Panel.Rows>
			{outcomes.map((outcome) => (
				<Outcome
					key={outcome.band}
					outcome={outcome}
					standing={outcome.band === standing}
				/>
			))}
		</Panel.Rows>
		{note === undefined ? null : (
			<Panel.Footer>
				<Typography variant="hint">{note}</Typography>
			</Panel.Footer>
		)}
	</Panel>
);
