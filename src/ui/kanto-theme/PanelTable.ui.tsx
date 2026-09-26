import type { ReactNode } from "react";

const TABLE = "-mx-4 -my-4 flex flex-col overflow-hidden rounded-2xl";
const HEADINGS =
	"flex w-full items-baseline gap-4 border-b border-theme-faint bg-theme-raised px-4 py-2 text-xs text-theme-muted";

export const TABLE_ROW = "flex w-full px-4 py-2";
export const TABLE_DIVIDER = "border-t border-theme-faint";

export type PanelTableColumn = { label: string; width: string };

export type PanelTableProps = {
	columns?: readonly PanelTableColumn[];
	children: ReactNode;
};

export const PanelTable = ({ columns = [], children }: PanelTableProps) => (
	<div className={TABLE}>
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
