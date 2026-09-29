import { clsx } from "clsx";

import type { GateSwatch } from "~/modules/run/gate/domain/swatch.model";
import type { TodayRung } from "~/modules/run/run/application/todayScreen.viewmodel";
import { Action } from "~/ui/kanto-theme/Action.ui";
import { Badge } from "~/ui/kanto-theme/Badge.ui";
import { Button } from "~/ui/kanto-theme/Button.ui";
import { COVERAGE_BAND_COLOR } from "~/ui/kanto-theme/CoverageBar.ui";
import { CoverageRing } from "~/ui/kanto-theme/CoverageRing.ui";
import { Icon } from "~/ui/kanto-theme/Icon.ui";
import { Panel } from "~/ui/kanto-theme/Panel.ui";
import { Screen } from "~/ui/kanto-theme/Screen.ui";
import type { SwatchFill } from "~/ui/kanto-theme/Swatch.ui";
import { SwatchTrack } from "~/ui/kanto-theme/SwatchTrack.ui";
import { Typography } from "~/ui/kanto-theme/Typography.ui";

export const COPY = {
	coverage: "Coverage so far",
	community: "Community",
	at: "at",
} as const;

const LEDE =
	"flex w-full flex-col gap-4 rounded-2xl border border-theme-faint bg-theme-faint p-4";
const PRESS_ROW = "flex w-full flex-col gap-3 sm:flex-row-reverse";
const PRESS_SEAT = "flex w-full sm:min-w-0 sm:flex-1";
const ASIDE_SEAT = "flex w-full sm:w-auto sm:shrink-0";
const STANDING = "flex w-full flex-wrap items-center gap-x-4 gap-y-2";
const CARDS = "grid w-full gap-4";
const CARDS_PAIR = "sm:grid-cols-2";
const CARD_ROW = "py-4";
const NAMING = "flex min-w-0 flex-col gap-1";
const DETAIL = "flex flex-wrap items-center gap-1.5";
const RUNGS = "flex flex-wrap items-center gap-x-3 gap-y-1.5";
const RUNG = "flex items-center gap-1.5";
const LEADING = "size-7";
const LEADS_ON = "size-4";

const FULL_RING = 100;
const TRACK_SIZE = "small";
const ASIDE_SIZE = "lg";
const ASIDE_TONE = "ambient";
const SHOP_ICON = "shop";
const COMMUNITY_ICON = "community";
const LEADS_ON_ICON = "forward";

export type TodayPressProps = {
	label: string;
	note: string;
	pollsLeft: number;
	onPress?: () => void;
};

export type TodayShopProps = {
	label: string;
	hint?: string;
	open: boolean;
	onPress: () => void;
};

export type TodayStandingProps = {
	swatches: readonly SwatchFill[];
	line: string;
};

export type TodayCoverageProps = {
	held: number;
	demand: number;
	rungs: readonly TodayRung[];
};

export type TodayCommunityProps = {
	count: number;
	detail: string;
	href: string;
};

export type TodayScreenProps = {
	swatch: GateSwatch;
	press: TodayPressProps;
	shop: TodayShopProps;
	standing: TodayStandingProps | null;
	coverage: TodayCoverageProps | null;
	community: TodayCommunityProps | null;
	refusal?: string;
};

const Rungs = ({ rungs }: { rungs: readonly TodayRung[] }) => (
	<span className={RUNGS}>
		{rungs.map((rung) => (
			<span key={rung.band} className={RUNG}>
				<Badge color={COVERAGE_BAND_COLOR[rung.band]}>{rung.label}</Badge>
				{COPY.at}
				<Badge color={COVERAGE_BAND_COLOR[rung.band]}>{rung.at}</Badge>
			</span>
		))}
	</span>
);

const CoverageCard = ({ held, demand, rungs }: TodayCoverageProps) => (
	<Panel>
		<Panel.Body>
			<CoverageRing
				held={held}
				demand={demand}
				ceiling={FULL_RING}
				title={COPY.coverage}
				note={<Rungs rungs={rungs} />}
			/>
		</Panel.Body>
	</Panel>
);

const CommunityCard = ({ count, detail, href }: TodayCommunityProps) => (
	<Panel>
		<Panel.Rows>
			<Panel.Row
				href={href}
				className={CARD_ROW}
				trailing={<Icon name={LEADS_ON_ICON} className={LEADS_ON} />}
			>
				<Icon name={COMMUNITY_ICON} className={LEADING} />
				<span className={NAMING}>
					<Typography variant="subtitle" as="span">
						{COPY.community}
					</Typography>
					<span className={DETAIL}>
						<Badge>{count}</Badge>
						<Typography variant="hint" as="span">
							{detail}
						</Typography>
					</span>
				</span>
			</Panel.Row>
		</Panel.Rows>
	</Panel>
);

export const TodayScreen = ({
	swatch,
	press,
	shop,
	standing,
	coverage,
	community,
	refusal,
}: TodayScreenProps) => (
	<Screen gate={swatch.theme} width="default" ground="bare">
		<div className={LEDE}>
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
					<Button
						size={ASIDE_SIZE}
						width="fill"
						tone={ASIDE_TONE}
						icon={SHOP_ICON}
						label={shop.label}
						hint={shop.hint}
						disabled={!shop.open}
						onPress={shop.onPress}
					/>
				</div>
			</div>

			{standing === null ? null : (
				<div className={STANDING}>
					<SwatchTrack swatches={standing.swatches} size={TRACK_SIZE} />
					<Typography variant="hint" as="span">
						{standing.line}
					</Typography>
				</div>
			)}

			{refusal === undefined ? null : (
				<Typography variant="hint" as="span">
					{refusal}
				</Typography>
			)}
		</div>

		<div
			className={clsx(
				CARDS,
				coverage !== null && community !== null && CARDS_PAIR
			)}
		>
			{coverage === null ? null : <CoverageCard {...coverage} />}
			{community === null ? null : <CommunityCard {...community} />}
		</div>
	</Screen>
);
