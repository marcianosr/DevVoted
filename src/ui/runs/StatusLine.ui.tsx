import type { ElementType, KeyboardEvent, ReactNode } from "react";

import { clsx } from "clsx";

import { StatusBadge, type StatusBadgeVariant } from "~/ui/StatusBadge.ui";
import { StatusDot } from "~/ui/StatusDot.ui";
import {
	Paragraph,
	type ParagraphTone,
} from "~/ui/typography/Paragraph.component";

/** How a row announces its state: the boxed text badge or a compact dot. */
export type StatusIndicator = "badge" | "dot";

/** Vertical rhythm: dense reporter rows, or divided pipeline rows with air. */
export type StatusLineSpacing = "compact" | "spacious";

type StatusLineProps = {
	badge: StatusBadgeVariant;
	indicator?: StatusIndicator;
	spacing?: StatusLineSpacing;
	line: ReactNode;
	lineTone?: ParagraphTone;
	lineSize?: "xs" | "sm";
	leading?: ReactNode;
	trailing?: ReactNode;
	as?: ElementType;
	className?: string;
	onActivate?: () => void;
};

export const StatusLine = ({
	badge,
	indicator = "badge",
	spacing = "compact",
	line,
	lineTone = "default",
	lineSize,
	leading,
	trailing,
	as: Tag = "div",
	className = "",
	onActivate,
}: StatusLineProps) => {
	const interactive = onActivate !== undefined;

	const handleKeyDown = (event: KeyboardEvent) => {
		if (event.key === "Enter" || event.key === " ") {
			event.preventDefault();
			onActivate?.();
		}
	};

	return (
		<Tag
			className={clsx(
				"flex items-start gap-3",
				spacing === "spacious" ? "py-3" : "py-1",
				interactive && "cursor-pointer transition-opacity hover:opacity-70",
				className
			)}
			onClick={onActivate}
			role={interactive ? "button" : undefined}
			tabIndex={interactive ? 0 : undefined}
			onKeyDown={interactive ? handleKeyDown : undefined}
		>
			<span
				className={clsx(
					"shrink-0",
					indicator === "dot" && "flex h-5 items-center"
				)}
			>
				{indicator === "dot" ? (
					<StatusDot variant={badge} />
				) : (
					<StatusBadge variant={badge} />
				)}
			</span>
			{leading ? <span className="shrink-0">{leading}</span> : null}
			<Paragraph
				as="span"
				size={lineSize}
				tone={lineTone}
				className="min-w-0 flex-1"
			>
				{line}
			</Paragraph>
			{trailing}
		</Tag>
	);
};
