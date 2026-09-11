import { clsx } from "clsx";

import type { KantoColor } from "./colors";
import { Icon, type IconName } from "./Icon.ui";

const BUTTON =
	"group/press inline-flex shrink-0 items-center justify-center rounded-md text-xs leading-none ring-1 ring-inset transition-colors disabled:cursor-not-allowed disabled:opacity-40";

const FIGURES = "w-fit font-bold tabular-nums whitespace-nowrap";

const GLYPH_SHAPE = { sm: "size-5", md: "size-8" };
const LABEL_SHAPE = {
	sm: `h-5 px-2 ${FIGURES}`,
	md: `h-8 px-4 text-sm ${FIGURES}`,
};
const CAPPED_SHAPE = {
	sm: `h-7 gap-2 p-0.5 pr-2.5 ${FIGURES}`,
	md: `h-9 gap-2 p-1 pr-3 text-sm ${FIGURES}`,
};
const CAP = "badge-theme flex h-full items-center rounded px-1.5";
const WITH_ICON = "gap-1.5";
const ICON_SIZE = { sm: "size-3.5", md: "size-4" };
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

const ACTIVE = "bg-theme text-theme-faint ring-theme";

const SEPARATOR = " · ";

export type ButtonTone = "ambient" | "action" | "danger";
export type ButtonSize = "sm" | "md";

const TONE = {
	ambient: AMBIENT,
	action: ACTION,
	danger: DANGER,
} satisfies Record<ButtonTone, string>;

const REFUSED_COLOR: KantoColor = "cinnabar";

const TONE_THEME = {
	ambient: undefined,
	action: undefined,
	danger: "cinnabar",
} satisfies Record<ButtonTone, KantoColor | undefined>;

const toneThemeOf = (tone: ButtonTone, disabled: boolean) =>
	tone === "action" && disabled ? REFUSED_COLOR : TONE_THEME[tone];

type Glyph = {
	glyph: string;
	cap?: never;
	detail?: never;
	detailOn?: never;
	icon?: never;
};
type Capped = {
	cap: string;
	glyph?: never;
	detail?: string;
	detailOn?: DetailReveal;
	icon?: never;
};
type Plain = {
	glyph?: never;
	cap?: never;
	detail?: never;
	detailOn?: never;
	icon?: IconName;
};

export type ButtonProps = {
	label: string;
	tone?: ButtonTone;
	size?: ButtonSize;
	onPress?: () => void;
	disabled?: boolean;
	pressed?: boolean;
	expanded?: boolean;
	hint?: string;
} & (Glyph | Capped | Plain);

const shapeOf = (size: ButtonSize, glyph?: string, cap?: string) => {
	if (glyph !== undefined) return GLYPH_SHAPE[size];
	if (cap !== undefined) return CAPPED_SHAPE[size];
	return LABEL_SHAPE[size];
};

const accessibleNameOf = (
	label: string,
	glyph?: string,
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
			shapeOf(size, shape.glyph, shape.cap),
			TONE[tone],
			shape.icon !== undefined && WITH_ICON,
			(pressed === true || expanded === true) && ACTIVE
		)}
	>
		{shape.cap === undefined ? null : (
			<span aria-hidden className={CAP}>
				{shape.cap}
			</span>
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
		{shape.icon === undefined ? null : (
			<Icon name={shape.icon} className={ICON_SIZE[size]} />
		)}
	</button>
);
