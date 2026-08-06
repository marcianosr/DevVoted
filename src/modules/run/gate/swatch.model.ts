/**
 * Gate swatches: one collectible colour chip per gate, earned by clearing it
 * (ADR-019). Beating the gate is what awards the badge — width is bought
 * separately with coverage and never grants one, the same way a gym badge comes
 * from the leader and not from a bigger bag.
 *
 * Gate 0 is **Pallet**, where every journey starts. Gates 1–8 are the eight
 * gen-1 gym badges in canonical order. Gates 9–10 are the two Kanto landmarks
 * that never had a gym (Lavender Town, the Seafoam Islands), and the climb ends
 * the way the games do: the **Elite** gate at Indigo Plateau, then the
 * **Champion** above it.
 *
 * Colours follow each name's home location in the Kanto palette (Boulder/Pewter
 * City → pewter) and live in app.css under [data-swatch-theme] — never in TS.
 *
 * The summit pair are drawn differently, because the palette runs out: 13 gates
 * against 12 colours, one of which (indigo) is the app background. Elite keeps
 * indigo anyway — it is Indigo Plateau, and a rim makes the dark plate read
 * against the page — while the Champion alone wears the Kanto gradient. Only a
 * `plate`'s *name* has to fall back to plain zinc; indigo text would vanish.
 */
export type SwatchTheme =
	| "pallet"
	| "boulder"
	| "cascade"
	| "thunder"
	| "rainbow"
	| "soul"
	| "marsh"
	| "volcano"
	| "earth"
	| "lavender"
	| "seafoam"
	| "elite"
	| "champion";

/**
 * How a swatch is drawn:
 * - `flat` — its Kanto colour, straight from app.css.
 * - `plate` — its Kanto colour plus a rim, for a colour too dark to read on the
 *   page unaided (indigo). Still themed, so `--theme-color` applies.
 * - `fill` — the Kanto gradient, which has no single colour at all.
 */
export type SwatchFinish = "flat" | "plate" | "fill";

export type GateSwatch = {
	/** Stable id persisted in users.owned_swatch_ids — never rename. */
	readonly id: string;
	/** The gate whose clear awards it. */
	readonly gate: number;
	readonly name: string;
	readonly theme: SwatchTheme;
	readonly finish: SwatchFinish;
};

/**
 * True when the swatch has a `--theme-color` to hand its subtree. Only the
 * gradient has none, so it is also the test for "must not use `text-theme`".
 */
export const hasThemeColor = (swatch: GateSwatch): boolean =>
	swatch.finish !== "fill";

const swatch = (
	gate: number,
	name: string,
	theme: SwatchTheme,
	finish: SwatchFinish = "flat"
): GateSwatch => ({ id: `swatch-${theme}`, gate, name, theme, finish });

export const GATE_SWATCHES: Readonly<Record<number, GateSwatch>> = {
	0: swatch(0, "Pallet Swatch", "pallet"),
	1: swatch(1, "Boulder Swatch", "boulder"),
	2: swatch(2, "Cascade Swatch", "cascade"),
	3: swatch(3, "Thunder Swatch", "thunder"),
	4: swatch(4, "Rainbow Swatch", "rainbow"),
	5: swatch(5, "Soul Swatch", "soul"),
	6: swatch(6, "Marsh Swatch", "marsh"),
	7: swatch(7, "Volcano Swatch", "volcano"),
	8: swatch(8, "Earth Swatch", "earth"),
	9: swatch(9, "Lavender Swatch", "lavender"),
	10: swatch(10, "Seafoam Swatch", "seafoam"),
	11: swatch(11, "Elite Swatch", "elite", "plate"),
	12: swatch(12, "Champion Swatch", "champion", "fill"),
};

export const swatchForGate = (gate: number): GateSwatch | undefined =>
	GATE_SWATCHES[gate];

/**
 * Every swatch in climb order — the collection surface's full roster, and the
 * gate ladder itself: exactly one entry per gate, so its length is `GATE_COUNT`
 * (asserted in the spec, since the roster is the content and `VICTORY_GATE` the
 * rule that must agree with it).
 */
export const ALL_SWATCHES: readonly GateSwatch[] = Object.values(
	GATE_SWATCHES
).sort((a, b) => a.gate - b.gate);

/**
 * The swatches a run has earned: `gatesCleared` counts the gates already beaten,
 * and gates count from 0, so it is exactly the swatches below that number. A
 * fresh run holds none — Pallet is the reward for clearing gate 0.
 */
export const swatchesEarnedAt = (gatesCleared: number): readonly GateSwatch[] =>
	ALL_SWATCHES.filter((swatch) => swatch.gate < gatesCleared);
