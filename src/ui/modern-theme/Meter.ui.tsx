const TRACK = "flex h-2 w-full overflow-hidden rounded-full bg-zinc-800";
const HELD = "h-full bg-theme";

// The projected slice is the same colour at reduced opacity rather than a second
// token: it has to read as "more of this", not as a different quantity.
const PROJECTED = "h-full bg-theme opacity-40";

export type MeterProps = {
	held: number;
	projected?: number;
	max: number;
	label: string;
};

const percent = (value: number, max: number) =>
	`${Math.min(100, Math.max(0, (value / max) * 100))}%`;

export const Meter = ({ held, projected = 0, max, label }: MeterProps) => (
	<div
		role="progressbar"
		aria-label={label}
		aria-valuenow={held}
		aria-valuemin={0}
		aria-valuemax={max}
		className={TRACK}
	>
		<span className={HELD} style={{ width: percent(held, max) }} />
		<span
			className={PROJECTED}
			style={{ width: percent(Math.min(projected, max - held), max) }}
		/>
	</div>
);
