import { clsx } from "clsx";

const TRACK = "block h-1.5 w-full overflow-hidden bg-surface-raised";
const FILL = "block h-full bg-theme";

const clamped = (percent: number) => Math.min(100, Math.max(0, percent));

export type MeterProps = {
	percent: number;
	label?: string;
	className?: string;
};

export const Meter = ({ percent, label, className }: MeterProps) => (
	<span
		role={label === undefined ? undefined : "progressbar"}
		aria-label={label}
		aria-valuenow={label === undefined ? undefined : Math.round(percent)}
		className={clsx(TRACK, className)}
	>
		<span className={FILL} style={{ width: `${clamped(percent)}%` }} />
	</span>
);
