import { GATE_COUNT, SLICE_WINDOW } from "~/modules/run/run/domain/rules.model";

export type ClimbMarker = {
	readonly gate: number;
	readonly pollsIntoGate: number;
};

export const TRACK_LENGTH = GATE_COUNT * SLICE_WINDOW;

export const trackPosition = ({ gate, pollsIntoGate }: ClimbMarker): number =>
	gate * SLICE_WINDOW + pollsIntoGate;

export const gateOf = (position: number): number =>
	Math.min(GATE_COUNT - 1, Math.floor(position / SLICE_WINDOW));

export const positionPercent = (position: number): number =>
	(position / TRACK_LENGTH) * 100;

export const gateStartPercent = (gate: number): number =>
	positionPercent(gate * SLICE_WINDOW);
