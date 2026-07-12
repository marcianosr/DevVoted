import type { ReactNode } from "react";

type ParagraphProps = {
	children: ReactNode;
	className?: string;
};

export const Paragraph = ({ children, className = "" }: ParagraphProps) => (
	<p className={`text-base text-white ${className}`}>{children}</p>
);
