import type { ReactNode } from "react";

import { cva } from "class-variance-authority";
import { clsx } from "clsx";

export type RowSpacing = "tight" | "compact" | "spacious";

const ROW = "flex w-full items-center gap-3 text-left";

const SPACING = {
	tight: "px-2 py-1",
	compact: "px-3 py-2",
	spacious: "px-5 py-4",
} satisfies Record<RowSpacing, string>;

const DIMMED = { true: "opacity-50", false: "" };

const CONTENT = "flex min-w-0 flex-1 items-center gap-3";
const TRAILING = "shrink-0";

const rowVariants = cva(ROW, {
	variants: { spacing: SPACING, dimmed: DIMMED },
});

export type RowProps = {
	children: ReactNode;
	leading?: ReactNode;
	trailing?: ReactNode;
	spacing?: RowSpacing;
	dimmed?: boolean;
	as?: "div" | "label" | "summary" | "li";
	className?: string;
};

export const Row = ({
	children,
	leading,
	trailing,
	spacing = "compact",
	dimmed = false,
	as: Tag = "div",
	className,
}: RowProps) => (
	<Tag className={clsx(rowVariants({ spacing, dimmed }), className)}>
		{leading}
		<span className={CONTENT}>{children}</span>
		{trailing ? <span className={TRAILING}>{trailing}</span> : null}
	</Tag>
);
