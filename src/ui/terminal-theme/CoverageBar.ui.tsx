import { clsx } from "clsx";

const TRACK =
	"flex h-1.5 w-16 shrink-0 overflow-hidden rounded-full bg-surface-raised";
const MET = "bg-viridian";
const SPILL = "bg-celadon";

const rounded = (percent: number) => Math.round(percent * 10) / 10;

const partsOf = (held: number, demand: number) => {
	const total = Math.max(held, demand);
	if (total <= 0) return { met: 0, spill: 0 };
	return {
		met: (Math.min(held, demand) / total) * 100,
		spill: (Math.max(0, held - demand) / total) * 100,
	};
};

export type CoverageBarProps = {
	held: number;
	demand: number;
	className?: string;
};

export const CoverageBar = ({ held, demand, className }: CoverageBarProps) => {
	const { met, spill } = partsOf(held, demand);

	return (
		<span
			role="img"
			aria-label={`${rounded(held)}% of ${rounded(demand)}% needed`}
			className={clsx(TRACK, className)}
		>
			<span className={MET} style={{ width: `${met}%` }} />
			{spill === 0 ? null : (
				<span className={SPILL} style={{ width: `${spill}%` }} />
			)}
		</span>
	);
};
