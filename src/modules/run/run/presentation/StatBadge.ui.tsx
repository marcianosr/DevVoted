import type { ReactNode } from "react";
import { Subtitle } from "~/ui/typography/Subtitle.component";

type StatBadgeProps = {
	label: string;
	value: ReactNode;
	valueTone?: "theme" | "gradient" | "muted";
	/** The value before a pending change — renders muted, with an arrow to the
	 * new value in celadon (the configure preview's old → new strip). */
	from?: ReactNode;
};

// A stat's value outranks its own label, so the quiet tone here is the body
// colour rather than the gray the label wears — it used to be dimmer than the
// Subtitle above it, which read as though the number were the caption.
const VALUE_COLOR: Record<NonNullable<StatBadgeProps["valueTone"]>, string> = {
	theme: "text-theme",
	gradient: "text-gradient-green",
	muted: "text-zinc-100",
};

export const StatBadge = ({
	label,
	value,
	valueTone = "theme",
	from,
}: StatBadgeProps) => {
	return (
		<div className="flex flex-col">
			<Subtitle as="p">{label}</Subtitle>
			<span className="text-xl font-extrabold">
				{from != null ? (
					<>
						<span className="text-pewter">{from}</span>
						<span className="text-celadon"> → {value}</span>
					</>
				) : (
					<span className={VALUE_COLOR[valueTone]}>{value}</span>
				)}
			</span>
		</div>
	);
};
