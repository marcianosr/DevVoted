import type { ReactNode } from "react";

import { clsx } from "clsx";

import { Badge } from "./Badge.ui";
import type { KantoColor } from "./colors";
import { PANEL_V2_SURFACE } from "./PanelV2.ui";
import { Typography, type TypographyVariant } from "./Typography.ui";
import { Verdict, type VerdictOutcome } from "./Verdict.ui";

const FOLD = "group/fold w-full";
const SUMMARY =
	"flex cursor-pointer list-none flex-wrap items-center gap-3 border-theme-faint px-4 py-3 select-none group-open/fold:border-b [&::-webkit-details-marker]:hidden";
const CARET =
	"inline-block shrink-0 text-theme-muted transition-transform group-open/fold:rotate-90";
const META = "flex flex-wrap items-center gap-2 sm:ml-auto";
const BODY = "flex w-full flex-col gap-4 px-4 py-4";

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
	open?: boolean;
	children: ReactNode;
};

export const Fold = ({
	title,
	lead,
	leadShare,
	heading = "section",
	summary,
	badges = [],
	open = false,
	children,
}: FoldProps) => (
	<details open={open} className={clsx(PANEL_V2_SURFACE, FOLD)}>
		<summary className={SUMMARY}>
			<span aria-hidden className={CARET}>
				{CARET_GLYPH}
			</span>
			{lead === undefined ? null : <Verdict outcome={lead} share={leadShare} />}
			<Typography variant={HEADING[heading]} as="h3">
				{title}
			</Typography>
			{summary === undefined && badges.length === 0 ? null : (
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
			)}
		</summary>
		<div className={BODY}>{children}</div>
	</details>
);
