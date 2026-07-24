import type { ElementType, KeyboardEvent, ReactNode } from "react";

import { clsx } from "clsx";

import { StatusBadge, type StatusBadgeVariant } from "~/ui/StatusBadge.ui";
import {
	Paragraph,
	type ParagraphTone,
} from "~/ui/typography/Paragraph.component";

type StatusLineProps = {
	badge: StatusBadgeVariant;
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
				"flex items-start gap-3 py-1",
				interactive && "cursor-pointer transition-opacity hover:opacity-70",
				className
			)}
			onClick={onActivate}
			role={interactive ? "button" : undefined}
			tabIndex={interactive ? 0 : undefined}
			onKeyDown={interactive ? handleKeyDown : undefined}
		>
			<span className="shrink-0">
				<StatusBadge variant={badge} />
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
