import type { ReactNode } from "react";

import type { CategoryCode } from "~/domains/shared/categories";
import { categoryTheme } from "../theme/categoryTheme";

type TitleSize = "lg" | "md" | "sm";

const SIZE_CLASS: Record<TitleSize, string> = {
	lg: "text-3xl",
	md: "text-2xl",
	sm: "text-lg",
};

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
	const color = category ? "text-theme" : "text-zinc-100";
	const themeProps = category ? categoryTheme(category) : {};
	return (
		<Tag
			{...themeProps}
			className={`${SIZE_CLASS[size]} ${color} tracking-tight font-extrabold leading-8 ${className}`}
		>
			{children}
		</Tag>
	);
};
