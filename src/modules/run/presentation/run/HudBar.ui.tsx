import type { ReactNode } from "react";

/** Sticky-width frame for the run HUD above the active screen. */
export const HudBar = ({ children }: { children: ReactNode }) => (
	<div className="mx-auto w-full max-w-5xl px-4 pt-6">{children}</div>
);
