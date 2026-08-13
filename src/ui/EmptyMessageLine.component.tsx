import type { ReactNode } from "react";

type EmptyMessageLineProps = {
	children: ReactNode;
};

export const EmptyMessageLine = ({ children }: EmptyMessageLineProps) => (
	<p className="text-pewter">{children}</p>
);
