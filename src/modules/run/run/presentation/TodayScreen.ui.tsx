import { clsx } from "clsx";

import type { GateSwatch } from "~/modules/run/gate/domain/swatch.model";
import type {
	HubBuild,
	HubIncident,
	HubStrip,
	RunSoFar,
	RunSoFarRow,
	TodayCommunity,
} from "~/modules/run/run/application/todayScreen.viewmodel";
import { Action } from "~/ui/kanto-theme/Action.ui";
import { Audit } from "~/ui/kanto-theme/Audit.ui";
import { Badge } from "~/ui/kanto-theme/Badge.ui";
import { Balance } from "~/ui/kanto-theme/Balance.ui";
import { Button } from "~/ui/kanto-theme/Button.ui";
import { COVERAGE_BAND_COLOR } from "~/ui/kanto-theme/CoverageBar.ui";
import { Icon } from "~/ui/kanto-theme/Icon.ui";
import { Panel } from "~/ui/kanto-theme/Panel.ui";
import { RunReadout } from "~/ui/kanto-theme/RunReadout.ui";
import { Screen } from "~/ui/kanto-theme/Screen.ui";
import { Swatch } from "~/ui/kanto-theme/Swatch.ui";
import { SwatchTrack } from "~/ui/kanto-theme/SwatchTrack.ui";
import { Typography } from "~/ui/kanto-theme/Typography.ui";
import { Version } from "~/ui/kanto-theme/Version.ui";
import { Weight } from "~/ui/kanto-theme/Weight.ui";

export const COPY = {
	storage: "Storage",
	runSoFar: "Run so far",
	earned: "earned",
	next: "next",
	notStarted: "not started",
	build: "Build",
	weight: "weight",
	weightFree: "weight free",
	changeInShop: "change in shop",
	community: "Community",
	divider: "·",
} as const;

const STRIP =
	"flex flex-wrap items-center justify-between gap-3 border-b border-theme-faint px-4 py-3";
const STRIP_META = "flex flex-wrap items-center gap-2 text-xs text-theme-muted";
const PRESS_ROW = "flex w-full flex-col gap-3 sm:flex-row";
const PRESS_SEAT = "flex w-full sm:min-w-0 sm:flex-1";
const ASIDE_SEAT = "flex w-full sm:w-auto sm:shrink-0";
const INCIDENTS =
	"flex flex-col gap-2 rounded-lg border border-theme-faint px-3 py-2";
const PANELS = "grid w-full gap-4";
const PANELS_PAIR = "md:grid-cols-2";
const ROW_NAME = "min-w-0 truncate text-sm font-bold";
const ROW_NAME_NEXT = "min-w-0 truncate text-sm text-theme-muted";
const HEADER_META = "flex items-center gap-2";
const FIGURES = "flex flex-wrap items-center gap-1.5";
const FIGURE_LINE =
	"flex flex-wrap items-center gap-2 text-sm text-theme-muted";
const LEADS_ON = "size-4";

const TRACK_SIZE = "small";
const ROW_SWATCH_SIZE = "small";
const ASIDE_SIZE = "lg";
const SHOP_ICON = "shop";
const LEADS_ON_ICON = "forward";

export type TodayPressProps = {
	label: string;
	note: string;
	pollsLeft: number;
	onPress?: () => void;
};

export type TodayShopProps = {
	label: string;
	open: boolean;
	detail?: string;
	highlighted: boolean;
	hint?: string;
	onPress: () => void;
};

export type TodayBuildProps = HubBuild & {
	shopHref?: string;
};

export type TodayCommunityProps = TodayCommunity & {
	href: string;
};

export type TodayScreenProps = {
	swatch: GateSwatch;
	strip: HubStrip | null;
	press: TodayPressProps;
	shop: TodayShopProps;
	incidents: readonly HubIncident[];
	runSoFar: RunSoFar | null;
	build: TodayBuildProps | null;
	community: TodayCommunityProps | null;
	refusal?: string;
};

const Strip = ({ swatches, storage, ...readout }: HubStrip) => (
	<div className={STRIP}>
		<SwatchTrack swatches={swatches} size={TRACK_SIZE} />
		<span className={STRIP_META}>
			<RunReadout {...readout} />
			<Balance label={COPY.storage} kb={storage} layout="inline" />
		</span>
	</div>
);

const ShopAside = ({
	label,
	open,
	detail,
	highlighted,
	hint,
	onPress,
}: TodayShopProps) => (
	<Button
		size={ASIDE_SIZE}
		width="fill"
		tone={highlighted ? "action" : "ambient"}
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

const RunSoFarRowFigures = ({
	band,
	kb,
	share,
}: Pick<RunSoFarRow, "band" | "kb"> & { share?: string }) => (
	<span className={FIGURES}>
		<Badge color={COVERAGE_BAND_COLOR[band.id]}>
			{share === undefined ? band.label : `${band.label} ${share}`}
		</Badge>
		<Badge>{kb}</Badge>
	</span>
);

const RunSoFarPanel = ({ earned, rows, next }: RunSoFar) => (
	<Panel>
		<Panel.Header
			label={COPY.runSoFar}
			meta={
				<span className={HEADER_META}>
					<Badge>{earned}</Badge>
					<span>{COPY.earned}</span>
				</span>
			}
		/>
		<Panel.Rows>
			{rows.map((row) => (
				<Panel.Row
					key={row.gate}
					trailing={<RunSoFarRowFigures band={row.band} kb={row.kb} />}
				>
					<Swatch
						state="discovered"
						swatch={row.swatch}
						size={ROW_SWATCH_SIZE}
					/>
					<span className={ROW_NAME}>{row.swatch.gateName}</span>
				</Panel.Row>
			))}
			{next === null ? null : (
				<Panel.Row
					trailing={
						next.started ? (
							<RunSoFarRowFigures
								band={next.band}
								kb={next.kb}
								share={next.share}
							/>
						) : (
							<span className={FIGURES}>
								<Badge>{COPY.notStarted}</Badge>
								<Badge>{next.kb}</Badge>
							</span>
						)
					}
				>
					<Swatch
						state="discovered"
						swatch={next.swatch}
						size={ROW_SWATCH_SIZE}
					/>
					<span className={ROW_NAME_NEXT}>
						{`${next.swatch.gateName} ${COPY.divider} ${COPY.next}`}
					</span>
				</Panel.Row>
			)}
		</Panel.Rows>
	</Panel>
);

const BuildPanel = ({ rows, weight, free, shopHref }: TodayBuildProps) => (
	<Panel>
		<Panel.Header
			label={COPY.build}
			meta={
				<span className={HEADER_META}>
					<Badge>{weight}</Badge>
					<span>{COPY.weight}</span>
				</span>
			}
		/>
		<Panel.Rows>
			{rows.map((row) => (
				<Panel.Row key={row.id} trailing={<Version version={row.version} />}>
					<Weight slots={row.slots} />
					<span className={ROW_NAME}>{row.name}</span>
				</Panel.Row>
			))}
		</Panel.Rows>
		<Panel.Footer
			trailing={
				shopHref === undefined ? undefined : (
					<Button
						tone="bare"
						href={shopHref}
						label={COPY.changeInShop}
						icon={LEADS_ON_ICON}
					/>
				)
			}
		>
			<span className={FIGURE_LINE}>
				<Weight slots={free} />
				<span>{COPY.weightFree}</span>
			</span>
		</Panel.Footer>
	</Panel>
);

const CommunityStrip = ({
	count,
	detail,
	ahead,
	aheadDetail,
	href,
}: TodayCommunityProps) => (
	<Panel>
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
				<span className={FIGURE_LINE}>
					<Badge>{count}</Badge>
					<span>{detail}</span>
					{ahead === null ? null : (
						<>
							<span aria-hidden>{COPY.divider}</span>
							<Badge>{ahead}</Badge>
							<span>{aheadDetail}</span>
						</>
					)}
				</span>
			</Panel.Row>
		</Panel.Rows>
	</Panel>
);

export const TodayScreen = ({
	swatch,
	strip,
	press,
	shop,
	incidents,
	runSoFar,
	build,
	community,
	refusal,
}: TodayScreenProps) => (
	<Screen gate={swatch.theme} width="default" ground="bare">
		<Panel>
			{strip === null ? null : <Strip {...strip} />}
			<Panel.Body>
				<div className={PRESS_ROW}>
					<div className={PRESS_SEAT}>
						<Action
							label={press.label}
							note={press.note}
							swatch={{ state: "current", swatch, count: press.pollsLeft }}
							onPress={press.onPress}
						/>
					</div>
					<div className={ASIDE_SEAT}>
						<ShopAside {...shop} />
					</div>
				</div>

				{incidents.length === 0 ? null : <Incidents incidents={incidents} />}

				{refusal === undefined ? null : (
					<Typography variant="hint" as="span">
						{refusal}
					</Typography>
				)}
			</Panel.Body>
		</Panel>

		{runSoFar === null && build === null ? null : (
			<div
				className={clsx(
					PANELS,
					runSoFar !== null && build !== null && PANELS_PAIR
				)}
			>
				{runSoFar === null ? null : <RunSoFarPanel {...runSoFar} />}
				{build === null ? null : <BuildPanel {...build} />}
			</div>
		)}

		{community === null ? null : <CommunityStrip {...community} />}
	</Screen>
);
