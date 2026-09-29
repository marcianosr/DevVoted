import type { ReactNode } from "react";

import { clsx } from "clsx";

const TABLE = "flex flex-col overflow-hidden";
const HEADINGS =
	"flex w-full items-baseline gap-4 border-b border-theme-faint bg-theme-raised px-4 py-2 text-xs text-theme-muted";

export const TABLE_ROW = "flex w-full px-4 py-2";
export const TABLE_DIVIDER = "border-t border-theme-faint";

export type PanelTableBleed = "all" | "sides";

const BLEED = {
	all: "-mx-4 -my-4 rounded-2xl",
	sides: "-mx-4 border-y border-theme-faint",
} satisfies Record<PanelTableBleed, string>;

export type PanelTableColumn = { label: string; width: string };

export type PanelTableProps = {
	columns?: readonly PanelTableColumn[];
	bleed?: PanelTableBleed;
	children: ReactNode;
};

export const PanelTable = ({
	columns = [],
	bleed = "all",
	children,
}: PanelTableProps) => (
	<div className={clsx(TABLE, BLEED[bleed])}>
		{columns.length === 0 ? null : (
			<div className={HEADINGS}>
				{columns.map(({ label, width }) => (
					<span key={label} className={width}>
						{label}
					</span>
				))}
			</div>
		)}
		{children}
	</div>
);
