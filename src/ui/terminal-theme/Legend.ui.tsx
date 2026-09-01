import { clsx } from "clsx";

import { Dot, DOT_LABEL, DOT_VARIANTS, type DotVariant } from "./Dot.ui";
import { Text } from "./Text.ui";

const LEGEND = "flex flex-wrap items-center gap-x-4 gap-y-1";
const ITEM = "flex items-center gap-1.5";

export type LegendProps = {
	variants: readonly DotVariant[];
	className?: string;
};

const countOf = (variants: readonly DotVariant[], variant: DotVariant) =>
	variants.filter((each) => each === variant).length;

export const Legend = ({ variants, className }: LegendProps) => {
	const counted = DOT_VARIANTS.map((variant) => ({
		variant,
		count: countOf(variants, variant),
	})).filter((entry) => entry.count > 0);

	if (counted.length === 0) return null;

	return (
		<div className={clsx(LEGEND, className)}>
			{counted.map((entry) => (
				<span key={entry.variant} className={ITEM}>
					<Dot variant={entry.variant} />
					<Text tone="faint" size="caption">
						{entry.count} {DOT_LABEL[entry.variant]}
					</Text>
				</span>
			))}
		</div>
	);
};
