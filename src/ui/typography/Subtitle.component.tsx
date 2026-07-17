import type { ReactNode } from "react";

type SubtitleProps = {
	children: ReactNode;
	as?: "h2" | "h3" | "p";
	className?: string;
};

export const Subtitle = ({
	children,
	as = "p",
	className = "",
}: SubtitleProps) => {
	const Tag = as;
	return (
		<Tag
			className={`text-sm font-bold tracking-tight text-zinc-300 leading-6 ${className}`}
		>
			{children}
		</Tag>
	);
};
