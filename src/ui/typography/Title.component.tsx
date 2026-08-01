import type { ReactNode } from "react";

import { clsx } from "clsx";

import type { CategoryCode } from "~/domains/shared/categories";
import { categoryTheme } from "../theme/categoryTheme";

type TitleProps = {
	children: ReactNode;
	as?: "h1" | "h2" | "h3";
	/** Tints the title in the category's Kanto color instead of zinc. */
	category?: CategoryCode;
	className?: string;
};

export const Title = ({
	children,
	as: Tag = "h1",
	category,
	className = "",
}: TitleProps) => (
	<Tag
		{...(category ? categoryTheme(category) : {})}
		className={clsx(
			"text-md tracking-tight",
			category ? "text-theme" : "text-zinc-200",
			className
		)}
	>
		{children}
	</Tag>
);
