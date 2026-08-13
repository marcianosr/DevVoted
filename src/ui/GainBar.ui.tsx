import { Meter } from "~/ui/Meter.ui";

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

export const GainBar = ({ from, to, cap, label }: GainBarProps) => (
	<Meter
		cap={cap}
		label={label}
		value={to}
		segments={[
			{ value: from, className: "bg-zinc-500" },
			{
				value: Math.max(0, to - from),
				className: "rounded-r-full bg-viridian",
			},
		]}
	/>
);
