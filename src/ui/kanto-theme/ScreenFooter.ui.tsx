import { clsx } from "clsx";

import { Badge } from "./Badge.ui";
import { Button, type ButtonTone, type IconPlacement } from "./Button.ui";
import type { KantoColor } from "./colors";
import type { IconName } from "./Icon.ui";
import type { SwatchFill } from "./Swatch.ui";
import { SwatchChip } from "./SwatchChip.ui";
import { Typography } from "./Typography.ui";

const FOOTER = "flex w-full flex-col gap-3";
const FOOTER_RULE = "border-t border-theme-faint pt-4";
const STAKE_ROW = "flex w-full flex-wrap items-center justify-end gap-4";
/**
 * `gap-y-1` rather than `gap-3`: when the note drops below the presses on a
 * phone it is a caption for the press above it, and a full row of air reads as
 * a separate thing.
 */
const ACTION_ROW = "flex w-full flex-wrap items-center gap-x-3 gap-y-1";
const STAKE = "flex flex-wrap items-center gap-2";
const FIGURES = "flex flex-wrap items-center gap-2";
const ASIDE = "shrink-0";
/**
 * The press the screen is asking for is always the rightmost thing in the row,
 * at every width — `asides` are the way back, and they lead. `ml-auto` holds
 * that even when the row wraps and the action lands on a line of its own.
 */
const ACTION = "shrink-0 ml-auto";
const ACTION_SOLO = "w-full sm:w-auto";
/**
 * Between the buttons once there is room, on its own line below them before
 * that. It is the only thing in the row that can give, and squeezing it is what
 * collapsed it to one word per line on a phone — so it drops instead, and the
 * buttons stay side by side at every width.
 */
const ROW_NOTE =
	"order-last w-full min-w-0 text-right sm:order-none sm:w-auto sm:flex-1 sm:text-center";

const ACTION_SIZE = "md";

const LIVE_TONE: ButtonTone = "action";
const REFUSED_TONE: ButtonTone = "ambient";
const ASIDE_TONE: ButtonTone = "ambient";

export type StakeFigure = {
	label: string;
	color?: KantoColor;
	swatch?: SwatchFill;
};

export type Stake = { label: string; figures: readonly StakeFigure[] };

export type FooterAction = {
	label: string;
	onPress?: () => void;
	icon?: IconName;
	iconAt?: IconPlacement;
};

export type NotePlacement = "below" | "row";

export type ScreenFooterProps = {
	stakes?: readonly Stake[];
	action: FooterAction;
	/** Secondary exits, left of the action. Prep offers two: the shop and the board. */
	asides?: readonly FooterAction[];
	refusal?: string;
	note?: string;
	noteAt?: NotePlacement;
	rule?: boolean;
};

const Figure = ({ figure }: { figure: StakeFigure }) => {
	if (figure.swatch !== undefined) {
		return <SwatchChip swatch={figure.swatch} label={figure.label} />;
	}

	return <Badge color={figure.color}>{figure.label}</Badge>;
};

const StakeReading = ({ stake }: { stake: Stake }) => (
	<span className={STAKE}>
		<Typography variant="hint" as="span">
			{stake.label}
		</Typography>
		<span className={FIGURES}>
			{stake.figures.map((figure) => (
				<Figure key={figure.label} figure={figure} />
			))}
		</span>
	</span>
);

export const ScreenFooter = ({
	stakes = [],
	action,
	asides = [],
	refusal,
	note,
	noteAt = "below",
	rule = true,
}: ScreenFooterProps) => (
	<footer className={clsx(FOOTER, rule && FOOTER_RULE)}>
		{stakes.length === 0 ? null : (
			<div className={STAKE_ROW}>
				{stakes.map((stake) => (
					<StakeReading key={stake.label} stake={stake} />
				))}
			</div>
		)}

		<div className={ACTION_ROW}>
			{asides.map((aside) => (
				<span key={aside.label} className={ASIDE}>
					<Button
						size={ACTION_SIZE}
						tone={ASIDE_TONE}
						label={aside.label}
						icon={aside.icon}
						iconAt={aside.iconAt}
						disabled={aside.onPress === undefined}
						onPress={aside.onPress}
					/>
				</span>
			))}

			{note === undefined || noteAt === "below" ? null : (
				<span className={ROW_NOTE}>
					<Typography variant="hint" as="span">
						{note}
					</Typography>
				</span>
			)}

			<span className={clsx(ACTION, asides.length === 0 && ACTION_SOLO)}>
				<Button
					size={ACTION_SIZE}
					width={asides.length === 0 ? "full" : "auto"}
					tone={action.onPress === undefined ? REFUSED_TONE : LIVE_TONE}
					label={action.label}
					icon={action.icon}
					iconAt={action.iconAt}
					disabled={action.onPress === undefined}
					onPress={action.onPress}
				/>
			</span>
		</div>

		{note === undefined || noteAt === "row" ? null : (
			<Typography variant="hint">{note}</Typography>
		)}

		{refusal === undefined ? null : (
			<Typography variant="hint">{refusal}</Typography>
		)}
	</footer>
);

/**
 * The press a screen is asking for, pinned across the bottom of a phone as a bar
 * the full width of the viewport, flush to its edges. It keeps the panel's
 * ground because it spans: a note or a refusal beside the press has no fill of
 * its own, and would otherwise be read over whatever scrolls beneath.
 *
 * `sticky`, not `fixed`. A fixed bar leaves the flow, so the screen underneath
 * has to be told how much room to leave for it — and the spacer that did the
 * telling was a fixed `h-16` that a footer wrapping to two or three rows on a
 * phone simply outgrew, covering the end of the page. A sticky bar carries its
 * own space, so it cannot overlap the content it closes and cannot be outgrown
 * by its own contents. The poll panel's own send row pins the same way.
 *
 * From `md` it lets go and settles back into the flow as the screen's closing
 * footer, rounding its corners and closing its border — which is why the chrome
 * is spelled out here rather than borrowed from `Panel`: it has to be
 * breakpoint-scoped, and a shared constant cannot be.
 *
 * The negative margins undo `Screen`'s body padding so the bar reaches the
 * viewport edges at the two widths that padding takes before `md` drops it.
 *
 * `PollScreen` deliberately does not use this: its send is a row inside the poll
 * panel, stacked on top of the pinned build sheet (ADR-114). That screen affords
 * two pinned bars only because it measures the lower one and seats the upper one
 * off it; a bar that simply claimed `bottom-0` would land on the sheet. Nothing
 * else here has a second bar to clear, which is why this one can stay a class.
 */
const BAR =
	"sticky bottom-0 z-20 -mx-4 flex flex-col border-t border-theme-faint bg-theme-faint px-4 py-3 sm:-mx-8 sm:px-8 md:static md:mx-0 md:rounded-2xl md:border md:px-4 md:py-4";

export const ScreenActions = (footer: ScreenFooterProps) => (
	<div className={BAR}>
		<ScreenFooter {...footer} rule={false} />
	</div>
);
