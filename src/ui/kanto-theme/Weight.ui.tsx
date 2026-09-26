import { clsx } from "clsx";

import { isWeightClamped, weightWidth } from "./weights";

const BLOCK =
	"badge-theme inline-flex h-6 shrink-0 items-center justify-center rounded-md text-xs font-bold tabular-nums";
const CLAMPED = "ring-1 ring-inset ring-theme-soft";

export type WeightProps = {
	slots: number;
};

export const Weight = ({ slots }: WeightProps) => (
	<span
		className={clsx(
			BLOCK,
			weightWidth(slots),
			isWeightClamped(slots) && CLAMPED
		)}
	>
		{slots}
	</span>
);
