type GatePlace =
	| "pallet"
	| "pewter"
	| "cerulean"
	| "vermilion"
	| "lavender"
	| "celadon"
	| "fuchsia"
	| "saffron"
	| "seafoam"
	| "cinnabar"
	| "viridian"
	| "indigo-elite"
	| "champion";

export type SwatchTheme = `gate-${GatePlace}`;

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
	place: GatePlace,
	finish: SwatchFinish = "flat"
): GateSwatch => ({
	id: `swatch-${place}`,
	gate,
	gateName,
	name: `${gateName} Swatch`,
	theme: `gate-${place}`,
	finish,
});

export const GATE_SWATCHES: Readonly<Record<number, GateSwatch>> = {
	0: swatch(0, "Pallet", "pallet"),
	1: swatch(1, "Pewter", "pewter"),
	2: swatch(2, "Cerulean", "cerulean"),
	3: swatch(3, "Vermilion", "vermilion"),
	4: swatch(4, "Lavender", "lavender"),
	5: swatch(5, "Celadon", "celadon"),
	6: swatch(6, "Fuchsia", "fuchsia"),
	7: swatch(7, "Saffron", "saffron"),
	8: swatch(8, "Seafoam", "seafoam"),
	9: swatch(9, "Cinnabar", "cinnabar"),
	10: swatch(10, "Viridian", "viridian"),
	11: swatch(11, "Indigo Elite", "indigo-elite", "plate"),
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

export const gatesClearedBy = (
	ownedSwatchIds: readonly string[]
): readonly number[] =>
	ALL_SWATCHES.filter((swatch) => ownedSwatchIds.includes(swatch.id)).map(
		(swatch) => swatch.gate
	);
