import type { ReactNode } from "react";

import { cva } from "class-variance-authority";
import { clsx } from "clsx";

export type ButtonVariant = "primary" | "quiet" | "danger" | "upgrade";
export type ButtonSize = "sm" | "md";

const VARIANT = {
	primary:
		"border-theme-soft bg-theme-soft text-zinc-100 enabled:hover:bg-theme-strong",
	quiet: "border-edge-strong text-zinc-200 enabled:hover:bg-zinc-100/5",
	danger:
		"border-cinnabar/50 bg-cinnabar/10 text-cinnabar enabled:hover:bg-cinnabar/20",
	upgrade:
		"border-transparent legendary-ring text-zinc-100 enabled:hover:brightness-125",
} satisfies Record<ButtonVariant, string>;

const SIZE = {
	sm: "px-2 py-0.5 text-xs",
	md: "px-3 py-1.5 text-sm",
} satisfies Record<ButtonSize, string>;

const buttonVariants = cva(
	"inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border whitespace-nowrap transition-colors disabled:cursor-not-allowed disabled:opacity-40",
	{ variants: { variant: VARIANT, size: SIZE } }
);

const PRICE = "font-bold text-saffron";

export type ButtonProps = {
	label: string;
	icon?: ReactNode;
	price?: string;
	variant?: ButtonVariant;
	size?: ButtonSize;
	disabled?: boolean;
	className?: string;
	onUse?: () => void;
};

export const Button = ({
	label,
	icon,
	price,
	variant = "quiet",
	size = "md",
	disabled = false,
	className,
	onUse,
}: ButtonProps) => (
	<button
		type="button"
		disabled={disabled}
		onClick={onUse}
		className={clsx(buttonVariants({ variant, size }), className)}
	>
		{icon === undefined ? null : <span aria-hidden>{icon}</span>}
		{label}
		{price === undefined ? null : <span className={PRICE}>{price}</span>}
	</button>
);
