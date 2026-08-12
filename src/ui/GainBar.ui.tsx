/**
 * The HUD storage bar's general-purpose sibling: a slim rounded track whose
 * fill splits into an already-held stretch (muted) and a gain segment (green)
 * toward a cap. The gate report draws its storage payout with it (from =
 * pre-gate storage); a locked slot draws unlock progress (from = 0, so the
 * whole fill reads as gain).
 */
type GainBarProps = {
	from: number;
	to: number;
	cap: number;
	/** Spoken name for the progressbar — "storage", "coverage toward slot 4". */
	label: string;
};

const percentOf = (value: number, cap: number): number =>
	cap <= 0 ? 0 : Math.max(0, Math.min(100, (value / cap) * 100));

export const GainBar = ({ from, to, cap, label }: GainBarProps) => (
	<span
		role="progressbar"
		aria-label={label}
		aria-valuenow={to}
		aria-valuemin={0}
		aria-valuemax={cap}
		className="flex h-1.5 w-full overflow-hidden rounded-full bg-zinc-800"
	>
		<span
			className="block h-full bg-zinc-500"
			style={{ width: `${percentOf(from, cap)}%` }}
		/>
		<span
			className="block h-full rounded-r-full bg-viridian"
			style={{ width: `${percentOf(Math.max(0, to - from), cap)}%` }}
		/>
	</span>
);
