import type { ReactNode } from "react";

import { cva } from "class-variance-authority";
import { clsx } from "clsx";

import type { CategoryCode } from "~/domains/shared/categories";
import { categoryTheme } from "../theme/categoryTheme";

type TitleSize = "lg" | "md" | "sm";
type TitleTone = "default" | "theme" | "gradient" | "cinnabar";

const title = cva("tracking-tight font-extrabold leading-6 sm:leading-8", {
	variants: {
		size: {
			lg: "text-xl sm:text-3xl",
			md: "text lg sm:text-2xl",
			sm: "text-md text-lg",
		} satisfies Record<TitleSize, string>,
		tone: {
			default: "text-zinc-100",
			theme: "text-theme",
			gradient: "text-gradient-green",
			cinnabar: "text-cinnabar",
		} satisfies Record<TitleTone, string>,
	},
});

type TitleProps = {
	children: ReactNode;
	category?: CategoryCode;
	as?: "h1" | "h2" | "h3";
	size?: TitleSize;
	/** A category always themes the title; tone only applies without one. */
	tone?: Exclude<TitleTone, "theme">;
	className?: string;
};

export const Title = ({
	children,
	category,
	as = "h1",
	size = "lg",
	tone = "default",
	className = "",
}: TitleProps) => {
	const Tag = as;
	const themeProps = category ? categoryTheme(category) : {};
	return (
		<Tag
			{...themeProps}
			className={clsx(
				title({ size, tone: category ? "theme" : tone }),
				className
			)}
		>
			{children}
		</Tag>
	);
};
