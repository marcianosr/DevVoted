import { clsx } from "clsx";

import type {
	AppearanceView,
	BorderPick,
	TitlePick,
} from "~/modules/account/profile/application/appearance.viewmodel";
import type { SwatchPick } from "~/modules/account/profile/application/swatchPick.viewmodel";
import type { Tally } from "~/modules/collection/dex/domain/tally.model";
import { WORN_TITLE_CAP } from "~/modules/account/profile/domain/title.model";
import { HELD_OF } from "~/shared/lib/copy";
import { Badge } from "~/ui/kanto-theme/Badge.ui";
import { Button } from "~/ui/kanto-theme/Button.ui";
import { Panel } from "~/ui/kanto-theme/Panel.ui";
import { Redaction } from "~/ui/kanto-theme/Redaction.ui";
import { Swatch } from "~/ui/kanto-theme/Swatch.ui";

const missingOf = ({ held, total }: Tally) => total - held;

export const COPY = {
	border: "Border",
	owned: "owned",
	defaultFrame: "–",
	moreBorders: (tally: Tally) => `+${missingOf(tally)}`,
	moreBordersCaption: "in Dex",
	moreBordersHint: (tally: Tally) =>
		`${missingOf(tally)} more borders in the Dex`,
	pickBorder: (name: string) => `Wear ${name}`,
	swatch: "Swatch",
	swatchMeta: "sets the colour of your card",
	pickSwatch: (name: string) => `Wear ${name}`,
	lockedSwatch: "Unearned swatch",
	titles: "Titles",
	titlesMeta: `up to ${WORN_TITLE_CAP} · the first shows everywhere`,
	moreTitles: (tally: Tally) => `+${missingOf(tally)} to earn`,
} as const;

const TILES = "flex flex-wrap gap-4";
const TILE = "flex w-20 flex-col items-center gap-2 disabled:opacity-40";
const FRAME =
	"flex size-20 items-center justify-center rounded-lg bg-theme-raised ring-1 ring-inset ring-theme-faint";
const FRAME_PICKED = "ring-2 ring-theme-soft";
const FRAME_MORE =
	"border border-dashed border-theme-faint bg-transparent ring-0 text-sm font-bold text-theme-muted";
const FRAME_IMAGE = "max-h-full max-w-full";
const FRAME_EMPTY = "text-theme-muted";
const CAPTION = "w-full truncate text-center text-xs text-theme-muted";
const CAPTION_PICKED = "font-bold text-theme-soft";
const SWATCHES = "grid grid-cols-[repeat(auto-fill,minmax(6rem,1fr))] gap-2";
const SWATCH_TILE =
	"flex flex-col items-center gap-2 rounded-xl p-3 transition-colors enabled:hover:bg-theme-raised disabled:cursor-not-allowed disabled:opacity-40";
const SWATCH_TILE_WORN = "bg-theme-raised";
const SWATCH_RING = "flex rounded-xl p-0.5 ring-2";
const SWATCH_RING_IDLE = "ring-transparent";
const SWATCH_RING_WORN = "ring-theme";
const CHIPS = "flex flex-wrap items-center gap-3";
const CHIP =
	"flex h-11 items-center gap-2 rounded-lg px-4 text-sm font-bold ring-inset disabled:cursor-not-allowed disabled:opacity-40";
const CHIP_IDLE =
	"ring-1 ring-theme-faint text-theme-muted enabled:hover:ring-theme-soft";
const CHIP_WORN = "ring-2 ring-theme text-theme-soft";
const CHIP_INDEX =
	"flex size-6 items-center justify-center rounded-md bg-theme text-xs text-theme-faint";
const OWNED = "flex items-center gap-2 text-sm text-theme-muted";

export type AppearanceProps = AppearanceView & {
	onPickBorder: (borderId: string | null) => void;
	onToggleTitle: (titleId: string) => void;
	onPickSwatch: (swatchId: string) => void;
	onMoreBorders: () => void;
	onMoreTitles: () => void;
};

const BorderTile = ({
	pick,
	onPick,
}: {
	pick: BorderPick;
	onPick: (borderId: string | null) => void;
}) => (
	<button
		type="button"
		className={TILE}
		aria-label={COPY.pickBorder(pick.name)}
		aria-pressed={pick.picked}
		onClick={() => onPick(pick.id)}
	>
		<span className={clsx(FRAME, pick.picked && FRAME_PICKED)}>
			{pick.image === undefined ? (
				<span aria-hidden className={FRAME_EMPTY}>
					{COPY.defaultFrame}
				</span>
			) : (
				<img src={pick.image} alt="" className={FRAME_IMAGE} />
			)}
		</span>
		<span className={clsx(CAPTION, pick.picked && CAPTION_PICKED)}>
			{pick.name}
		</span>
	</button>
);

const SwatchTile = ({
	pick,
	onPick,
}: {
	pick: SwatchPick;
	onPick: (swatchId: string) => void;
}) => {
	const locked = pick.state === "locked";
	const worn = pick.state === "worn";
	return (
		<button
			type="button"
			className={clsx(SWATCH_TILE, worn && SWATCH_TILE_WORN)}
			aria-label={locked ? COPY.lockedSwatch : COPY.pickSwatch(pick.name)}
			aria-pressed={worn}
			disabled={locked}
			onClick={() => onPick(pick.id)}
		>
			<span
				className={clsx(
					SWATCH_RING,
					worn ? SWATCH_RING_WORN : SWATCH_RING_IDLE
				)}
			>
				<Swatch {...pick.fill} size="hero" />
			</span>
			<span className={clsx(CAPTION, worn && CAPTION_PICKED)}>
				{locked ? <Redaction /> : pick.name}
			</span>
		</button>
	);
};

const MoreBordersTile = ({
	tally,
	onPress,
}: {
	tally: Tally;
	onPress: () => void;
}) => (
	<button
		type="button"
		className={TILE}
		aria-label={COPY.moreBordersHint(tally)}
		onClick={onPress}
	>
		<span className={clsx(FRAME, FRAME_MORE)}>{COPY.moreBorders(tally)}</span>
		<span className={CAPTION}>{COPY.moreBordersCaption}</span>
	</button>
);

const TitleChip = ({
	pick,
	onToggle,
}: {
	pick: TitlePick;
	onToggle: (titleId: string) => void;
}) => (
	<button
		type="button"
		className={clsx(CHIP, pick.wornAt === null ? CHIP_IDLE : CHIP_WORN)}
		aria-pressed={pick.wornAt !== null}
		disabled={pick.blocked}
		onClick={() => onToggle(pick.id)}
	>
		{pick.wornAt === null ? null : (
			<span className={CHIP_INDEX}>{pick.wornAt}</span>
		)}
		{pick.name}
	</button>
);

export const Appearance = ({
	borders,
	borderTally,
	titles,
	titleTally,
	swatches,
	onPickBorder,
	onToggleTitle,
	onPickSwatch,
	onMoreBorders,
	onMoreTitles,
}: AppearanceProps) => (
	<Panel>
		<Panel.Header label={COPY.swatch} meta={COPY.swatchMeta} />
		<Panel.Body>
			<div className={SWATCHES}>
				{swatches.map((pick) => (
					<SwatchTile key={pick.id} pick={pick} onPick={onPickSwatch} />
				))}
			</div>
		</Panel.Body>
		<Panel.Header label={COPY.titles} meta={COPY.titlesMeta} />
		<Panel.Body>
			<div className={CHIPS}>
				{titles.map((pick) => (
					<TitleChip key={pick.id} pick={pick} onToggle={onToggleTitle} />
				))}
				{missingOf(titleTally) === 0 ? null : (
					<Button
						size="sm"
						tone="bare"
						label={COPY.moreTitles(titleTally)}
						onPress={onMoreTitles}
					/>
				)}
			</div>
		</Panel.Body>
		<Panel.Header
			label={COPY.border}
			meta={
				<span className={OWNED}>
					<Badge>{HELD_OF(borderTally.held, borderTally.total)}</Badge>
					{COPY.owned}
				</span>
			}
		/>
		<Panel.Body>
			<div className={TILES}>
				{borders.map((pick) => (
					<BorderTile
						key={pick.id ?? "default"}
						pick={pick}
						onPick={onPickBorder}
					/>
				))}
				{missingOf(borderTally) === 0 ? null : (
					<MoreBordersTile tally={borderTally} onPress={onMoreBorders} />
				)}
			</div>
		</Panel.Body>
	</Panel>
);
