import type { ReactNode } from "react";

import { clsx } from "clsx";

import { Badge } from "./Badge.ui";
import type { KantoColor } from "./colors";
import { Typography } from "./Typography.ui";

export const PANEL_SURFACE =
	"flex flex-col rounded-2xl border border-theme-faint bg-theme-faint";

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

export type PanelProps = {
	children: ReactNode;
	className?: string;
};

const Surface = ({ children, className }: PanelProps) => (
	<section className={clsx(PANEL_SURFACE, className)}>{children}</section>
);

export type PanelBadge = { label: string; color?: KantoColor };

export type PanelHeaderProps = {
	label: string;
	badge?: PanelBadge;
	meta?: ReactNode;
};

const PanelHeader = ({ label, badge, meta }: PanelHeaderProps) => (
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

export type PanelBodyProps = {
	children: ReactNode;
	className?: string;
};

const PanelBody = ({ children, className }: PanelBodyProps) => (
	<div className={clsx(BODY, className)}>{children}</div>
);

export type PanelColumn = { label: string; width: string };

export type PanelColumnsProps = {
	columns: readonly PanelColumn[];
};

const PanelColumns = ({ columns }: PanelColumnsProps) => (
	<div className={COLUMNS}>
		{columns.map(({ label, width }) => (
			<span key={label} className={width}>
				{label}
			</span>
		))}
	</div>
);

export type PanelRowsProps = {
	children: ReactNode;
};

const PanelRows = ({ children }: PanelRowsProps) => (
	<div className={ROWS}>{children}</div>
);

export type PanelRowProps = {
	children: ReactNode;
	trailing?: ReactNode;
	theme?: KantoColor;
	className?: string;
};

const PanelRow = ({ children, trailing, theme, className }: PanelRowProps) => (
	<div data-screen-theme={theme} className={clsx(ROW, className)}>
		{children}
		{trailing === undefined ? null : (
			<span className={TRAILING}>{trailing}</span>
		)}
	</div>
);

export type PanelFooterProps = {
	children: ReactNode;
	trailing?: ReactNode;
};

const PanelFooter = ({ children, trailing }: PanelFooterProps) => (
	<footer className={FOOTER}>
		{children}
		{trailing === undefined ? null : (
			<span className={TRAILING}>{trailing}</span>
		)}
	</footer>
);

export const Panel = Object.assign(Surface, {
	Header: PanelHeader,
	Body: PanelBody,
	Columns: PanelColumns,
	Rows: PanelRows,
	Row: PanelRow,
	Footer: PanelFooter,
});
