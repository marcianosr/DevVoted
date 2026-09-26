import { clsx } from "clsx";

import { Action } from "./Action.ui";
import { Badge } from "./Badge.ui";
import { Button, type ButtonTone, type IconPlacement } from "./Button.ui";
import type { KantoColor } from "./colors";
import type { IconName } from "./Icon.ui";
import type { SwatchFill, SwatchMark } from "./Swatch.ui";
import { SwatchChip } from "./SwatchChip.ui";
import { Typography } from "./Typography.ui";

const FOOTER = "flex w-full flex-col gap-3";
/**
 * The asides and the press share a line once there is room for both, with the
 * press taking whatever the asides leave. Stacked below `sm` because two
 * presses side by side on a phone squeeze the wide one to a stub, and the wide
 * one is the thing the screen is asking for.
 *
 * The press grows rather than shrink-wrapping its label: it is the primary
 * control, and a control that shrinks as its label shortens stops being the
 * one obvious thing on the row.
 */
const PRESS_BLOCK = "flex w-full flex-col gap-3";
/**
 * A lone way out sits beside the press from `sm`; two or more take a row of
 * their own above it. Two ways out and a press on one line leaves the press
 * the narrowest thing in a row it is supposed to lead, and a screen offering
 * two exits is offering a choice — a choice reads as a pair of equals, not as
 * a queue to the left of the real press.
 */
const PRESS_BLOCK_INLINE = "sm:flex-row sm:items-center";
const PRESS_SEAT = "w-full";
/** Only meaningful with something to its left; kept separate so the press's own width never depends on it. */
const PRESS_BESIDE_ASIDE = "sm:min-w-0 sm:flex-1";
const FOOTER_RULE = "border-t border-theme-faint pt-4";
const STAKE_ROW = "flex w-full flex-wrap items-center justify-end gap-4";
/**
 * The ways out that are not the way forward, on the line above the press that
 * is. `gap-y-1` rather than `gap-3`: when the note drops below them on a phone
 * it is a caption for the row, and a full row of air reads as a separate thing.
 */
const ASIDE_ROW = "flex w-full flex-wrap items-center gap-3";
const ASIDE_ROW_INLINE = "sm:w-auto sm:shrink-0";
const STAKE = "flex flex-wrap items-center gap-2";
const FIGURES = "flex flex-wrap items-center gap-2";
const ASIDE = "shrink-0";
/** Sharing the row evenly, wrapping rather than shrinking past a readable label. */
const ASIDE_SHARE = "min-w-40 flex-1";
/**
 * Its own line under the whole footer, never between the asides and the press.
 * A string standing in that gap reads as a third control, and it was the one
 * thing in the row that could give — so squeezing it there collapsed it to a
 * word per line on a phone while the two presses stayed put.
 */
const SPARE_NOTE = "w-full min-w-0";

const ASIDE_SIZE = "lg";

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
	/**
	 * The gate this press belongs to, drawn as its mark. Only the screen's own
	 * press wears one: an aside leads away from the climb, so it has no gate to
	 * carry. Where the press has no gate either, its icon marks it instead.
	 */
	swatch?: SwatchMark;
	icon?: IconName;
	/** Which side of an aside's label its icon sits. The press always leads with its mark. */
	iconAt?: IconPlacement;
};

export type ScreenFooterProps = {
	stakes?: readonly Stake[];
	action: FooterAction;
	/** Secondary exits, on the row above the press. Prep offers two: the shop and the board. */
	asides?: readonly FooterAction[];
	refusal?: string;
	note?: string;
	rule?: boolean;
};

type FooterLines = { press?: string; above?: string };

/**
 * Which of the footer's two strings the press says, and which stands above it.
 *
 * `refusal` is what is wrong and `note` is what the press would do, and the
 * press has one line for the pair. It states whichever describes it as it
 * currently is: the refusal while it is shut, the note while it is live. A
 * refusal does not always shut the press — a start that failed on the server is
 * still worth pressing again — which is why this turns on the press and not on
 * whether a refusal was given.
 *
 * The other string stands on the row above rather than being dropped: a screen
 * that set a string meant the player to read it, and silently swallowing one is
 * how a refusal goes missing exactly when it matters.
 */
const footerLinesOf = (
	refusal: string | undefined,
	note: string | undefined,
	live: boolean
): FooterLines => {
	if (live) return { press: note, above: refusal };
	if (refusal === undefined) return { press: note };
	return { press: refusal, above: note };
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
	rule = true,
}: ScreenFooterProps) => {
	const lines = footerLinesOf(refusal, note, action.onPress !== undefined);
	const alongside = asides.length === 1;

	return (
		<footer className={clsx(FOOTER, rule && FOOTER_RULE)}>
			{stakes.length === 0 ? null : (
				<div className={STAKE_ROW}>
					{stakes.map((stake) => (
						<StakeReading key={stake.label} stake={stake} />
					))}
				</div>
			)}

			<div className={clsx(PRESS_BLOCK, alongside && PRESS_BLOCK_INLINE)}>
				{asides.length === 0 ? null : (
					<div className={clsx(ASIDE_ROW, alongside && ASIDE_ROW_INLINE)}>
						{asides.map((aside) => (
							<span
								key={aside.label}
								className={alongside ? ASIDE : ASIDE_SHARE}
							>
								<Button
									size={ASIDE_SIZE}
									width={alongside ? "auto" : "fill"}
									tone={ASIDE_TONE}
									label={aside.label}
									icon={aside.icon}
									iconAt={aside.iconAt}
									disabled={aside.onPress === undefined}
									onPress={aside.onPress}
								/>
							</span>
						))}
					</div>
				)}

				<div className={clsx(PRESS_SEAT, alongside && PRESS_BESIDE_ASIDE)}>
					<Action
						label={action.label}
						note={lines.press}
						swatch={action.swatch}
						icon={action.icon}
						onPress={action.onPress}
					/>
				</div>
			</div>

			{lines.above === undefined ? null : (
				<span className={SPARE_NOTE}>
					<Typography variant="hint" as="span">
						{lines.above}
					</Typography>
				</span>
			)}
		</footer>
	);
};

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
	"sticky bottom-0 z-20 -mx-4 flex flex-col px-4 py-3 sm:-mx-8 sm:px-8 md:static md:mx-0 md:px-4 md:py-4";
/**
 * Drawn only for a bar that carries more than the press. The press is an opaque
 * bar in its own right, so a second one behind it is a black plate around a
 * button and nothing else — but a stake reading or an aside's note has no fill
 * of its own, and would be read over whatever scrolls beneath.
 */
const BAR_GROUND =
	"border-t border-theme-faint bg-theme-faint md:rounded-2xl md:border";

const carriesMoreThanThePress = ({
	stakes = [],
	asides = [],
	refusal,
	note,
	action,
}: ScreenFooterProps) =>
	stakes.length > 0 ||
	asides.length > 0 ||
	footerLinesOf(refusal, note, action.onPress !== undefined).above !==
		undefined;

export const ScreenActions = (footer: ScreenFooterProps) => (
	<div className={clsx(BAR, carriesMoreThanThePress(footer) && BAR_GROUND)}>
		<ScreenFooter {...footer} rule={false} />
	</div>
);
