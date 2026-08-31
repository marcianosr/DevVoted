import type { ReactNode } from "react";

import { plural } from "./format";
import { Text } from "./Text.ui";

const FIGURES = "flex items-baseline justify-end gap-4";
const FIGURE_COL = "w-24 text-right tabular-nums";
const SIZE_COL = "w-14 shrink-0 text-right text-zinc-400";

export type RowFiguresProps = {
	slots?: number;
	figure?: ReactNode;
};

export const RowFigures = ({ slots, figure }: RowFiguresProps) => (
	<span className={FIGURES}>
		<span className={FIGURE_COL}>{figure}</span>
		{slots === undefined ? null : (
			<span className={SIZE_COL}>
				<Text size="meta" tone="inherit">
					{plural(slots, "slot")}
				</Text>
			</span>
		)}
	</span>
);
