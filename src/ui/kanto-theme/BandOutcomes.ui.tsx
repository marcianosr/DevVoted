import { BandLadder, type BandLadderProps } from "./BandLadder.ui";
import {
	Lead,
	type LeadBand,
	type LeadFigure,
	type LeadLine,
	type LeadPart,
} from "./Lead.ui";
import { Objectives, type ObjectivesProps } from "./Objectives.ui";
import { Panel } from "./Panel.ui";
import { PollScores, type PollScoresProps } from "./PollScores.ui";
import { Typography } from "./Typography.ui";

const RULED = "border-t border-theme-faint";
const BRIEF = "flex flex-col gap-1";

export type BandBrief = {
	statement: LeadLine;
	hint: LeadLine;
};

export type { LeadBand, LeadFigure, LeadLine, LeadPart };

export type BandOutcomesProps = {
	title: string;
	meta: LeadLine;
	brief?: BandBrief;
	objectives?: ObjectivesProps;
	scores?: PollScoresProps;
	ladder: BandLadderProps;
	standing: LeadLine;
	note?: string;
};

const Brief = ({ statement, hint }: BandBrief) => (
	<Panel.Body className={BRIEF}>
		<Lead line={statement} variant="subtitle" as="p" />
		<Lead line={hint} variant="hint" as="p" />
	</Panel.Body>
);

export const BandOutcomes = ({
	title,
	meta,
	brief,
	objectives,
	scores,
	ladder,
	standing,
	note,
}: BandOutcomesProps) => (
	<Panel>
		<Panel.Header label={title} meta={<Lead line={meta} as="span" />} />
		{brief === undefined ? null : <Brief {...brief} />}
		{objectives === undefined ? null : <Objectives {...objectives} />}
		{scores === undefined ? null : (
			<Panel.Body className={RULED}>
				<PollScores {...scores} />
			</Panel.Body>
		)}
		<Panel.Body className={RULED}>
			<BandLadder {...ladder} />
			<Lead line={standing} variant="subtitle" as="p" />
		</Panel.Body>
		{note === undefined ? null : (
			<Panel.Footer>
				<Typography variant="hint">{note}</Typography>
			</Panel.Footer>
		)}
	</Panel>
);
