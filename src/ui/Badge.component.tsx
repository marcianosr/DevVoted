import type { ReactNode } from "react";

import { cva } from "class-variance-authority";

type BadgeTone = "neutral" | "positive" | "price";

type BadgeSize = "default" | "corner" | "pill";

const badge = cva("font-bold", {
	variants: {
		tone: {
			neutral: "border-2 border-pewter bg-black text-pewter",
			positive: "bg-celadon text-black",
			price: "bg-saffron text-black",
		} satisfies Record<BadgeTone, string>,
		size: {
			default: "rounded px-1.5 py-0.5 text-sm",
			corner: "rounded px-1 py-1 text-[0.625rem] leading-4",
			pill: "rounded-full px-2.5 py-1 text-[0.625rem]",
		} satisfies Record<BadgeSize, string>,
	},
});

type BadgeProps = {
	children: ReactNode;
	tone?: BadgeTone;
	size?: BadgeSize;
	onClick?: () => void;
	disabled?: boolean;
	ariaLabel?: string;
};

export const Badge = ({
	children,
	tone = "neutral",
	size = "default",
	onClick,
	disabled = false,
	ariaLabel,
}: BadgeProps) => {
	const style = badge({ tone, size });
	if (!onClick) return <span className={style}>{children}</span>;
	return (
		<button
			type="button"
			onClick={disabled ? undefined : onClick}
			aria-disabled={disabled || undefined}
			aria-label={ariaLabel}
			// Disabled dims the whole badge rather than recolouring its text: the
			// old aria-disabled text was a lighter gray than the enabled tone, so a
			// dead badge read brighter than a live one.
			className={`${style} cursor-pointer transition hover:brightness-110 aria-disabled:cursor-not-allowed aria-disabled:opacity-50`}
		>
			{children}
		</button>
	);
};
