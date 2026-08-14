import type { ElementType, KeyboardEvent, ReactNode } from "react";

import { clsx } from "clsx";

import {
	StatusBadge,
	type StatusBadgeEmphasis,
	type StatusBadgeVariant,
} from "~/ui/StatusBadge.ui";
import { Paragraph } from "~/ui/typography/Paragraph.component";
import type { TextTone } from "~/ui/typography/textTone";

export type StatusLineSpacing = "compact" | "spacious";

type StatusLineProps = {
	badge: StatusBadgeVariant;
	badgeEmphasis?: StatusBadgeEmphasis;
	spacing?: StatusLineSpacing;
	line: ReactNode;
	lineTone?: TextTone;
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
			<span className="shrink-0">
				<StatusBadge variant={badge} emphasis={badgeEmphasis} />
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
