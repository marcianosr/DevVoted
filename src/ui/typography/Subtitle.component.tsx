import type { ReactNode } from "react";

import { clsx } from "clsx";

type SubtitleProps = {
	children: ReactNode;
	as?: "h2" | "h3" | "p";
	className?: string;
};

export const Subtitle = ({
	children,
	as: Tag = "h2",
	className = "",
}: SubtitleProps) => (
	<Tag
		className={clsx(
			"text-xs text-zinc-400 font-medium tracking-tight",
			className
		)}
	>
		{children}
	</Tag>
);
