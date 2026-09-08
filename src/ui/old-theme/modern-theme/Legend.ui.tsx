import type { ReactNode } from "react";

import { Text } from "./Text.ui";

const LEGEND = "flex flex-wrap items-center gap-4 border-t border-edge pt-3";
const ITEM = "inline-flex items-center gap-2";

export type LegendItem = {
	id: string;
	marker?: ReactNode;
	label: string;
	labelClassName?: string;
};

export type LegendProps = { items: readonly LegendItem[] };

export const Legend = ({ items }: LegendProps) => (
	<ul className={LEGEND}>
		{items.map(({ id, marker, label, labelClassName }) => (
			<li key={id} className={ITEM}>
				{marker}
				<Text size="meta" tone="muted">
					<span className={labelClassName}>{label}</span>
				</Text>
			</li>
		))}
	</ul>
);
