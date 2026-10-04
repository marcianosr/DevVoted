import { Meter } from "./Meter.ui";
import { Panel } from "./Panel.ui";
import { Typography } from "./Typography.ui";

export const COPY = {
	label: "collection",
} as const;

const COUNTS = "grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4";
const COUNT = "flex flex-col gap-2";
const COUNT_HEAD = "flex w-full flex-wrap items-baseline gap-x-3 gap-y-1";
const COUNT_LABEL = "grow text-xs text-theme-muted";
const COUNT_FIGURE = "text-sm font-bold text-theme-soft tabular-nums";

export type CollectionCount = {
	label: string;
	figure: string;
	held: number;
	total: number;
};

export type ProfileCollectionProps = {
	counts: readonly CollectionCount[];
	meta: string;
	note: string;
};

export const ProfileCollection = ({
	counts,
	meta,
	note,
}: ProfileCollectionProps) => (
	<Panel>
		<Panel.Header label={COPY.label} meta={meta} />
		<Panel.Body>
			<div className={COUNTS}>
				{counts.map((count) => (
					<div key={count.label} className={COUNT}>
						<div className={COUNT_HEAD}>
							<span className={COUNT_LABEL}>{count.label}</span>
							<span className={COUNT_FIGURE}>{count.figure}</span>
						</div>
						<Meter value={count.held} max={count.total} />
					</div>
				))}
			</div>
		</Panel.Body>
		<Panel.Footer>
			<Typography variant="hint">{note}</Typography>
		</Panel.Footer>
	</Panel>
);
