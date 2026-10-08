import type { ReactNode } from "react";

import type { GateSwatch } from "~/modules/run/gate/domain/swatch.model";
import type {
	HubBuild,
	HubHeadline,
	HubIncident,
	HubMark,
	HubPress,
	RunSoFar,
	RunSoFarNext,
	RunSoFarQuote,
	RunSoFarRow,
	TodayCommunity,
	TodayShop,
} from "~/modules/run/run/application/todayScreen.viewmodel";
import { Action } from "~/ui/kanto-theme/Action.ui";
import { Audit } from "~/ui/kanto-theme/Audit.ui";
import { Badge } from "~/ui/kanto-theme/Badge.ui";
import { Button } from "~/ui/kanto-theme/Button.ui";
import { ClimberStack } from "~/ui/kanto-theme/Climber.ui";
import { ConfigChip } from "~/ui/kanto-theme/ConfigChip.ui";
import { COVERAGE_BAND_COLOR } from "~/ui/kanto-theme/CoverageBar.ui";
import { Fold } from "~/ui/kanto-theme/Fold.ui";
import { Icon } from "~/ui/kanto-theme/Icon.ui";
import { Panel } from "~/ui/kanto-theme/Panel.ui";
import { RunReadout } from "~/ui/kanto-theme/RunReadout.ui";
import { Screen } from "~/ui/kanto-theme/Screen.ui";
import { Swatch } from "~/ui/kanto-theme/Swatch.ui";
import { Typography } from "~/ui/kanto-theme/Typography.ui";
import { Weight } from "~/ui/kanto-theme/Weight.ui";
import { WeightTrack } from "~/ui/kanto-theme/WeightTrack.ui";

export const COPY = {
	runSoFar: "Run so far",
	notStarted: "not started",
	build: "Build",
	weightFree: "weight free",
	changeInShop: "change in shop",
	community: "Community",
} as const;

const PAGE = "screen-rise grid w-full gap-6 md:grid-cols-2 md:items-start";
const FULL = "md:col-span-2";
const HEADLINE = "flex min-w-0 items-center gap-5 md:self-stretch";
const HEADLINE_LINES = "flex min-w-0 flex-col gap-1.5";
const TITLE = "text-2xl leading-tight font-extrabold md:text-3xl";
const CLOCK = "block text-theme tabular-nums";
const CLOCK_SECONDS = "ml-2 text-lg font-medium text-theme-muted";
const SUBTEXT = "text-theme-soft";
const LOCK_SEAT = "hub-breathe inline-flex rounded-lg";
const INCIDENTS =
	"flex flex-col gap-2 rounded-lg border border-theme-faint px-3 py-2";
const FACES_LINE = "flex min-w-0 flex-wrap items-center gap-3 text-theme-muted";
const ROOM_COUNT = "inline-flex items-center gap-2 whitespace-nowrap";
const LEADS_ON = "size-4";
const ROW_NAME = "min-w-0 truncate text-lg font-bold";
const ROW_LINES = "flex min-w-0 flex-col";
const ROW_NAME_NEXT = "min-w-0 truncate text-lg text-theme-muted";
const ROW_NOTE = "text-sm text-theme-soft";
const FIGURES = "flex flex-wrap items-center gap-1.5";
const CHIPS = "flex flex-col gap-3";
const BUILD_FOOT = "flex flex-wrap items-center justify-between gap-3";
const FIGURE_LINE =
	"flex flex-wrap items-center gap-2 text-sm text-theme-muted";

const MARK_SIZE = "hero";
const ROW_SWATCH_SIZE = "large";
const FACE_SIZE = "sm";
const ASIDE_SIZE = "lg";
const SHOP_ICON = "shop";
const LOCK_ICON = "lock";
const LEADS_ON_ICON = "forward";
const EARNED_COLOR = "viridian";

export type TodayPressProps = HubPress & {
	onPress?: () => void;
};

export type TodayShopProps = TodayShop & {
	onPress: () => void;
};

export type TodayBuildProps = HubBuild & {
	shopHref?: string;
	openInfo: ReadonlySet<string>;
	onToggleInfo: (id: string) => void;
};

export type TodayCommunityProps = TodayCommunity & {
	href: string;
};

export type TodayScreenProps = {
	swatch: GateSwatch;
	headline: HubHeadline;
	press: TodayPressProps;
	shop: TodayShopProps | null;
	incidents: readonly HubIncident[];
	community: TodayCommunityProps | null;
	runSoFar: RunSoFar | null;
	build: TodayBuildProps | null;
	refusal?: string;
	advertisement?: ReactNode;
};

const HeadlineMark = ({
	mark,
	swatch,
}: {
	mark: HubMark;
	swatch: GateSwatch;
}) =>
	mark.kind === "lock" ? (
		<span className={LOCK_SEAT}>
			<Swatch
				state="current"
				swatch={swatch}
				size={MARK_SIZE}
				icon={LOCK_ICON}
			/>
		</span>
	) : (
		<Swatch
			state="current"
			swatch={swatch}
			size={MARK_SIZE}
			count={mark.count}
		/>
	);

const Headline = ({
	readout,
	title,
	clock,
	subtext,
	mark,
	swatch,
}: HubHeadline & { swatch: GateSwatch }) => (
	<header className={HEADLINE}>
		<HeadlineMark mark={mark} swatch={swatch} />
		<div className={HEADLINE_LINES}>
			{readout === null ? null : <RunReadout {...readout} />}
			<h1 className={TITLE}>
				{title}
				{clock === null ? null : (
					<span className={CLOCK}>
						{clock.main}
						<span className={CLOCK_SECONDS}>{clock.seconds}</span>
					</span>
				)}
			</h1>
			<p className={SUBTEXT}>{subtext}</p>
		</div>
	</header>
);

const Press = ({
	label,
	note,
	mark,
	pollsLeft,
	onPress,
	swatch,
}: TodayPressProps & { swatch: GateSwatch }) =>
	mark === "shop" ? (
		<Action label={label} note={note} icon={SHOP_ICON} onPress={onPress} />
	) : (
		<Action
			label={label}
			note={note}
			swatch={{ state: "current", swatch, count: pollsLeft }}
			onPress={onPress}
		/>
	);

const ShopAside = ({ label, open, detail, hint, onPress }: TodayShopProps) => (
	<Button
		size={ASIDE_SIZE}
		width="fill"
		tone="ambient"
		icon={SHOP_ICON}
		label={label}
		detail={detail}
		detailOn="always"
		hint={hint}
		disabled={!open}
		onPress={onPress}
	/>
);

const Incidents = ({ incidents }: { incidents: readonly HubIncident[] }) => (
	<div className={INCIDENTS}>
		{incidents.map((incident) => (
			<Audit
				key={incident.id}
				layout="row"
				code={incident.code}
				name={incident.name}
				cue={incident.cue}
				sender={incident.sender}
			/>
		))}
	</div>
);

const CommunityRow = ({
	count,
	detail,
	faces,
	overflow,
	href,
}: TodayCommunityProps) => (
	<Panel.Rows>
		<Panel.Row
			href={href}
			trailing={
				<Typography variant="subtitle" as="span">
					{COPY.community}
					<Icon name={LEADS_ON_ICON} className={LEADS_ON} />
				</Typography>
			}
		>
			<span className={FACES_LINE}>
				<ClimberStack climbers={faces} overflow={overflow} size={FACE_SIZE} />
				<span className={ROOM_COUNT}>
					<Badge>{count}</Badge>
					<span>{detail}</span>
				</span>
			</span>
		</Panel.Row>
	</Panel.Rows>
);

const ActionGroup = ({
	swatch,
	press,
	shop,
	incidents,
	community,
	refusal,
}: Pick<
	TodayScreenProps,
	"swatch" | "press" | "shop" | "incidents" | "community" | "refusal"
>) => (
	<Panel>
		<Panel.Body>
			<Press {...press} swatch={swatch} />
			{shop === null ? null : <ShopAside {...shop} />}
			{incidents.length === 0 ? null : <Incidents incidents={incidents} />}
			{refusal === undefined ? null : (
				<Typography variant="hint" as="span">
					{refusal}
				</Typography>
			)}
		</Panel.Body>
		{community === null ? null : <CommunityRow {...community} />}
	</Panel>
);

const RowFigures = ({ band, kb }: Pick<RunSoFarRow, "band" | "kb">) => (
	<span className={FIGURES}>
		<Badge color={COVERAGE_BAND_COLOR[band.id]}>{band.label}</Badge>
		<Badge>{kb}</Badge>
	</span>
);

const QuoteFigures = ({ band, kb, started, share }: RunSoFarQuote) => (
	<span className={FIGURES}>
		{started ? (
			<Badge color={COVERAGE_BAND_COLOR[band.id]}>
				{`${band.label} ${share}`}
			</Badge>
		) : (
			<Badge>{COPY.notStarted}</Badge>
		)}
		<Badge>{kb}</Badge>
	</span>
);

const NextRow = ({ swatch, note, quote }: RunSoFarNext) => (
	<Panel.Row
		trailing={quote === null ? undefined : <QuoteFigures {...quote} />}
	>
		<Swatch state="current" swatch={swatch} size={ROW_SWATCH_SIZE} />
		<span className={ROW_LINES}>
			<span className={ROW_NAME_NEXT}>{swatch.gateName}</span>
			<span className={ROW_NOTE}>{note}</span>
		</span>
	</Panel.Row>
);

const RunSoFarPanel = ({ earned, rows, next }: RunSoFar) => (
	<Fold
		title={COPY.runSoFar}
		badges={[{ label: earned, color: EARNED_COLOR }]}
		open
		flush
	>
		<Panel.Rows>
			{rows.map((row) => (
				<Panel.Row key={row.gate} trailing={<RowFigures {...row} />}>
					<Swatch
						state="discovered"
						swatch={row.swatch}
						size={ROW_SWATCH_SIZE}
					/>
					<span className={ROW_NAME}>{row.swatch.gateName}</span>
				</Panel.Row>
			))}
			{next === null ? null : <NextRow {...next} />}
		</Panel.Rows>
	</Fold>
);

const BuildPanel = ({
	rows,
	weight,
	held,
	free,
	shopHref,
	openInfo,
	onToggleInfo,
}: TodayBuildProps) => (
	<Fold title={COPY.build} badges={[{ label: weight }]} open>
		<WeightTrack fills={rows} held={held} caption={false} />
		<div className={CHIPS}>
			{rows.map((row) => (
				<ConfigChip
					key={row.id}
					name={row.name}
					badges={[]}
					slots={row.slots}
					version={row.version}
					info={{
						description: row.description,
						slots: row.slots,
						version: row.version,
					}}
					infoOpen={openInfo.has(row.id)}
					onToggleInfo={() => onToggleInfo(row.id)}
				/>
			))}
		</div>
		<div className={BUILD_FOOT}>
			<span className={FIGURE_LINE}>
				<Weight slots={free} />
				<span>{COPY.weightFree}</span>
			</span>
			{shopHref === undefined ? null : (
				<Button
					tone="bare"
					href={shopHref}
					label={COPY.changeInShop}
					icon={LEADS_ON_ICON}
				/>
			)}
		</div>
	</Fold>
);

export const TodayScreen = ({
	swatch,
	headline,
	press,
	shop,
	incidents,
	community,
	runSoFar,
	build,
	refusal,
	advertisement,
}: TodayScreenProps) => (
	<Screen gate={swatch.theme} width="wide" ground="bare">
		<div className={PAGE}>
			<Headline {...headline} swatch={swatch} />
			<ActionGroup
				swatch={swatch}
				press={press}
				shop={shop}
				incidents={incidents}
				community={community}
				refusal={refusal}
			/>
			{runSoFar === null ? null : <RunSoFarPanel {...runSoFar} />}
			{build === null ? null : <BuildPanel {...build} />}
			{advertisement === undefined ? null : (
				<div className={FULL}>{advertisement}</div>
			)}
		</div>
	</Screen>
);
