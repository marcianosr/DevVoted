import type { ReactNode } from "react";

export const HudBar = ({ children }: { children: ReactNode }) => (
	<div className="mx-auto w-full max-w-5xl p-2">{children}</div>
);
