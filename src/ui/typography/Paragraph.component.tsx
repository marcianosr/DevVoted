import type { ElementType, ReactNode } from "react";

import { cva } from "class-variance-authority";
import { clsx } from "clsx";

type ParagraphSize = "xs" | "sm";

/**
 * Two grays, not five: `default` for anything meant to be read and `muted` for
 * everything stepped back from it. The ramp used to run zinc-100/400/500 plus a
 * separate `pewter`, and the level a caption got was effectively arbitrary — the
 * same hint sentence appeared at two of them. `muted` is pewter, the palette's
 * one true gray; the old `faint` sat at 3.7:1 on this background, under the 4.5:1
 * a body of text owes the reader.
 */
export type ParagraphTone =
	| "default"
	| "theme"
	| "muted"
	| "celadon"
	| "cerulean"
	| "vermillion"
	| "viridian"
	| "cinnabar"
	| "saffron"
	| "gradient";

const paragraph = cva("tracking-tight", {
	variants: {
		size: {
			xs: "text-xs",
			sm: "text-sm",
		} satisfies Record<ParagraphSize, string>,
		tone: {
			default: "text-zinc-100",
			theme: "text-theme",
			muted: "text-pewter",
			celadon: "text-celadon",
			cerulean: "text-cerulean",
			vermillion: "text-vermillion",
			viridian: "text-viridian",
			cinnabar: "text-cinnabar",
			saffron: "text-saffron",
			gradient: "text-gradient-green",
		} satisfies Record<ParagraphTone, string>,
	},
});

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
	<Tag className={clsx(paragraph({ size, tone }), className)}>{children}</Tag>
);
