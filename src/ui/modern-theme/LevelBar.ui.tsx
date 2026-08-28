import { clsx } from "clsx";

const BAR = "inline-flex shrink-0 items-center gap-[2px] align-middle";
const SEGMENT = "h-[3px] w-[7px] rounded-[1px]";
const FILLED = "bg-zinc-300";

const EMPTY = "bg-zinc-800";

export type LevelBarProps = {
	level: number;
	maxLevel: number;
};

export const LevelBar = ({ level, maxLevel }: LevelBarProps) => (
	<span
		className={BAR}
		role="meter"
		aria-valuenow={level}
		aria-valuemin={1}
		aria-valuemax={maxLevel}
		aria-label={`level ${level} of ${maxLevel}`}
	>
		{Array.from({ length: maxLevel }, (_, step) => (
			<span
				key={step}
				aria-hidden
				className={clsx(SEGMENT, step < level ? FILLED : EMPTY)}
			/>
		))}
	</span>
);
