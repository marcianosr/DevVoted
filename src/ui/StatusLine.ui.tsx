import type { ElementType, KeyboardEvent, ReactNode } from "react";

import { clsx } from "clsx";

import {
	StatusBadge,
	type StatusBadgeEmphasis,
	type StatusBadgeVariant,
} from "~/ui/StatusBadge.ui";
import { StatusDot } from "~/ui/StatusDot.ui";
import {
	Paragraph,
	type ParagraphTone,
} from "~/ui/typography/Paragraph.component";

export type StatusIndicator = "badge" | "dot";

export type StatusLineSpacing = "compact" | "spacious";

type StatusLineProps = {
	badge: StatusBadgeVariant;
	badgeEmphasis?: StatusBadgeEmphasis;
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
	badgeEmphasis = "solid",
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
				"flex gap-3 items-center",
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
					<StatusBadge variant={badge} emphasis={badgeEmphasis} />
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
