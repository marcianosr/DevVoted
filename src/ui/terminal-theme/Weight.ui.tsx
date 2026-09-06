import { clsx } from "clsx";

import { isBiggestSize, sizeFill } from "~/ui/sizes";

import { plural } from "./format";

const BLOCK =
	"inline-flex h-4 shrink-0 items-stretch overflow-hidden rounded-xs bg-zinc-800";
const EDGE = "w-[3px] shrink-0";
const PRISMATIC_EDGE = "legendary-bar";
const FIGURE =
	"flex items-center px-1 text-xxs font-normal tabular-nums text-zinc-400";

export type WeightProps = {
	slots: number;
	className?: string;
};

export const Weight = ({ slots, className }: WeightProps) => (
	<span
		role="img"
		aria-label={plural(slots, "slot")}
		className={clsx(BLOCK, className)}
	>
		<span
			className={clsx(
				EDGE,
				isBiggestSize(slots) ? PRISMATIC_EDGE : sizeFill(slots)
			)}
		/>
		<span className={FIGURE}>{slots}</span>
	</span>
);
