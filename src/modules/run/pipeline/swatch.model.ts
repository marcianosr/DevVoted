import {
	BASE_SLOTS,
	coverageToAddSlot,
	slotsRequiredForGate,
} from "./pipeline.model";

/**
 * Slot swatches: one collectible colour chip per slot that opens a gate
 * (ADR-018). Slot 3 is **Pallet** — the last of the three you start with, so it
 * is free and held from the first moment, the way every journey starts in Pallet
 * Town. Slots 4–11 are the eight gen-1 gym badges in canonical order; slots
 * 12–13 are the two Kanto landmarks that never had a gym (Lavender Town, the
 * Seafoam Islands), which is what stretches the ladder to cover all 12 gates;
 * slot 14 is the Elite Four finale.
 *
 * Colors follow each name's home location in the Kanto palette (Boulder/Pewter
 * City → pewter) and live in app.css under [data-swatch-theme] — never in TS.
 * The Elite Four wears the legendary gradient instead of a flat color, since
 * indigo (its palette match, for Indigo Plateau) is the app background.
 *
 * Coverage thresholds are NOT duplicated here — pipeline.model's ladder stays
 * the single, live-tuned source of truth (ADR-008).
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
	| "elite-four";

export type SlotSwatch = {
	/** Stable id persisted in users.owned_swatch_ids — never rename. */
	readonly id: string;
	readonly slot: number;
	readonly name: string;
	readonly theme: SwatchTheme;
	readonly legendary: boolean;
};

const swatch = (
	slot: number,
	name: string,
	theme: SwatchTheme,
	legendary = false
): SlotSwatch => ({ id: `swatch-${theme}`, slot, name, theme, legendary });

export const SLOT_SWATCHES: Readonly<Record<number, SlotSwatch>> = {
	3: swatch(3, "Pallet Swatch", "pallet"),
	4: swatch(4, "Boulder Swatch", "boulder"),
	5: swatch(5, "Cascade Swatch", "cascade"),
	6: swatch(6, "Thunder Swatch", "thunder"),
	7: swatch(7, "Rainbow Swatch", "rainbow"),
	8: swatch(8, "Soul Swatch", "soul"),
	9: swatch(9, "Marsh Swatch", "marsh"),
	10: swatch(10, "Volcano Swatch", "volcano"),
	11: swatch(11, "Earth Swatch", "earth"),
	12: swatch(12, "Lavender Swatch", "lavender"),
	13: swatch(13, "Seafoam Swatch", "seafoam"),
	14: swatch(14, "Elite Four Swatch", "elite-four", true),
};

export const swatchForSlot = (slot: number): SlotSwatch | undefined =>
	SLOT_SWATCHES[slot];

/** Every swatch in ladder order — the collection surface's full roster. */
export const ALL_SWATCHES: readonly SlotSwatch[] = Object.values(
	SLOT_SWATCHES
).sort((a, b) => a.slot - b.slot);

/**
 * The swatches a pipeline of this width has earned: widening to slot N earns
 * every swatch up to N, so the run's own width is the receipt. A fresh run
 * already holds Pallet, its third starting slot.
 */
export const swatchesEarnedAt = (slots: number): readonly SlotSwatch[] =>
	ALL_SWATCHES.filter((swatch) => swatch.slot <= slots);

/**
 * The gate a slot opens — the inverse of `slotsRequiredForGate`. The base slot
 * opens gate 0, slot 4 opens gate 1, and the last slot opens the summit.
 */
export const gateOpenedBySlot = (slot: number): number => slot - BASE_SLOTS;

export type GateRung = {
	readonly gate: number;
	/** The swatch whose slot opens this gate; absent for gate 1 (base width). */
	readonly swatch?: SlotSwatch;
	/** Total coverage the gate's slot demands; absent for gate 1. */
	readonly coverageRequired?: number;
};

/**
 * The whole climb as a ladder of rungs — gate, the swatch that opens it, and the
 * coverage that swatch costs. Feeds the HUD's hover map, so a player can see
 * what the rest of the run will ask for without leaving the poll they are on.
 * Takes the final gate's number and yields gates 0…final inclusive.
 */
export const gateLadderRungs = (finalGate: number): readonly GateRung[] =>
	Array.from({ length: Math.max(0, finalGate + 1) }, (_, index) => {
		const gate = index;
		const swatch = swatchForSlot(slotsRequiredForGate(gate));
		if (!swatch) return { gate };
		// The base slots come with the run, so their rung has no price.
		if (swatch.slot <= BASE_SLOTS) return { gate, swatch };
		return {
			gate,
			swatch,
			coverageRequired: coverageToAddSlot(swatch.slot - 1),
		};
	});
