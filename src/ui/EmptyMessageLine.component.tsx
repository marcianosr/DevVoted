import type { ReactNode } from "react";

type EmptyMessageLineProps = {
	children: ReactNode;
};

export const EmptyMessageLine = ({ children }: EmptyMessageLineProps) => (
	<p className="text-zinc-300">{children}</p>
);
