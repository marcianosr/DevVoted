import type { ReactNode } from "react";

import { clsx } from "clsx";

import { Badge } from "./Badge.ui";
import type { KantoColor } from "./colors";
import { opensHere } from "./opensHere";
import { Typography } from "./Typography.ui";

export const PANEL_SURFACE =
	"panel-surface flex flex-col rounded-2xl border border-theme-faint bg-theme-faint";

const HEADER =
	"flex flex-wrap items-center gap-2 border-b border-theme-faint px-4 py-3 bg-theme/5 first:rounded-t-2xl";
const GLYPH = "panel-glyph size-2.5 shrink-0 rounded-xs bg-theme-muted";
const STEP =
	"flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-bold tabular-nums";
const STEP_TODO = "badge-theme";
const STEP_DONE = "bg-theme-lit text-zinc-950";
const STEP_DONE_COLOR: KantoColor = "viridian";
const HEADER_END = "ml-auto flex flex-wrap items-center justify-end gap-2";
const META =
	"flex flex-wrap items-center justify-end gap-2 text-xs text-theme-muted";
const HEADER_SUMMARY = "basis-full text-xs text-theme-muted";
const BODY = "flex flex-col gap-4 px-4 py-4";
const COLUMNS =
	"flex w-full items-baseline gap-4 border-b border-theme-faint bg-theme-raised px-4 py-2 text-xs text-theme-muted first:rounded-t-2xl last:rounded-b-2xl";
const ROWS = "flex w-full flex-col";
const ROW =
	"flex w-full items-center gap-3 border-t border-theme-faint px-4 py-2 first:border-t-0";
const ROW_LINK = "transition-colors hover:bg-theme-raised";
const ROW_PRESS = `${ROW_LINK} cursor-pointer text-left`;
const ROW_PICKED = "bg-theme-raised ring-1 ring-theme ring-inset";
const ROW_HERE = "bg-theme-raised";
const FOOTER =
	"flex flex-wrap items-center gap-3 border-t border-theme-faint px-4 py-3";
const TRAILING = "ml-auto flex shrink-0 items-center gap-2";

export type PanelProps = {
	children: ReactNode;
	className?: string;
};

const Surface = ({ children, className }: PanelProps) => (
	<section className={clsx(PANEL_SURFACE, className)}>{children}</section>
);

export const headingOf = (label: string): string =>
	`${label.charAt(0).toUpperCase()}${label.slice(1)}`;

export type PanelBadge = { label: string; color?: KantoColor };

export type PanelStep = { number: number; done: boolean };

export type PanelHeaderProps = {
	label: string;
	step?: PanelStep;
	badge?: PanelBadge;
	summary?: ReactNode;
	meta?: ReactNode;
	trailing?: ReactNode;
};

const StepMark = ({ step }: { step: PanelStep }) => (
	<span
		data-screen-theme={step.done ? STEP_DONE_COLOR : undefined}
		className={clsx(STEP, step.done ? STEP_DONE : STEP_TODO)}
	>
		{step.number}
	</span>
);

const PanelHeader = ({
	label,
	step,
	badge,
	summary,
	meta,
	trailing,
}: PanelHeaderProps) => (
	<header className={HEADER}>
		{step === undefined ? (
			<span aria-hidden className={GLYPH} />
		) : (
			<StepMark step={step} />
		)}
		<Typography variant="title" as="h3">
			{headingOf(label)}
		</Typography>
		{badge === undefined ? null : (
			<Badge color={badge.color}>{badge.label}</Badge>
		)}
		{meta === undefined && trailing === undefined ? null : (
			<span className={HEADER_END}>
				{meta === undefined ? null : <span className={META}>{meta}</span>}
				{trailing}
			</span>
		)}
		{summary === undefined ? null : (
			<span className={HEADER_SUMMARY}>{summary}</span>
		)}
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
	href?: string;
	onPress?: () => void;
	onNavigate?: (href: string) => void;
	picked?: boolean;
};

const PanelRow = ({
	children,
	trailing,
	theme,
	className,
	href,
	onPress,
	onNavigate,
	picked,
}: PanelRowProps) => {
	const content = (
		<>
			{children}
			{trailing === undefined ? null : (
				<span className={TRAILING}>{trailing}</span>
			)}
		</>
	);

	if (onPress !== undefined)
		return (
			<button
				type="button"
				aria-current={picked === true}
				onClick={onPress}
				data-screen-theme={theme}
				className={clsx(
					ROW,
					ROW_PRESS,
					picked === true && ROW_PICKED,
					className
				)}
			>
				{content}
			</button>
		);

	if (href === undefined)
		return (
			<div data-screen-theme={theme} className={clsx(ROW, className)}>
				{content}
			</div>
		);

	return (
		<a
			href={href}
			aria-current={picked === true ? "page" : undefined}
			data-screen-theme={theme}
			className={clsx(ROW, ROW_LINK, picked === true && ROW_HERE, className)}
			onClick={(event) => {
				if (onNavigate === undefined || !opensHere(event)) return;
				event.preventDefault();
				onNavigate(href);
			}}
		>
			{content}
		</a>
	);
};

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
