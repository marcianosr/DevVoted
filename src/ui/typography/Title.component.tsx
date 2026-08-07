import type { ReactNode } from "react";

import { clsx } from "clsx";

type TitleProps = {
	children: ReactNode;
	as?: "h1" | "h2" | "h3";
	className?: string;
};

export const Title = ({
	children,
	as: Tag = "h1",
	className = "",
}: TitleProps) => (
	<Tag className={clsx("text-md tracking-tight text-zinc-200", className)}>
		{children}
	</Tag>
);
