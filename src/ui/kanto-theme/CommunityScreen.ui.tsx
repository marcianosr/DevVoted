import type { ReactNode } from "react";

import type { GateSwatch } from "~/modules/run/gate/domain/swatch.model";

import { Badge } from "./Badge.ui";
import { Button } from "./Button.ui";
import { Climber, ClimberStack, type ClimberProps } from "./Climber.ui";
import type { KantoColor } from "./colors";
import { Figures } from "./Figures.ui";
import { Icon, type IconName } from "./Icon.ui";
import { Panel } from "./Panel.ui";
import { PollResult, type PollResultProps } from "./PollResult.ui";
import { Screen, type ScreenWidth } from "./Screen.ui";
import { Swatch } from "./Swatch.ui";
import { SwatchChip } from "./SwatchChip.ui";
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
const SECTION_ASIDE = "ml-auto shrink-0";

const CLIMB_HEAD = "flex flex-wrap items-center gap-3";
const CLIMB_BADGE = "ml-auto shrink-0";
const CLIMB_READING = "flex flex-wrap items-center gap-2 text-theme-faint";
const CLIMB_NOTE = "border-t border-theme-faint pt-3";

const TURNOUT_ROW =
	"flex flex-wrap items-center gap-3 border-t border-theme-faint pt-3 first:border-t-0 first:pt-0";
const TURNOUT_COUNT = "ml-auto shrink-0";

const PLACEHOLDER =
	"flex w-full items-center justify-center rounded-2xl border border-dashed border-theme-faint bg-theme-faint px-4 py-10 text-center";

const STANDOUT_GRID = "grid w-full gap-3 sm:grid-cols-2 lg:grid-cols-4";
const STANDOUT_CARD =
	"flex flex-col gap-2 rounded-2xl border border-theme-faint bg-theme-faint p-3";
const STANDOUT_HEAD = "flex items-center gap-2";
const STANDOUT_NAMING = "flex min-w-0 flex-col";
const STANDOUT_VALUE = "flex flex-wrap items-center gap-2";

const POLLS = "flex w-full flex-col gap-2";

const TALK_ROW =
	"flex items-start gap-3 border-t border-theme-faint pt-3 first:border-t-0 first:pt-0";
const TALK_BODY = "flex min-w-0 flex-1 flex-col gap-1";
const TALK_HEAD = "flex flex-wrap items-baseline gap-2";
const TALK_BADGE = "ml-auto shrink-0";

const SWATCH_SIZE = "hero";
const CLIMBER_SIZE = "md";
const CONTROL_SIZE = "md";

const MAP_PLACEHOLDER = "The climb map lands here";

export type CommunityStat = { icon: IconName; label: string; hint: string };

export type CommunityHeader = {
	swatch: GateSwatch;
	title: string;
	subtitle?: string;
	countdown: string;
	countdownColor?: KantoColor;
	countdownHint: string;
	stats: readonly CommunityStat[];
	shop: { label: string; onPress?: () => void };
	prep: { label: string; onPress?: () => void };
};

export type CommunityClimb = {
	swatch: GateSwatch;
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

export type Standout = {
	title: string;
	climber: ClimberProps;
	value: string;
	tag?: string;
	tagColor?: KantoColor;
};

export type CommunityStandouts = {
	title: string;
	summary?: string;
	dex?: { label: string; onPress?: () => void };
	awards: readonly Standout[];
};

export type CommunityPolls = {
	title: string;
	summary?: string;
	polls: readonly PollResultProps[];
};

export type ConversationEntry = {
	climber: ClimberProps;
	at: string;
	said: string;
	gate?: { swatch: GateSwatch; label: string };
	badge?: string;
	badgeColor?: KantoColor;
};

export type CommunityConversation = {
	title: string;
	summary?: string;
	entries: readonly ConversationEntry[];
};

export type CommunityScreenProps = {
	header: CommunityHeader;
	climb: CommunityClimb;
	turnout: CommunityTurnout;
	map: { title: string; summary?: string };
	standouts: CommunityStandouts;
	polls: CommunityPolls;
	conversation: CommunityConversation;
	width?: ScreenWidth;
};

const SectionHead = ({
	title,
	summary,
	aside,
}: {
	title: string;
	summary?: string;
	aside?: ReactNode;
}) => (
	<div className={SECTION_HEAD}>
		<Typography variant="title" as="h2">
			{title}
		</Typography>
		{summary === undefined ? null : (
			<Typography variant="hint" as="span">
				{summary}
			</Typography>
		)}
		{aside === undefined ? null : (
			<span className={SECTION_ASIDE}>{aside}</span>
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
				<Button
					size={CONTROL_SIZE}
					icon="shop"
					label={shop.label}
					disabled={shop.onPress === undefined}
					onPress={shop.onPress}
				/>
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
	swatch,
	title,
	standing,
	badge,
	badgeColor,
	reading,
	note,
}: CommunityClimb) => (
	<Panel>
		<div className={CLIMB_HEAD}>
			<SwatchChip swatch={{ state: "discovered", swatch }} label={title} />
			<Typography variant="hint" as="span">
				{standing}
			</Typography>
			{badge === undefined ? null : (
				<span className={CLIMB_BADGE}>
					<Badge color={badgeColor}>{badge}</Badge>
				</span>
			)}
		</div>
		<div className={CLIMB_READING}>
			<Figures text={reading} />
		</div>
		{note === undefined ? null : (
			<div className={CLIMB_NOTE}>
				<Typography variant="hint">{note}</Typography>
			</div>
		)}
	</Panel>
);

const Turnout = ({ title, when, bands }: CommunityTurnout) => (
	<section className={SECTION}>
		<SectionHead title={title} summary={when} />
		<Panel>
			{bands.map((band) => (
				<div key={band.label} className={TURNOUT_ROW}>
					<Typography variant="subtitle" as="h3">
						{band.label}
					</Typography>
					<span className={TURNOUT_COUNT}>
						<Badge color={band.color}>{band.count}</Badge>
					</span>
					<ClimberStack
						climbers={band.climbers}
						overflow={band.overflow}
						size={CLIMBER_SIZE}
					/>
				</div>
			))}
		</Panel>
	</section>
);

const WhereEveryoneIs = ({
	title,
	summary,
}: {
	title: string;
	summary?: string;
}) => (
	<section className={SECTION}>
		<SectionHead title={title} summary={summary} />
		<div className={PLACEHOLDER}>
			<Typography variant="hint" as="span">
				{MAP_PLACEHOLDER}
			</Typography>
		</div>
	</section>
);

const StandingOut = ({ title, summary, dex, awards }: CommunityStandouts) => (
	<section className={SECTION}>
		<SectionHead
			title={title}
			summary={summary}
			aside={
				dex === undefined ? undefined : (
					<Button
						icon="review"
						label={dex.label}
						disabled={dex.onPress === undefined}
						onPress={dex.onPress}
					/>
				)
			}
		/>
		<div className={STANDOUT_GRID}>
			{awards.map((award) => (
				<div key={award.title} className={STANDOUT_CARD}>
					<div className={STANDOUT_HEAD}>
						<Climber {...award.climber} size={CLIMBER_SIZE} />
						<span className={STANDOUT_NAMING}>
							<Typography variant="subtitle" as="h3">
								{award.title}
							</Typography>
							<Typography variant="hint" as="span">
								{award.climber.name}
							</Typography>
						</span>
					</div>
					<div className={STANDOUT_VALUE}>
						{award.tag === undefined ? null : (
							<Badge color={award.tagColor}>{award.tag}</Badge>
						)}
						<Figures text={award.value} />
					</div>
				</div>
			))}
		</div>
	</section>
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

const Conversation = ({ title, summary, entries }: CommunityConversation) => (
	<section className={SECTION}>
		<SectionHead title={title} summary={summary} />
		<Panel>
			{entries.map((entry) => (
				<div key={`${entry.climber.name}-${entry.at}`} className={TALK_ROW}>
					<Climber {...entry.climber} size={CLIMBER_SIZE} />
					<span className={TALK_BODY}>
						<span className={TALK_HEAD}>
							<Typography variant="subtitle" as="h3">
								{entry.climber.name}
							</Typography>
							<Typography variant="hint" as="span">
								{entry.at}
							</Typography>
							{entry.badge === undefined ? null : (
								<span className={TALK_BADGE}>
									<Badge color={entry.badgeColor}>{entry.badge}</Badge>
								</span>
							)}
						</span>
						<span className={TALK_HEAD}>
							{entry.gate === undefined ? null : (
								<SwatchChip
									swatch={{ state: "discovered", swatch: entry.gate.swatch }}
									label={entry.gate.label}
								/>
							)}
							<Typography variant="caption" as="span">
								{entry.said}
							</Typography>
						</span>
					</span>
				</div>
			))}
		</Panel>
	</section>
);

export const CommunityScreen = ({
	header,
	climb,
	turnout,
	map,
	standouts,
	polls,
	conversation,
	width = "wide",
}: CommunityScreenProps) => (
	<Screen gate={header.swatch.theme} width={width}>
		<CommunityHeading {...header} />
		<YourClimb {...climb} />
		<Turnout {...turnout} />
		<WhereEveryoneIs {...map} />
		<StandingOut {...standouts} />
		<FivePolls {...polls} />
		<Conversation {...conversation} />
	</Screen>
);
