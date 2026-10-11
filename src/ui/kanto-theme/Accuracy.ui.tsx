import { AccuracyTrack, type AccuracyTrackProps } from "./AccuracyTrack.ui";
import { Typography } from "./Typography.ui";

const COPY = {
	title: "Accuracy",
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
			{landed ? (
				<Typography variant="hint" as="span">
					{COPY.landed}
				</Typography>
			) : null}
		</div>
		<AccuracyTrack {...track} />
	</div>
);
