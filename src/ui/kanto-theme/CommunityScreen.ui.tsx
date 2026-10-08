import { type ReactNode, useState } from "react";

import type { GateSwatch } from "~/modules/run/gate/domain/swatch.model";

import { Badge } from "./Badge.ui";
import { Button } from "./Button.ui";
import { CategoryLeader, type CategoryLeaderProps } from "./CategoryLeader.ui";
import { ClimberStack, type ClimberProps } from "./Climber.ui";
import { ClimbMap, type ClimbMapProps } from "./ClimbMap.ui";
import type { KantoColor } from "./colors";
import { HallOfFame, type HallOfFameProps } from "./HallOfFame.ui";
import { Icon, type IconName } from "./Icon.ui";
import { IncidentsPanel, type IncidentsPanelProps } from "./IncidentsPanel.ui";
import { Panel } from "./Panel.ui";
import { PollResult, type PollResultProps } from "./PollResult.ui";
import { Screen, type ScreenGround, type ScreenWidth } from "./Screen.ui";
import { Swatch } from "./Swatch.ui";
import { Segmented } from "./Segmented.ui";
import { Typography } from "./Typography.ui";

const HEADER = "flex w-full flex-col gap-4 sm:flex-row sm:items-start";
const CONTROLS =
	"grid w-full auto-cols-fr grid-flow-col gap-3 sm:ml-auto sm:flex sm:w-auto sm:shrink-0";
const TITLE_ROW = "flex min-w-0 flex-1 items-start gap-4";
const NAMING = "flex min-w-0 flex-col gap-2";
const STATS = "flex flex-wrap items-center gap-2";
const STAT = "flex items-center gap-1.5 text-theme-muted";

const COLUMNS =
	"grid w-full grid-cols-[minmax(0,1fr)] items-start gap-6 lg:grid-cols-[minmax(0,4fr)_minmax(0,3fr)]";
const COLUMN = "flex w-full min-w-0 flex-col gap-6";
const ROW_LABEL = "flex min-w-0 flex-wrap items-center gap-x-2";
const TALLY = "flex items-center gap-2";

const SWATCH_SIZE = "hero";
const CLIMBER_SIZE = "md";
const ROW_FACES = 3;
const CROWDED_ROW = "flex-wrap";
const YOUR_SEAT_COLOR: KantoColor = "viridian";
const CONTROL_SIZE = "md";
const CONTROL_WIDTH = "full";

export const COPY = {
	leaders: "Leaders",
	boards: "which board",
	you: "you",
} as const;

export type CommunityStat = { icon: IconName; label: string; hint: string };

export type CommunityMap = {
	title: string;
	track?: ClimbMapProps;
	empty?: string;
};

export type CommunityHeader = {
	swatch: GateSwatch;
	title: string;
	subtitle?: string;
	countdown: string;
	countdownColor?: KantoColor;
	countdownHint: string;
	stats: readonly CommunityStat[];
	shop?: { label: string; onPress?: () => void };
	prep: { label: string; onPress?: () => void };
};

export type TurnoutBand = {
	label: string;
	caption?: string;
	count: string;
	color?: KantoColor;
	climbers: readonly ClimberProps[];
	overflow?: number;
	shown?: number;
};

export type CommunityTurnout = {
	title: string;
	bands: readonly TurnoutBand[];
	records?: readonly TurnoutBand[];
};

export type CommunityLeaders = {
	title: string;
	summary?: string;
	seats: readonly CategoryLeaderProps[];
};

export type CommunityPolls = {
	title: string;
	tally?: string;
	polls: readonly PollResultProps[];
	review?: { label: string; onReview: () => void };
};

export type CommunityScreenProps = {
	header: CommunityHeader;
	turnout: CommunityTurnout;
	map: CommunityMap;
	incidents?: IncidentsPanelProps;
	hallOfFame?: HallOfFameProps;
	leaders: readonly CommunityLeaders[];
	polls: CommunityPolls;
	advertisement?: ReactNode;
	width?: ScreenWidth;
	ground?: ScreenGround;
};

const Stat = ({
	icon,
	label,
	hint,
	color,
}: CommunityStat & { color?: KantoColor }) => (
	<span className={STAT}>
		<span role="img" aria-label={hint}>
			<Icon name={icon} />
		</span>
		<Badge color={color}>{label}</Badge>
	</span>
);

const CommunityHeading = ({
	swatch,
	title,
	subtitle,
	countdown,
	countdownColor,
	countdownHint,
	stats,
	shop,
	prep,
}: CommunityHeader) => (
	<header className={HEADER}>
		<div className={TITLE_ROW}>
			<Swatch state="discovered" swatch={swatch} size={SWATCH_SIZE} />
			<span className={NAMING}>
				<Typography variant="headline" as="h1">
					{title}
				</Typography>
				{subtitle === undefined ? null : (
					<Typography variant="hint" as="span">
						{subtitle}
					</Typography>
				)}
				<span className={STATS}>
					<Stat
						icon="clock"
						label={countdown}
						hint={countdownHint}
						color={countdownColor}
					/>
					{stats.map((stat) => (
						<Stat key={stat.hint} {...stat} />
					))}
				</span>
			</span>
		</div>
		<span className={CONTROLS}>
			{shop === undefined ? null : (
				<Button
					size={CONTROL_SIZE}
					width={CONTROL_WIDTH}
					icon="shop"
					label={shop.label}
					disabled={shop.onPress === undefined}
					onPress={shop.onPress}
				/>
			)}
			<Button
				size={CONTROL_SIZE}
				width={CONTROL_WIDTH}
				tone="action"
				icon="gate"
				label={prep.label}
				disabled={prep.onPress === undefined}
				onPress={prep.onPress}
			/>
		</span>
	</header>
);

const TurnoutRow = ({
	band,
	label,
}: {
	band: TurnoutBand;
	label: ReactNode;
}) => (
	<Panel.Row
		className={band.shown === undefined ? undefined : CROWDED_ROW}
		trailing={
			<>
				<Badge color={band.color}>{band.count}</Badge>
				<ClimberStack
					climbers={band.climbers}
					overflow={band.overflow}
					shown={band.shown ?? ROW_FACES}
					size={CLIMBER_SIZE}
				/>
			</>
		}
	>
		<span className={ROW_LABEL}>
			{label}
			{band.caption === undefined ? null : (
				<Typography variant="hint" as="span">
					{band.caption}
				</Typography>
			)}
		</span>
	</Panel.Row>
);

const Turnout = ({ title, bands, records = [] }: CommunityTurnout) => (
	<Panel>
		<Panel.Header label={title} />
		<Panel.Rows>
			{bands.map((band) => (
				<TurnoutRow
					key={band.label}
					band={band}
					label={<Badge color={band.color}>{band.label}</Badge>}
				/>
			))}
			{records.map((record) => (
				<TurnoutRow
					key={record.label}
					band={record}
					label={
						<Typography variant="subtitle" as="span">
							{record.label}
						</Typography>
					}
				/>
			))}
		</Panel.Rows>
	</Panel>
);

const WhereEveryoneIs = ({ title, track, empty }: CommunityMap) => (
	<Panel>
		<Panel.Header label={title} />
		<Panel.Body>
			{track === undefined ? (
				<Typography variant="hint" as="span">
					{empty}
				</Typography>
			) : (
				<ClimbMap {...track} />
			)}
		</Panel.Body>
	</Panel>
);

const LeaderBoards = ({ boards }: { boards: readonly CommunityLeaders[] }) => {
	const [showing, setShowing] = useState<string | undefined>(undefined);
	const board = boards.find(({ title }) => title === showing) ?? boards[0];

	if (board === undefined) return null;

	return (
		<Panel>
			<Panel.Header
				label={COPY.leaders}
				summary={board.summary}
				trailing={
					boards.length < 2 ? undefined : (
						<Segmented
							label={COPY.boards}
							items={boards.map(({ title }) => ({
								value: title,
								label: title,
							}))}
							value={board.title}
							onSelect={setShowing}
						/>
					)
				}
			/>
			{board.seats.length === 0 ? null : (
				<Panel.Rows>
					{board.seats.map((seat) => (
						<Panel.Row
							key={seat.category}
							theme={seat.leader?.you === true ? YOUR_SEAT_COLOR : undefined}
						>
							<CategoryLeader {...seat} />
						</Panel.Row>
					))}
				</Panel.Rows>
			)}
		</Panel>
	);
};

const FivePolls = ({ title, tally, polls, review }: CommunityPolls) => (
	<Panel>
		<Panel.Header
			label={title}
			meta={
				tally === undefined ? undefined : (
					<span className={TALLY}>
						{COPY.you}
						<Badge>{tally}</Badge>
					</span>
				)
			}
		/>
		<Panel.Rows>
			{polls.map((poll) => (
				<PollResult key={poll.index} {...poll} />
			))}
		</Panel.Rows>
		{review === undefined ? null : (
			<Panel.Footer>
				<Button
					tone="action"
					width="full"
					label={review.label}
					onPress={review.onReview}
				/>
			</Panel.Footer>
		)}
	</Panel>
);

export const CommunityScreen = ({
	header,
	turnout,
	map,
	incidents,
	hallOfFame,
	leaders,
	polls,
	advertisement,
	width = "wide",
	ground = "bare",
}: CommunityScreenProps) => (
	<Screen gate={header.swatch.theme} width={width} ground={ground}>
		<CommunityHeading {...header} />
		<WhereEveryoneIs {...map} />
		<div className={COLUMNS}>
			<div className={COLUMN}>
				<FivePolls {...polls} />
				{advertisement}
			</div>
			<div className={COLUMN}>
				{hallOfFame === undefined ? null : <HallOfFame {...hallOfFame} />}
				<Turnout {...turnout} />
				{incidents === undefined ? null : <IncidentsPanel {...incidents} />}
				<LeaderBoards boards={leaders} />
			</div>
		</div>
	</Screen>
);
