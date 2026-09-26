import type { CSSProperties } from "react";

const COUNT = "figure-count tabular-nums";
const READER_ONLY = "sr-only";

type CountStyle = CSSProperties & Record<"--figure-count", number>;

const countStyle = (value: number): CountStyle => ({ "--figure-count": value });

export type CountedFigureProps = {
	/** The figure now. Changing it tweens the digits from whatever they read. */
	value: number;
	/** What the figure counts, stated after it — "KB", "units". */
	unit?: string;
};

/**
 * A figure that moves while the player watches, with no JS: the value rides a
 * registered custom property and `counter()` reads it back, so the digits tween
 * on every render that changes it (see `.figure-count` in app.css).
 *
 * The digits live in a `::after`, which a screen reader cannot be relied on to
 * announce, so the settled figure is stated once more out of sight.
 */
export const CountedFigure = ({ value, unit }: CountedFigureProps) => (
	<>
		<span aria-hidden className={COUNT} style={countStyle(value)} />
		<span className={READER_ONLY}>{value}</span>
		{unit === undefined ? null : <span>&nbsp;{unit}</span>}
	</>
);
