import type { ReactNode } from "react";

import { cva } from "class-variance-authority";
import { clsx } from "clsx";

export type RowSpacing = "tight" | "compact" | "spacious";
export type RowAlign = "center" | "baseline";

const ROW = "flex w-full gap-3 text-left text-xs";

const SPACING = {
	tight: "px-2 py-0.5",
	compact: "px-2 py-1.5",
	spacious: "px-3 py-2.5",
} satisfies Record<RowSpacing, string>;

const ALIGN = {
	center: "items-center",
	baseline: "items-baseline",
} satisfies Record<RowAlign, string>;

const DIMMED = { true: "opacity-60", false: "" };

const CONTENT = "flex min-w-0 flex-1 items-baseline gap-2 text-xs";
const TRAILING = "shrink-0";

const rowVariants = cva(ROW, {
	variants: { spacing: SPACING, align: ALIGN, dimmed: DIMMED },
});

export type RowProps = {
	children: ReactNode;
	leading?: ReactNode;
	trailing?: ReactNode;
	spacing?: RowSpacing;
	align?: RowAlign;
	dimmed?: boolean;
	as?: "div" | "label" | "summary";
	contentAs?: "span" | "dd";
	className?: string;
};

export const Row = ({
	children,
	leading,
	trailing,
	spacing = "compact",
	align = "center",
	dimmed = false,
	as: Tag = "div",
	contentAs: Content = "span",
	className,
}: RowProps) => (
	<Tag className={clsx(rowVariants({ spacing, align, dimmed }), className)}>
		{leading}
		<Content className={CONTENT}>{children}</Content>
		{trailing ? <span className={TRAILING}>{trailing}</span> : null}
	</Tag>
);
