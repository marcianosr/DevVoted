import type { GateSwatch } from "~/modules/run/gate/domain/swatch.model";

import { Badge } from "./Badge.ui";
import { Button } from "./Button.ui";
import { CategoryLeader, type CategoryLeaderProps } from "./CategoryLeader.ui";
import { ClimberStack, type ClimberProps } from "./Climber.ui";
import { ClimbMap, type ClimbMapProps } from "./ClimbMap.ui";
import type { KantoColor } from "./colors";
import { Figures } from "./Figures.ui";
import { Icon, type IconName } from "./Icon.ui";
import { IncidentsPanel, type IncidentsPanelProps } from "./IncidentsPanel.ui";
import { Panel } from "./Panel.ui";
import { PollResult, type PollResultProps } from "./PollResult.ui";
import { Screen, type ScreenGround, type ScreenWidth } from "./Screen.ui";
import { Swatch } from "./Swatch.ui";
import { Typography } from "./Typography.ui";

const HEADER = "flex w-full flex-col gap-4";
const CONTROL_ROW = "flex w-full flex-wrap items-center gap-3";
const CONTROLS = "ml-auto flex shrink-0 flex-wrap items-center gap-3";
const TITLE_ROW = "flex w-full items-start gap-4";
const NAMING = "flex min-w-0 flex-col gap-1";
const STATS = "flex flex-wrap items-center gap-2";
const STAT = "flex items-center gap-1.5 text-theme-muted";

const SECTION = "flex w-full flex-col gap-3";
const SECTION_HEAD = "flex flex-wrap items-baseline gap-3";

const CLIMB_READING = "flex flex-wrap items-center gap-2 text-theme-faint";

const POLLS = "flex w-full flex-col gap-2";

const SWATCH_SIZE = "hero";
const CLIMBER_SIZE = "md";
const YOUR_SEAT_COLOR: KantoColor = "viridian";
const CONTROL_SIZE = "md";

export const COPY = {
	mapHint: "tap an avatar",
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

export type CommunityClimb = {
	title: string;
	standing: string;
	badge?: string;
	badgeColor?: KantoColor;
	reading: string;
	note?: string;
};

export type TurnoutBand = {
	label: string;
	count: string;
	color?: KantoColor;
	climbers: readonly ClimberProps[];
	overflow?: number;
};

export type CommunityTurnout = {
	title: string;
	when: string;
	bands: readonly TurnoutBand[];
};

export type CommunityLeaders = {
	title: string;
	summary?: string;
	seated?: string;
	seats: readonly CategoryLeaderProps[];
	footer?: string;
};

export type CommunityPolls = {
	title: string;
	summary?: string;
	polls: readonly PollResultProps[];
};

export type CommunityScreenProps = {
	header: CommunityHeader;
	climb: CommunityClimb;
	turnout: CommunityTurnout;
	map: CommunityMap;
	incidents?: IncidentsPanelProps;
	leaders: CommunityLeaders;
	polls: CommunityPolls;
	width?: ScreenWidth;
	ground?: ScreenGround;
};

const SectionHead = ({
	title,
	summary,
}: {
	title: string;
	summary?: string;
}) => (
	<div className={SECTION_HEAD}>
		<Typography variant="title" as="h3">
			{title}
		</Typography>
		{summary === undefined ? null : (
			<Typography variant="hint" as="span">
				{summary}
			</Typography>
		)}
	</div>
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
		<div className={CONTROL_ROW}>
			<span className={STAT}>
				<span role="img" aria-label={countdownHint}>
					<Icon name="clock" />
				</span>
				<Badge color={countdownColor}>{countdown}</Badge>
			</span>
			<span className={CONTROLS}>
				{shop === undefined ? null : (
					<Button
						size={CONTROL_SIZE}
						icon="shop"
						label={shop.label}
						disabled={shop.onPress === undefined}
						onPress={shop.onPress}
					/>
				)}
				<Button
					size={CONTROL_SIZE}
					tone="action"
					icon="gate"
					label={prep.label}
					disabled={prep.onPress === undefined}
					onPress={prep.onPress}
				/>
			</span>
		</div>

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
			</span>
		</div>

		<div className={STATS}>
			{stats.map((stat) => (
				<span key={stat.hint} className={STAT}>
					<span role="img" aria-label={stat.hint}>
						<Icon name={stat.icon} />
					</span>
					<Badge>{stat.label}</Badge>
				</span>
			))}
		</div>
	</header>
);

const YourClimb = ({
	title,
	standing,
	badge,
	badgeColor,
	reading,
	note,
}: CommunityClimb) => (
	<Panel>
		<Panel.Header
			label={title}
			badge={
				badge === undefined ? undefined : { label: badge, color: badgeColor }
			}
			meta={standing}
		/>
		<Panel.Body>
			<div className={CLIMB_READING}>
				<Figures text={reading} />
			</div>
		</Panel.Body>
		{note === undefined ? null : (
			<Panel.Footer>
				<Typography variant="hint">{note}</Typography>
			</Panel.Footer>
		)}
	</Panel>
);

const Turnout = ({ title, when, bands }: CommunityTurnout) => (
	<Panel>
		<Panel.Header label={title} meta={when} />
		<Panel.Rows>
			{bands.map((band) => (
				<Panel.Row
					key={band.label}
					trailing={
						<>
							<Badge color={band.color}>{band.count}</Badge>
							<ClimberStack
								climbers={band.climbers}
								overflow={band.overflow}
								size={CLIMBER_SIZE}
							/>
						</>
					}
				>
					<Typography variant="subtitle" as="span">
						{band.label}
					</Typography>
				</Panel.Row>
			))}
		</Panel.Rows>
	</Panel>
);

const WhereEveryoneIs = ({ title, track, empty }: CommunityMap) => (
	<Panel>
		<Panel.Header
			label={title}
			meta={track === undefined ? undefined : COPY.mapHint}
		/>
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

const CategoryLeaders = ({
	title,
	summary,
	seated,
	seats,
	footer,
}: CommunityLeaders) => (
	<Panel>
		<Panel.Header
			label={title}
			meta={
				<>
					{summary}
					{seated === undefined ? null : <Badge>{seated}</Badge>}
				</>
			}
		/>
		{seats.length === 0 ? null : (
			<Panel.Rows>
				{seats.map((seat) => (
					<Panel.Row
						key={seat.category}
						theme={seat.leader?.you === true ? YOUR_SEAT_COLOR : undefined}
					>
						<CategoryLeader {...seat} />
					</Panel.Row>
				))}
			</Panel.Rows>
		)}
		{footer === undefined ? null : (
			<Panel.Footer>
				<Typography variant="hint" as="span">
					{footer}
				</Typography>
			</Panel.Footer>
		)}
	</Panel>
);

const FivePolls = ({ title, summary, polls }: CommunityPolls) => (
	<section className={SECTION}>
		<SectionHead title={title} summary={summary} />
		<div className={POLLS}>
			{polls.map((poll) => (
				<PollResult key={poll.index} {...poll} />
			))}
		</div>
	</section>
);

export const CommunityScreen = ({
	header,
	climb,
	turnout,
	map,
	incidents,
	leaders,
	polls,
	width,
	ground = "bare",
}: CommunityScreenProps) => (
	<Screen gate={header.swatch.theme} width={width} ground={ground}>
		<CommunityHeading {...header} />
		<YourClimb {...climb} />
		<Turnout {...turnout} />
		<WhereEveryoneIs {...map} />
		{incidents === undefined ? null : <IncidentsPanel {...incidents} />}
		<CategoryLeaders {...leaders} />
		<FivePolls {...polls} />
	</Screen>
);
