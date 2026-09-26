import { clsx } from "clsx";

import { Icon, type IconName } from "./Icon.ui";
import { Swatch, type SwatchMark, type SwatchSize } from "./Swatch.ui";

/**
 * The one press a screen is asking for, at the size that says so.
 *
 * Wide, and carrying its own reading, because the note under the label is the
 * sentence the press acts on — "answer C", or why there is nowhere to go yet.
 * Standing that note beside a small button, which is where it used to live, let
 * the two wrap onto different lines on a phone and scroll apart on a long
 * screen: a refusal is only useful within sight of the thing it refuses.
 *
 * `text-left` because the label and its reading are two lines of prose, not a
 * caption centred in a control.
 */
const PRESS =
	"flex w-full items-center gap-4 rounded-2xl px-5 py-4 text-left transition disabled:cursor-not-allowed";

/**
 * `segment-theme` rather than `press-theme`: this wears the theme at full
 * brightness, which is what makes it findable from across the page without a
 * second control having to be dimmed to let it win. `Button`'s `bright` tone is
 * the same fill on a card's own press, and stays out of its way by pinning
 * pallet rather than taking the screen's hue. The utility ships its ink
 * inseparably from its fill, tuned to clear AA across all twelve hues — so
 * nothing below sets a colour, and the mark and the chevron both draw in
 * `currentColor`.
 *
 * Brightness rather than a second fill on hover, because the fill is half of a
 * contrast pair and a hand-picked hover colour would be a third value nobody
 * checked. Lifting lightness while the ink holds can only widen the ratio.
 */
const LIVE =
	"segment-theme press-raised hover:brightness-110 active:press-sunk";
/**
 * Refused keeps the screen's own ground rather than a dimmed copy of the live
 * fill. A washed-out green still reads as "go", and the whole point of this
 * state is that there is nowhere to go yet.
 */
const REFUSED = "border border-theme-faint bg-theme-faint text-theme-muted";

/**
 * Weight, not colour, separates the two lines. On the live ground the ink is
 * half of `segment-theme`'s contrast pair, so quietening the note would break
 * exactly the promise that utility exists to keep.
 */
const LABEL = "text-base font-extrabold tracking-wide";
const NOTE = "text-sm font-normal";
const LINES = "flex min-w-0 flex-col gap-0.5";
/** An arrow, not a chevron: this press goes somewhere, it does not open something. */
const LEADS_ON = "ml-auto size-4";
const LEADS_ON_ICON: IconName = "forward";
/** Matches the `large` swatch, so the two marks are interchangeable in the row. */
const MARK = "size-7";

const MARK_SIZE: SwatchSize = "large";

/**
 * The same joiner `Button` uses between a label and its detail. Spelled into
 * the name rather than left to the two lines, because nothing separates them in
 * the markup: the gap between them is a flex property, which the accessible
 * name is computed without, so "Lock in" and "answer C" arrive as one word.
 */
const SEPARATOR = " · ";

const accessibleNameOf = (label: string, note?: string) =>
	note === undefined ? undefined : `${label}${SEPARATOR}${note}`;

export type ActionProps = {
	label: string;
	/** What the press acts on, or why it is shut. Reads under the label. */
	note?: string;
	/** The gate this press belongs to. A screen standing outside a run has none. */
	swatch?: SwatchMark;
	/** Where it leads, for a press with no gate to mark it with. */
	icon?: IconName;
	/** Absent refuses the press: the note is then why. */
	onPress?: () => void;
};

/**
 * The gate if there is one, else where the press leads, else nothing. Both
 * marks are the same size and sit in the same slot, so a footer that swaps one
 * for the other does not move the label beside it.
 */
const Mark = ({ swatch, icon, refused }: MarkProps) => {
	if (swatch !== undefined)
		return (
			<Swatch
				{...swatch}
				size={MARK_SIZE}
				ground={refused ? "dark" : "bright"}
			/>
		);

	if (icon !== undefined) return <Icon name={icon} className={MARK} />;

	return null;
};

type MarkProps = Pick<ActionProps, "swatch" | "icon"> & { refused: boolean };

export const Action = ({ label, note, swatch, icon, onPress }: ActionProps) => {
	const refused = onPress === undefined;

	return (
		<button
			type="button"
			aria-label={accessibleNameOf(label, note)}
			disabled={refused}
			onClick={onPress}
			className={clsx(PRESS, refused ? REFUSED : LIVE)}
		>
			<Mark swatch={swatch} icon={icon} refused={refused} />
			<span className={LINES}>
				<span className={LABEL}>{label}</span>
				{note === undefined ? null : <span className={NOTE}>{note}</span>}
			</span>
			<Icon name={LEADS_ON_ICON} className={LEADS_ON} />
		</button>
	);
};
