import { GATE_COUNT, SLICE_WINDOW } from "../rules.model";

/**
 * The climb map's geometry (DVTD-6l80).
 *
 * Everything the map draws — a climber, a fallen run, your best, the edge of
 * charted ground — is a different kind of thing, and none of them can be compared
 * until they share a unit. That unit is **polls**: one axis running 0 to
 * `GATE_COUNT * SLICE_WINDOW`, on which "2 polls past your best" is subtraction
 * rather than a special case.
 *
 * The map always draws the whole ladder; a screen too narrow for it scrolls
 * rather than paging, so there is no window to be inside or outside of and every
 * marker has a place on the track.
 */

/** A place on the climb: which gate, and how deep into its poll window. */
export type ClimbMarker = {
	readonly gate: number;
	readonly pollsIntoGate: number;
};

/** The whole ladder, in polls — the map's right-hand edge. */
export const TRACK_LENGTH = GATE_COUNT * SLICE_WINDOW;

export const trackPosition = ({ gate, pollsIntoGate }: ClimbMarker): number =>
	gate * SLICE_WINDOW + pollsIntoGate;

/** Where a position sits along the track, as a percentage of the full ladder. */
export const positionPercent = (position: number): number =>
	(position / TRACK_LENGTH) * 100;

/** The percentage at which a gate's stretch of track begins. */
export const gateStartPercent = (gate: number): number =>
	positionPercent(gate * SLICE_WINDOW);
