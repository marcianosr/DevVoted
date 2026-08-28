import type { ReactNode } from "react";

import { clsx } from "clsx";

import { type Rarity, RARITY_TONE } from "./rarity";
import { Text } from "./Text.ui";

const FIGURES = "flex items-baseline justify-end gap-4";
const FIGURE_COL = "w-24 text-right tabular-nums";
const GRADE_COL = "w-14 shrink-0 text-right";

export type RowFiguresProps = {
	grade?: Rarity;
	figure?: ReactNode;
};

export const RowFigures = ({ grade, figure }: RowFiguresProps) => (
	<span className={FIGURES}>
		<span className={FIGURE_COL}>{figure}</span>
		{grade === undefined ? null : (
			<span className={clsx(GRADE_COL, RARITY_TONE[grade])}>
				<Text size="meta" tone="inherit">
					{grade}
				</Text>
			</span>
		)}
	</span>
);
