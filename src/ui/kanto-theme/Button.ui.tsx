import { clsx } from "clsx";
import type { ReactNode } from "react";

import type { KantoColor } from "./colors";
import { Icon, type IconName } from "./Icon.ui";

const BUTTON =
	"group/press items-center justify-center text-xs leading-none ring-1 ring-inset transition-colors disabled:cursor-not-allowed disabled:opacity-40";

const FIGURES = "font-bold tabular-nums whitespace-nowrap";

/**
 * The display is here rather than in `BUTTON` because `full` has to beat
 * `inline-flex`, and two utilities setting the same property cannot be resolved
 * by class order — Tailwind emits them in its own. Keeping the pair in one map
 * means only one of them is ever written.
 *
 * `full` spans on a phone and shrink-wraps from `sm`: a lone press has the row
 * to itself on a narrow screen, and reads as a press again once the row has
 * room for a note beside it.
 *
 * `fill` spans whatever it is given at every width, for presses laid out by
 * the row around them — two ways out splitting a footer evenly cannot each
 * shrink to their own label, or the pair reads as ragged rather than as a
 * pair.
 */
const WIDTH = {
	auto: "inline-flex shrink-0",
	full: "flex w-full sm:inline-flex sm:w-fit",
	fill: "flex w-full",
} satisfies Record<ButtonWidth, string>;

/**
 * Keyed by size for the same reason `WIDTH` is: the radius used to sit in
 * `BUTTON`, and a size setting its own would have been a second utility for one
 * property with Tailwind deciding which wins.
 *
 * `lg` rounds like a panel rather than a control, because that is the size at
 * which it stands beside `Action` — two boxes on one row read as a pair only
 * if their corners agree.
 */
const RADIUS = {
	sm: "rounded-md",
	md: "rounded-md",
	lg: "rounded-2xl",
} satisfies Record<ButtonSize, string>;

const GLYPH_SHAPE = { sm: "size-7", md: "size-8", lg: "size-14" };
/**
 * `lg` is the footer's own size: a way out standing next to the press the
 * screen is asking for, tall enough to be a peer of it rather than a caption
 * beside it.
 */
const LABEL_SHAPE = {
	sm: `h-7 px-2 ${FIGURES}`,
	md: `h-8 px-4 text-sm ${FIGURES}`,
	lg: `h-14 px-5 text-sm ${FIGURES}`,
};
const CAPPED_SHAPE = {
	sm: `h-7 gap-2 p-0.5 ${FIGURES}`,
	md: `h-9 gap-2 p-1 text-sm ${FIGURES}`,
	lg: `h-14 gap-2 p-2 text-sm ${FIGURES}`,
};
/** The cap fills its side to the edge, so only the label's side is padded. */
const CAPPED_PAD = {
	lead: { sm: "pr-2.5", md: "pr-3", lg: "pr-4" },
	trail: { sm: "pl-2.5", md: "pl-3", lg: "pl-4" },
} satisfies Record<IconPlacement, Record<ButtonSize, string>>;
const CAP = "badge-theme flex h-full items-center gap-1 rounded px-1.5";
const WITH_ICON = "gap-1.5";
const ICON_SIZE = { sm: "size-3.5", md: "size-4", lg: "size-4" };
const DETAIL_ON_HOVER = "hidden group-hover/press:inline";

export type DetailReveal = "hover" | "always";

const DETAIL = {
	hover: DETAIL_ON_HOVER,
	always: undefined,
} satisfies Record<DetailReveal, string | undefined>;

const AMBIENT =
	"ring-theme-faint text-theme-muted enabled:hover:text-theme-soft enabled:hover:ring-theme-soft";
const ACTION = "press-theme ring-theme-soft";
const DANGER =
	"ring-theme-soft text-theme-soft enabled:hover:bg-theme-soft enabled:hover:text-theme-faint";
/**
 * Chrome-free: a mark that is a control without being a box. It keeps the ring
 * width so its hit area matches every other press of its size, and spends only
 * colour on being pressed.
 */
const BARE = "ring-transparent text-theme-muted enabled:hover:text-theme-faint";
/**
 * The bright end of the theme, on the one press a card is asking for. Same
 * utility and same reasoning as the screen's own press in `Action`: the fill
 * ships its ink inseparably, so nothing here sets a colour and hover spends
 * brightness rather than a second fill nobody checked for contrast.
 */
const BRIGHT = "segment-theme ring-transparent hover:brightness-110";

const ACTIVE = "bg-theme text-theme-faint ring-theme";
const ACTIVE_BARE = "text-theme-faint";
/** An edge, not a fill: a second background utility would fight `segment-theme`. */
const ACTIVE_BRIGHT = "ring-theme";

const SEPARATOR = " · ";

export type ButtonTone =
	"ambient" | "action" | "danger" | "commit" | "bare" | "bright";
export type ButtonSize = "sm" | "md" | "lg";
export type ButtonWidth = "auto" | "full" | "fill";

const TONE = {
	ambient: AMBIENT,
	action: ACTION,
	danger: DANGER,
	commit: ACTION,
	bare: BARE,
	bright: BRIGHT,
} satisfies Record<ButtonTone, string>;

/**
 * How a tone shows it is on. Filling the box is the kit's default, and a tone
 * with no box has to say it another way rather than grow one when pressed.
 */
const TONE_ACTIVE = {
	ambient: ACTIVE,
	action: ACTIVE,
	danger: ACTIVE,
	commit: ACTIVE,
	bare: ACTIVE_BARE,
	bright: ACTIVE_BRIGHT,
} satisfies Record<ButtonTone, string>;

const REFUSED_COLOR: KantoColor = "cinnabar";

/**
 * `commit` is an action wearing the colour the kit already gives a standing
 * bill, so a press that is about to create one reads as that rather than as a
 * second ordinary install. Saffron, not cinnabar: this commits to a cost, it
 * does not destroy anything.
 *
 * `bright` pins pallet rather than taking the screen's hue, because the screen
 * already spends its hue on the press it is asking for. A card's own press
 * carrying the same colour at the same brightness would read as a second one of
 * those; the palest thing on the page reads as a press without claiming to be
 * the way forward.
 */
const TONE_THEME = {
	ambient: undefined,
	action: undefined,
	danger: "cinnabar",
	commit: "saffron",
	bare: undefined,
	bright: "pallet",
} satisfies Record<ButtonTone, KantoColor | undefined>;

const isRefusable = (tone: ButtonTone) =>
	tone === "action" || tone === "commit";

const toneThemeOf = (tone: ButtonTone, disabled: boolean) =>
	isRefusable(tone) && disabled ? REFUSED_COLOR : TONE_THEME[tone];

type Glyph = {
	/**
	 * One mark, drawn instead of a label. A node as well as a character because
	 * the kit's thin typographic arrows cannot be thickened: a chevron that has
	 * to carry weight is an `Icon`, and it still counts as the same shape.
	 */
	glyph: ReactNode;
	cap?: never;
	capAt?: never;
	capColor?: never;
	detail?: never;
	detailOn?: never;
	icon?: never;
};
type Capped = {
	cap: ReactNode;
	/**
	 * Which side of the label the cap sits. Leading states what the press does
	 * to the figure beside it — an upgrade's arrow before the version it buys.
	 * Trailing states what the press hands back, which is read after the verb.
	 */
	capAt?: IconPlacement;
	/** What the cap wears, where the figure is not the press's own colour. */
	capColor?: KantoColor;
	glyph?: never;
	detail?: string;
	detailOn?: DetailReveal;
	icon?: never;
};
type Plain = {
	glyph?: never;
	cap?: never;
	capAt?: never;
	capColor?: never;
	detail?: string;
	detailOn?: DetailReveal;
	icon?: IconName;
	iconAt?: IconPlacement;
};

export type IconPlacement = "lead" | "trail";

export type ButtonProps = {
	label: string;
	tone?: ButtonTone;
	size?: ButtonSize;
	width?: ButtonWidth;
	onPress?: () => void;
	disabled?: boolean;
	pressed?: boolean;
	expanded?: boolean;
	hint?: string;
} & (Glyph | Capped | Plain);

const shapeOf = (size: ButtonSize, shape: Glyph | Capped | Plain) => {
	if (shape.glyph !== undefined) return GLYPH_SHAPE[size];
	if (shape.cap !== undefined)
		return clsx(CAPPED_SHAPE[size], CAPPED_PAD[shape.capAt ?? "lead"][size]);
	return LABEL_SHAPE[size];
};

const Cap = ({ cap, capColor }: Pick<Capped, "cap" | "capColor">) => (
	<span aria-hidden data-screen-theme={capColor} className={CAP}>
		{cap}
	</span>
);

const accessibleNameOf = (
	label: string,
	glyph?: ReactNode,
	detail?: string,
	hint?: string
) => {
	if (hint !== undefined) return hint;
	if (glyph !== undefined) return label;
	if (detail !== undefined) return `${label}${SEPARATOR}${detail}`;
	return undefined;
};

export const Button = ({
	label,
	tone = "ambient",
	size = "sm",
	width = "auto",
	onPress,
	disabled = false,
	pressed,
	expanded,
	hint,
	...shape
}: ButtonProps) => (
	<button
		type="button"
		data-screen-theme={toneThemeOf(tone, disabled)}
		aria-label={accessibleNameOf(label, shape.glyph, shape.detail, hint)}
		aria-pressed={pressed}
		aria-expanded={expanded}
		disabled={disabled}
		onClick={onPress}
		className={clsx(
			BUTTON,
			RADIUS[size],
			WIDTH[width],
			shapeOf(size, shape),
			TONE[tone],
			shape.icon !== undefined && WITH_ICON,
			(pressed === true || expanded === true) && TONE_ACTIVE[tone]
		)}
	>
		{shape.cap === undefined || shape.capAt === "trail" ? null : (
			<Cap cap={shape.cap} capColor={shape.capColor} />
		)}
		{shape.icon === undefined || shape.iconAt !== "lead" ? null : (
			<Icon name={shape.icon} className={ICON_SIZE[size]} />
		)}
		{shape.glyph === undefined ? (
			<span>
				{label}
				{shape.detail === undefined ? null : (
					<span className={DETAIL[shape.detailOn ?? "hover"]}>
						{SEPARATOR}
						{shape.detail}
					</span>
				)}
			</span>
		) : (
			<span aria-hidden>{shape.glyph}</span>
		)}
		{shape.icon === undefined || shape.iconAt === "lead" ? null : (
			<Icon name={shape.icon} className={ICON_SIZE[size]} />
		)}
		{shape.cap === undefined || shape.capAt !== "trail" ? null : (
			<Cap cap={shape.cap} capColor={shape.capColor} />
		)}
	</button>
);
