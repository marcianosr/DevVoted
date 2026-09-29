import { Badge } from "./Badge.ui";
import { Panel } from "./Panel.ui";
import type { SwatchFill } from "./Swatch.ui";
import { SwatchTrack } from "./SwatchTrack.ui";
import { Typography } from "./Typography.ui";

export const COPY = {
	label: "record",
	seats: "category seats",
	noSeats: "no seat held",
} as const;

const FIGURES = "flex w-full flex-col gap-2";
const FIGURE_ROW = "flex w-full flex-wrap items-baseline gap-x-3 gap-y-1";
const FIGURE_LABEL = "min-w-32 grow text-xs text-theme-muted";
const FIGURE_VALUE = "text-sm font-bold text-theme-soft tabular-nums";
const FIGURE_YOURS = "text-xs text-theme-muted tabular-nums";

const SEATS = "flex w-full flex-wrap items-center gap-2";
const SEAT =
	"flex items-center gap-2 rounded-lg bg-theme-raised px-2 py-1 text-xs text-theme-muted";
const SEAT_FIGURE = "font-bold text-theme-soft tabular-nums";

export type RecordFigure = {
	label: string;
	figure: string;
	yours?: string;
};

export type RecordSeat = {
	category: string;
	figure: string;
};

export type ProfileRecordProps = {
	figures: readonly RecordFigure[];
	swatches: readonly SwatchFill[];
	seats: readonly RecordSeat[];
	meta: string;
	note: string;
};

const Seats = ({ seats }: { seats: readonly RecordSeat[] }) => (
	<div className={SEATS}>
		{seats.length === 0 ? (
			<Typography variant="hint" as="span">
				{COPY.noSeats}
			</Typography>
		) : (
			seats.map((seat) => (
				<span key={seat.category} className={SEAT}>
					<Badge>{seat.category}</Badge>
					<span className={SEAT_FIGURE}>{seat.figure}</span>
				</span>
			))
		)}
	</div>
);

export const ProfileRecord = ({
	figures,
	swatches,
	seats,
	meta,
	note,
}: ProfileRecordProps) => (
	<Panel>
		<Panel.Header label={COPY.label} meta={meta} />
		<Panel.Body>
			<div className={FIGURES}>
				{figures.map((figure) => (
					<div key={figure.label} className={FIGURE_ROW}>
						<span className={FIGURE_LABEL}>{figure.label}</span>
						<span className={FIGURE_VALUE}>{figure.figure}</span>
						{figure.yours === undefined ? null : (
							<span className={FIGURE_YOURS}>{figure.yours}</span>
						)}
					</div>
				))}
			</div>

			<SwatchTrack swatches={swatches} size="large" />

			<Seats seats={seats} />
		</Panel.Body>
		<Panel.Footer>
			<Typography variant="hint">{note}</Typography>
		</Panel.Footer>
	</Panel>
);
