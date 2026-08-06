import { clsx } from "clsx";

import type { SwatchFinish } from "~/modules/run/gate/swatch.model";
import { Swatch } from "./Swatch.component";

type SwatchMarkSize = "sm" | "md" | "lg";

type SwatchMarkProps = {
	finish: SwatchFinish;
	size?: SwatchMarkSize;
};

const MARK_SIZE: Record<SwatchMarkSize, string> = {
	sm: "h-3 w-3",
	md: "h-3.5 w-3.5",
	lg: "h-6 w-6",
};

/**
 * A swatch's colour chip in whichever finish it wears. `flat` and `plate` both
 * read their colour from the enclosing `data-swatch-theme`; the plate adds a rim
 * so indigo does not disappear into the page. `fill` carries the Kanto gradient,
 * which belongs to no single colour. One home for that mapping, since the chip
 * shows up in the collection strip, the HUD's pip popovers, and the gate reward
 * report alike.
 */
export const SwatchMark = ({ finish, size = "md" }: SwatchMarkProps) => {
	if (finish === "flat") return <Swatch size={size} />;
	return (
		<span
			data-testid="swatch-mark"
			className={clsx(
				"inline-block shrink-0 rounded",
				MARK_SIZE[size],
				finish === "plate" ? "bg-theme ring-1 ring-pewter" : "bg-legendary"
			)}
		/>
	);
};

/**
 * How a swatch's *name* must be coloured. A plate's colour is too dark to read
 * as text and the gradient has no colour at all, so both fall back to zinc.
 */
export const swatchNameClass = (finish: SwatchFinish): string =>
	finish === "flat" ? "text-theme" : "text-zinc-100";

/** The border a chip wrapping this swatch should wear, by the same logic. */
export const swatchBorderClass = (finish: SwatchFinish): string => {
	if (finish === "flat") return "border-theme";
	return finish === "plate"
		? "border-pewter"
		: "border-transparent legendary-ring";
};
