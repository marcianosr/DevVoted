import { Badge } from "./Badge.ui";
import { Panel } from "./Panel.ui";

export const COPY = {
	label: "category seats",
} as const;

const SEATS = "flex w-full flex-wrap items-center gap-2";
const SEAT =
	"flex items-center gap-2 rounded-lg bg-theme-raised px-2 py-1 text-xs text-theme-muted";
const SEAT_FIGURE = "font-bold text-theme-soft tabular-nums";

export type SeatFigure = {
	category: string;
	figure: string;
};

export type ProfileSeatsProps = {
	seats: readonly SeatFigure[];
	meta: string;
};

export const ProfileSeats = ({ seats, meta }: ProfileSeatsProps) => (
	<Panel>
		<Panel.Header label={COPY.label} meta={meta} />
		<Panel.Body>
			<div className={SEATS}>
				{seats.map((seat) => (
					<span key={seat.category} className={SEAT}>
						<Badge>{seat.category}</Badge>
						<span className={SEAT_FIGURE}>{seat.figure}</span>
					</span>
				))}
			</div>
		</Panel.Body>
	</Panel>
);
