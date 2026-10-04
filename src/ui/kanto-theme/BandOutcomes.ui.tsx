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
import { Typography } from "./Typography.ui";

const RULED = "border-t border-theme-faint";
export type { LeadBand, LeadFigure, LeadLine, LeadPart };

export type BandOutcomesProps = {
	title: string;
	meta: LeadLine;
	objectives?: ObjectivesProps;
	ladder: BandLadderProps;
	note?: string;
};

export const BandOutcomes = ({
	title,
	meta,
	objectives,
	ladder,
	note,
}: BandOutcomesProps) => (
	<Panel>
		<Panel.Header label={title} meta={<Lead line={meta} as="span" />} />
		{objectives === undefined ? null : <Objectives {...objectives} />}
		<Panel.Body className={RULED}>
			<BandLadder {...ladder} />
		</Panel.Body>
		{note === undefined ? null : (
			<Panel.Footer>
				<Typography variant="hint">{note}</Typography>
			</Panel.Footer>
		)}
	</Panel>
);
