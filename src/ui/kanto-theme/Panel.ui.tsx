import type { ReactNode } from "react";

import { clsx } from "clsx";

const PANEL_COLUMN = "flex flex-col gap-4";

export const PANEL_CHROME =
	"rounded-2xl border border-theme-faint bg-theme-faint p-2 px-4";

export const PANEL_SURFACE = `${PANEL_COLUMN} ${PANEL_CHROME}`;

export type PanelProps = {
	children: ReactNode;
	className?: string;
};

export const Panel = ({ children, className }: PanelProps) => (
	<div className={clsx(PANEL_SURFACE, className)}>{children}</div>
);
