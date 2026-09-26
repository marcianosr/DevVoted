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

export type SwatchFinish = "flat" | "plate" | "fill";

export type GateSwatch = {
	readonly id: string;
	readonly gate: number;
	readonly gateName: string;
	readonly name: string;
	readonly theme: SwatchTheme;
	readonly finish: SwatchFinish;
};

export const hasThemeColor = (swatch: GateSwatch): boolean =>
	swatch.finish !== "fill";

export const themeColorOf = (
	swatch: Pick<GateSwatch, "theme" | "finish">
): SwatchTheme | undefined =>
	swatch.finish === "fill" ? undefined : swatch.theme;

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

export const ALL_SWATCHES: readonly GateSwatch[] = Object.values(
	GATE_SWATCHES
).sort((a, b) => a.gate - b.gate);

export const swatchesEarnedFrom = (
	gates: readonly number[]
): readonly GateSwatch[] =>
	ALL_SWATCHES.filter((swatch) => gates.includes(swatch.gate));
