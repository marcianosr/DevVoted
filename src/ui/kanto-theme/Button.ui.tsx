import { clsx } from "clsx";
import type { ReactNode } from "react";

import type { KantoColor } from "./colors";
import { Icon, type IconName } from "./Icon.ui";

const BUTTON =
	"group/press items-center justify-center text-xs leading-none ring-1 ring-inset transition-colors disabled:cursor-not-allowed disabled:opacity-40";

const FIGURES = "font-bold tabular-nums whitespace-nowrap";

const WIDTH = {
	auto: "inline-flex shrink-0",
	full: "flex w-full sm:inline-flex sm:w-fit",
	fill: "flex w-full",
} satisfies Record<ButtonWidth, string>;

const RADIUS = {
	sm: "rounded-md",
	md: "rounded-md",
	lg: "rounded-2xl",
} satisfies Record<ButtonSize, string>;

const GLYPH_SHAPE = { sm: "size-7", md: "size-8", lg: "size-14" };
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
const BARE = "ring-transparent text-theme-muted enabled:hover:text-theme-faint";
const BRIGHT = "segment-theme ring-transparent hover:brightness-110";

const ACTIVE = "bg-theme text-theme-faint ring-theme";
const ACTIVE_BARE = "text-theme-faint";
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

const TONE_ACTIVE = {
	ambient: ACTIVE,
	action: ACTIVE,
	danger: ACTIVE,
	commit: ACTIVE,
	bare: ACTIVE_BARE,
	bright: ACTIVE_BRIGHT,
} satisfies Record<ButtonTone, string>;

const REFUSED_COLOR: KantoColor = "cinnabar";

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
	capAt?: IconPlacement;
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
