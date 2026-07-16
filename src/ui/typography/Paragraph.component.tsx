import type { ElementType, ReactNode } from "react";

type ParagraphSize = "xs" | "sm";
type ParagraphTone =
	"default" | "theme" | "pewter" | "muted" | "celadon" | "vermillion";

const SIZE_CLASS: Record<ParagraphSize, string> = {
	xs: "text-xs",
	sm: "text-sm",
};

const TONE_CLASS: Record<ParagraphTone, string> = {
	default: "text-zinc-100",
	theme: "text-theme",
	pewter: "text-pewter",
	celadon: "text-celadon",
	vermillion: "text-vermillion",
	muted: "text-zinc-400",
};

type ParagraphProps = {
	children: ReactNode;
	as?: ElementType;
	size?: ParagraphSize;
	tone?: ParagraphTone;
	className?: string;
};

export const Paragraph = ({
	children,
	as: Tag = "p",
	size = "xs",
	tone = "default",
	className = "",
}: ParagraphProps) => (
	<Tag
		className={`${SIZE_CLASS[size]} ${TONE_CLASS[tone]} tracking-tight ${className}`}
	>
		{children}
	</Tag>
);
