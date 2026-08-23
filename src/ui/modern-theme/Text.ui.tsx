import type { ElementType, ReactNode } from "react";

import { cva } from "class-variance-authority";
import { clsx } from "clsx";

import { MODERN_TONE, type ModernTone } from "./tones";

export type TextSize = "xxs" | "meta" | "body" | "label" | "title" | "ask";

const SIZE = {
	xxs: "text-xxs",
	meta: "text-xs",
	body: "text-sm",
	label: "text-base",
	title: "text-lg",
	ask: "text-xl leading-relaxed sm:text-2xl sm:leading-relaxed",
} satisfies Record<TextSize, string>;

const textVariants = cva(undefined, {
	variants: { size: SIZE, tone: MODERN_TONE },
});

export type TextProps = {
	children: ReactNode;
	as?: ElementType;
	size?: TextSize;
	tone?: ModernTone;
	className?: string;
};

export const Text = ({
	children,
	as: Tag = "span",
	size = "body",
	tone = "default",
	className,
}: TextProps) => (
	<Tag className={clsx(textVariants({ size, tone }), className)}>
		{children}
	</Tag>
);
