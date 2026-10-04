const TRACK = "h-1 w-full overflow-hidden rounded-full bg-theme-raised";
const FILL = "block h-full rounded-full bg-theme";

const FULL_PERCENT = 100;

const shareOf = (value: number, max: number) =>
	max <= 0
		? FULL_PERCENT
		: Math.min(FULL_PERCENT, (value / max) * FULL_PERCENT);

export type MeterProps = { value: number; max: number };

export const Meter = ({ value, max }: MeterProps) => (
	<div aria-hidden className={TRACK}>
		<span style={{ width: `${shareOf(value, max)}%` }} className={FILL} />
	</div>
);
