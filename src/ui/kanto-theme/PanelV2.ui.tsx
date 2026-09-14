import type { ReactNode } from "react";

import { clsx } from "clsx";

import { Badge } from "./Badge.ui";
import type { KantoColor } from "./colors";
import { Typography } from "./Typography.ui";

export const PANEL_V2_SURFACE =
	"flex w-full flex-col rounded-2xl border border-theme-faint bg-theme-faint";

const SURFACE = PANEL_V2_SURFACE;
const HEADER =
	"flex items-center gap-2 border-b border-theme-faint px-4 py-3 bg-theme/5 first:rounded-t-2xl";
const GLYPH = "size-2.5 shrink-0 rounded-xs bg-theme-muted";
const META =
	"ml-auto flex flex-wrap items-center justify-end gap-2 text-xs text-theme-muted";
const BODY = "flex flex-col gap-4 px-4 py-4";
const COLUMNS =
	"flex w-full items-baseline gap-4 border-b border-theme-faint bg-theme-raised px-4 py-2 text-xs text-theme-muted first:rounded-t-2xl last:rounded-b-2xl";
const ROWS = "flex w-full flex-col";
const ROW =
	"flex w-full items-center gap-3 border-t border-theme-faint px-4 py-2 first:border-t-0";
const FOOTER = "flex items-center gap-3 border-t border-theme-faint px-4 py-3";
const TRAILING = "ml-auto flex shrink-0 items-center gap-2";

export type PanelV2Props = {
	children: ReactNode;
	className?: string;
};

const Surface = ({ children, className }: PanelV2Props) => (
	<section className={clsx(SURFACE, className)}>{children}</section>
);

export type PanelV2Badge = { label: string; color?: KantoColor };

export type PanelV2HeaderProps = {
	label: string;
	badge?: PanelV2Badge;
	meta?: ReactNode;
};

const PanelHeader = ({ label, badge, meta }: PanelV2HeaderProps) => (
	<header className={HEADER}>
		<span aria-hidden className={GLYPH} />
		<Typography variant="title" as="h3">
			{label}
		</Typography>
		{badge === undefined ? null : (
			<Badge color={badge.color}>{badge.label}</Badge>
		)}
		{meta === undefined ? null : <span className={META}>{meta}</span>}
	</header>
);

export type PanelV2BodyProps = {
	children: ReactNode;
	className?: string;
};

const PanelBody = ({ children, className }: PanelV2BodyProps) => (
	<div className={clsx(BODY, className)}>{children}</div>
);

export type PanelV2Column = { label: string; width: string };

export type PanelV2ColumnsProps = {
	columns: readonly PanelV2Column[];
};

const PanelColumns = ({ columns }: PanelV2ColumnsProps) => (
	<div className={COLUMNS}>
		{columns.map(({ label, width }) => (
			<span key={label} className={width}>
				{label}
			</span>
		))}
	</div>
);

export type PanelV2RowsProps = {
	children: ReactNode;
};

const PanelRows = ({ children }: PanelV2RowsProps) => (
	<div className={ROWS}>{children}</div>
);

export type PanelV2RowProps = {
	children: ReactNode;
	trailing?: ReactNode;
	theme?: KantoColor;
	className?: string;
};

const PanelRow = ({
	children,
	trailing,
	theme,
	className,
}: PanelV2RowProps) => (
	<div data-screen-theme={theme} className={clsx(ROW, className)}>
		{children}
		{trailing === undefined ? null : (
			<span className={TRAILING}>{trailing}</span>
		)}
	</div>
);

export type PanelV2FooterProps = {
	children: ReactNode;
	trailing?: ReactNode;
};

const PanelFooter = ({ children, trailing }: PanelV2FooterProps) => (
	<footer className={FOOTER}>
		{children}
		{trailing === undefined ? null : (
			<span className={TRAILING}>{trailing}</span>
		)}
	</footer>
);

export const PanelV2 = Object.assign(Surface, {
	Header: PanelHeader,
	Body: PanelBody,
	Columns: PanelColumns,
	Rows: PanelRows,
	Row: PanelRow,
	Footer: PanelFooter,
});
