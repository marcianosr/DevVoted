import type { ReactNode } from "react";

import { cva } from "class-variance-authority";
import { clsx } from "clsx";

import type { CategoryCode } from "~/domains/shared/categories";
import { categoryTheme } from "../theme/categoryTheme";

type TitleSize = "lg" | "md" | "sm";

const title = cva("tracking-tight font-extrabold leading-8", {
	variants: {
		size: {
			lg: "text-3xl",
			md: "text-2xl",
			sm: "text-lg",
		} satisfies Record<TitleSize, string>,
		themed: {
			true: "text-theme",
			false: "text-zinc-100",
		},
	},
});

type TitleProps = {
	children: ReactNode;
	category?: CategoryCode;
	as?: "h1" | "h2" | "h3";
	size?: TitleSize;
	className?: string;
};

export const Title = ({
	children,
	category,
	as = "h1",
	size = "lg",
	className = "",
}: TitleProps) => {
	const Tag = as;
	const themeProps = category ? categoryTheme(category) : {};
	return (
		<Tag
			{...themeProps}
			className={clsx(title({ size, themed: Boolean(category) }), className)}
		>
			{children}
		</Tag>
	);
};
