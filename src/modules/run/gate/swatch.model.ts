/**
 * Gate swatches: one collectible colour chip per gate, earned by clearing it
 * (ADR-019). Beating the gate is what awards the badge — width is bought
 * separately with coverage and never grants one, the same way a gym badge comes
 * from the leader and not from a bigger bag.
 *
 * Gate 0 is **Pallet**, where every journey starts, and the climb ends the way
 * the games do: the **Elite** gate at Indigo Plateau, then the **Champion**
 * above it. Between them the eight gen-1 gym badges run in strict trainer-card
 * order, and the two Kanto landmarks that never had a gym sit where the games
 * actually walk you through them: **Lavender** at gate 4 (out of Rock Tunnel
 * after Vermilion, before Celadon) and **Seafoam** at gate 8 (Route 20, between
 * Fuchsia/Saffron and Cinnabar).
 *
 * They used to be appended after all eight badges, at gates 9–10, which put two
 * mid-game landmarks one step from the Elite Four and spent the palette's two
 * palest colours on the deepest gates — the run visibly cooled off exactly where
 * it should have been closing in. Interleaved, the summit approach reads
 * cinnabar → viridian → indigo instead.
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
	/**
	 * The name the gate and its badge share: "Pallet" is both the Pallet gate and
	 * the Pallet Swatch. One source, so the two can never drift apart.
	 */
	readonly gateName: string;
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
	gateName: string,
	theme: SwatchTheme,
	finish: SwatchFinish = "flat"
): GateSwatch => ({
	id: `swatch-${theme}`,
	gate,
	gateName,
	name: `${gateName} Swatch`,
	theme,
	finish,
});

export const GATE_SWATCHES: Readonly<Record<number, GateSwatch>> = {
	0: swatch(0, "Pallet", "pallet"),
	1: swatch(1, "Boulder", "boulder"),
	2: swatch(2, "Cascade", "cascade"),
	3: swatch(3, "Thunder", "thunder"),
	4: swatch(4, "Lavender", "lavender"),
	5: swatch(5, "Rainbow", "rainbow"),
	6: swatch(6, "Soul", "soul"),
	7: swatch(7, "Marsh", "marsh"),
	8: swatch(8, "Seafoam", "seafoam"),
	9: swatch(9, "Volcano", "volcano"),
	10: swatch(10, "Earth", "earth"),
	11: swatch(11, "Elite", "elite", "plate"),
	12: swatch(12, "Champion", "champion", "fill"),
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
