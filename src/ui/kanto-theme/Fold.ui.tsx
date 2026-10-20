import type { ReactNode } from "react";

import { clsx } from "clsx";

import { Badge } from "./Badge.ui";
import type { KantoColor } from "./colors";
import { PANEL_SURFACE } from "./Panel.ui";
import { Typography, type TypographyVariant } from "./Typography.ui";

const FOLD = "fold-reveal group/fold w-full";
const SUMMARY =
	"flex cursor-pointer list-none flex-wrap items-center gap-3 border-theme-faint px-4 py-3 select-none group-open/fold:border-b [&::-webkit-details-marker]:hidden";
const CARET =
	"inline-block shrink-0 text-theme-muted transition-transform group-open/fold:rotate-90";
const NAMING = "flex grow flex-col gap-1.5";
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
	heading?: FoldHeading;
	summary?: string;
	badges?: readonly FoldBadge[];
	open?: boolean;
	flush?: boolean;
	children: ReactNode;
};

const hasStrip = ({ summary, badges }: Pick<FoldProps, "summary" | "badges">) =>
	summary !== undefined || (badges ?? []).length > 0;

export const Fold = ({
	title,
	heading = "section",
	summary,
	badges = [],
	open = false,
	flush = false,
	children,
}: FoldProps) => (
	<details open={open} className={clsx(PANEL_SURFACE, FOLD)}>
		<summary className={SUMMARY}>
			<span aria-hidden className={CARET}>
				{CARET_GLYPH}
			</span>
			<span className={NAMING}>
				<Typography variant={HEADING[heading]} as="h3">
					{title}
				</Typography>
			</span>
			{hasStrip({ summary, badges }) ? (
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
				</span>
			) : null}
		</summary>
		<div className={flush ? FLUSH_BODY : BODY}>{children}</div>
	</details>
);
