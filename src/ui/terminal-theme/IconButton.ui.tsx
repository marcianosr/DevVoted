import type { ReactNode } from "react";

import { clsx } from "clsx";

import { Tooltip } from "./Tooltip.ui";

export type IconButtonTone =
	"viridian" | "cinnabar" | "cerulean" | "theme" | "legendary";

const TONE = {
	viridian: "border-viridian/40 text-viridian enabled:hover:bg-viridian/10",
	cinnabar: "border-cinnabar/40 text-cinnabar enabled:hover:bg-cinnabar/10",
	cerulean: "border-cerulean/40 text-cerulean enabled:hover:bg-cerulean/10",
	theme: "border-theme text-theme enabled:hover:bg-theme-soft",
	legendary:
		"legendary-ring border-transparent text-zinc-100 enabled:hover:brightness-125",
} satisfies Record<IconButtonTone, string>;

const ARMED = {
	viridian: "border-viridian bg-viridian/15 text-viridian",
	cinnabar: "border-cinnabar bg-cinnabar/15 text-cinnabar",
	cerulean: "border-cerulean bg-cerulean/15 text-cerulean",
	theme: "border-theme bg-theme-soft text-theme",
	legendary: "legendary-ring border-transparent bg-zinc-100/10 text-zinc-100",
} satisfies Record<IconButtonTone, string>;

const BUTTON =
	"inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1 text-xs whitespace-nowrap transition-colors disabled:cursor-not-allowed disabled:opacity-40";
const COLLAPSES = "@max-md:size-7 @max-md:justify-center @max-md:px-0";
const LABEL = "text-zinc-100 @max-md:hidden";
const ROUND = "size-7 justify-center px-0";

export type IconButtonProps = {
	label: string;
	hint?: string;
	icon?: ReactNode;
	tone?: IconButtonTone;
	armed?: boolean;
	disabled?: boolean;
	iconOnly?: boolean;
	onUse?: () => void;
};

export const IconButton = ({
	label,
	hint,
	icon,
	tone = "viridian",
	armed,
	disabled = false,
	iconOnly = false,
	onUse,
}: IconButtonProps) => (
	<Tooltip hint={hint}>
		<button
			type="button"
			aria-label={hint ?? label}
			aria-pressed={armed}
			disabled={disabled}
			onClick={onUse}
			className={clsx(
				BUTTON,
				icon !== undefined && (iconOnly ? ROUND : COLLAPSES),
				armed === true ? ARMED[tone] : TONE[tone]
			)}
		>
			{icon === undefined ? null : <span aria-hidden>{icon}</span>}
			{iconOnly && icon !== undefined ? null : (
				<span aria-hidden className={icon === undefined ? undefined : LABEL}>
					{label}
				</span>
			)}
		</button>
	</Tooltip>
);
