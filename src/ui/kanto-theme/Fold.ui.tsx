import type { ReactNode } from "react";

import { clsx } from "clsx";

import { Badge } from "./Badge.ui";
import type { KantoColor } from "./colors";
import { Lead, type LeadLine } from "./Lead.ui";
import { PANEL_SURFACE } from "./Panel.ui";
import { Typography, type TypographyVariant } from "./Typography.ui";
import { Verdict, type VerdictOutcome } from "./Verdict.ui";

const FOLD = "group/fold w-full";
const SUMMARY =
	"flex cursor-pointer list-none flex-wrap items-center gap-3 border-theme-faint px-4 py-3 select-none group-open/fold:border-b [&::-webkit-details-marker]:hidden";
const CARET =
	"inline-block shrink-0 text-theme-muted transition-transform group-open/fold:rotate-90";
const NAMING = "grow";
const META = "flex flex-wrap items-center gap-2";
const BODY = "flex w-full flex-col gap-4 px-4 py-4";
const FLUSH_BODY = "flex w-full flex-col";

const CARET_GLYPH = "›";

export type FoldBadge = { label: string; color?: KantoColor };

export type FoldHeading = "section" | "row";

const HEADING = {
	section: "title",
	row: "paragraph",
} satisfies Record<FoldHeading, TypographyVariant>;

export type FoldProps = {
	title: string;
	lead?: VerdictOutcome;
	leadShare?: number;
	heading?: FoldHeading;
	summary?: string;
	badges?: readonly FoldBadge[];
	meta?: LeadLine;
	open?: boolean;
	flush?: boolean;
	children: ReactNode;
};

const hasStrip = ({
	summary,
	badges,
	meta,
}: Pick<FoldProps, "summary" | "badges" | "meta">) =>
	summary !== undefined || (badges ?? []).length > 0 || meta !== undefined;

export const Fold = ({
	title,
	lead,
	leadShare,
	heading = "section",
	summary,
	badges = [],
	meta,
	open = false,
	flush = false,
	children,
}: FoldProps) => (
	<details open={open} className={clsx(PANEL_SURFACE, FOLD)}>
		<summary className={SUMMARY}>
			<span aria-hidden className={CARET}>
				{CARET_GLYPH}
			</span>
			{lead === undefined ? null : <Verdict outcome={lead} share={leadShare} />}
			<span className={NAMING}>
				<Typography variant={HEADING[heading]} as="h3">
					{title}
				</Typography>
			</span>
			{hasStrip({ summary, badges, meta }) ? (
				<span className={META}>
					{summary === undefined ? null : (
						<Typography variant="hint" as="span">
							{summary}
						</Typography>
					)}
					{badges.map((badge, index) => (
						<Badge key={index} color={badge.color}>
							{badge.label}
						</Badge>
					))}
					{meta === undefined ? null : <Lead line={meta} as="span" />}
				</span>
			) : null}
		</summary>
		<div className={flush ? FLUSH_BODY : BODY}>{children}</div>
	</details>
);
