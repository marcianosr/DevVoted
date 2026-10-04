import { AccuracyTrack, type AccuracyTrackProps } from "./AccuracyTrack.ui";
import { Typography } from "./Typography.ui";

const COPY = {
	title: "Accuracy",
	ahead: "multiplies the bar when the gate closes",
	landed: "Streak bonus",
} as const;

const BLOCK = "flex w-full flex-col gap-2";
const HEAD = "flex flex-wrap items-baseline justify-between gap-2";

export type AccuracyProps = {
	track: AccuracyTrackProps;
	landed?: boolean;
};

export const Accuracy = ({ track, landed = false }: AccuracyProps) => (
	<div className={BLOCK}>
		<div className={HEAD}>
			<Typography variant="title" as="h3">
				{COPY.title}
			</Typography>
			<Typography variant="hint" as="span">
				{landed ? COPY.landed : COPY.ahead}
			</Typography>
		</div>
		<AccuracyTrack {...track} />
	</div>
);
