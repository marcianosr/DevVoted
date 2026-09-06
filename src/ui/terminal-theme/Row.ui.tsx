import type { ReactNode } from "react";

import { clsx } from "clsx";

import { Figures } from "./Figures.ui";
import { Text } from "./Text.ui";

// gap-y is its own, much smaller figure: once the row wraps, a shared gap-3
// puts twelve pixels between a name and the detail directly under it, and a
// list of those reads as eight blocks rather than eight rows.
const ROW =
	"flex min-h-9 items-center gap-x-3 gap-y-0.5 py-1.5 @max-3xl:flex-wrap";
const NAME = "flex shrink-0 items-center gap-1.5";
// Wide enough for the longest name inside a DexChip — chip padding, the weight
// block and a five-pip version track all sit in this column now.
const NAME_COLUMN = "w-56 @max-3xl:w-auto";
const NAME_TEXT = "min-w-0 truncate whitespace-nowrap";
const DETAIL = "min-w-0 flex-1 @max-3xl:order-last @max-3xl:basis-full";
const TRAILING = "ml-auto flex shrink-0 items-center gap-2";
const DIMMED = "cursor-not-allowed opacity-50";

export type RowProps = {
	name: ReactNode;
	leading?: ReactNode;
	tag?: ReactNode;
	detail?: ReactNode;
	trailing?: ReactNode;
	dimmed?: boolean;
	className?: string;
};

const noteOf = (detail: ReactNode) =>
	typeof detail === "string" ? <Figures text={detail} /> : detail;

export const Row = ({
	name,
	leading,
	tag,
	detail,
	trailing,
	dimmed = false,
	className,
}: RowProps) => (
	<div className={clsx(ROW, dimmed && DIMMED, className)}>
		{leading}
		<span className={clsx(NAME, detail !== undefined && NAME_COLUMN)}>
			<Text className={NAME_TEXT}>{name}</Text>
			{tag}
		</span>
		{detail === undefined ? null : (
			<Text tone="muted" size="caption" weight="thin" className={DETAIL}>
				{noteOf(detail)}
			</Text>
		)}
		{trailing === undefined ? null : (
			<span className={TRAILING}>{trailing}</span>
		)}
	</div>
);
