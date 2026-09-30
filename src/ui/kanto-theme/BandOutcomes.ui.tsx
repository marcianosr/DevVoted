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

export type { LeadBand, LeadFigure, LeadLine, LeadPart };

export type BandOutcomesProps = {
	title: string;
	meta: LeadLine;
	objectives?: ObjectivesProps;
	scores?: PollScoresProps;
	ladder: BandLadderProps;
	standing: LeadLine;
	note?: string;
};

export const BandOutcomes = ({
	title,
	meta,
	objectives,
	scores,
	ladder,
	standing,
	note,
}: BandOutcomesProps) => (
	<Panel>
		<Panel.Header label={title} meta={<Lead line={meta} as="span" />} />
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
