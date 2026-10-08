import { Badge } from "./Badge.ui";
import { Climber, type ClimberProps } from "./Climber.ui";
import { ClimberCard, type ClimberCardProps } from "./ClimberCard.ui";
import { Icon } from "./Icon.ui";
import { Panel } from "./Panel.ui";
import { Typography } from "./Typography.ui";

const REIGN = "flex flex-col gap-3";
const SINCE = "flex flex-wrap items-center gap-2";
const ROW_LABEL = "flex min-w-0 items-center gap-3";
const SEAT = "flex items-center gap-3";
const SEAT_MARK =
	"flex size-12 shrink-0 items-center justify-center rounded-lg border border-dashed border-theme-faint text-theme-muted";
const SEAT_ICON = "size-5";
const SEAT_LABEL = "flex min-w-0 flex-col gap-0.5";

const FACE_SIZE = "md";

export type HallOfFameWin = {
	key: string;
	face: ClimberProps;
	wonAt: string;
};

export type HallOfFameReign = {
	card: ClimberCardProps;
	since: string;
};

export type HallOfFameOpenSeat = {
	title: string;
	caption: string;
};

export type HallOfFameProps = {
	title: string;
	champion?: HallOfFameReign;
	history: readonly HallOfFameWin[];
	historyLabel: string;
	empty: HallOfFameOpenSeat;
};

const Reign = ({ card, since }: HallOfFameReign) => (
	<div className={REIGN}>
		<ClimberCard {...card} />
		<span className={SINCE}>
			<Badge color="fuchsia">{since}</Badge>
		</span>
	</div>
);

const OpenSeat = ({ title, caption }: HallOfFameOpenSeat) => (
	<div className={SEAT}>
		<span className={SEAT_MARK}>
			<Icon name="trophy" className={SEAT_ICON} />
		</span>
		<span className={SEAT_LABEL}>
			<Typography variant="subtitle" as="span">
				{title}
			</Typography>
			<Typography variant="hint" as="span">
				{caption}
			</Typography>
		</span>
	</div>
);

export const HallOfFame = ({
	title,
	champion,
	history,
	historyLabel,
	empty,
}: HallOfFameProps) => (
	<Panel>
		<Panel.Header label={title} />
		<Panel.Body>
			{champion === undefined ? (
				<OpenSeat {...empty} />
			) : (
				<Reign {...champion} />
			)}
		</Panel.Body>
		{history.length === 0 ? null : (
			<>
				<Panel.Header label={historyLabel} />
				<Panel.Rows>
					{history.map((win) => (
						<Panel.Row key={win.key} trailing={<Badge>{win.wonAt}</Badge>}>
							<span className={ROW_LABEL}>
								<Climber {...win.face} size={FACE_SIZE} />
								<Typography variant="subtitle" as="span">
									{win.face.name}
								</Typography>
							</span>
						</Panel.Row>
					))}
				</Panel.Rows>
			</>
		)}
	</Panel>
);
