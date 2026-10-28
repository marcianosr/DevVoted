import { differenceInCalendarDays } from "date-fns";

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

export const RESTING_AFTER_DAYS = 3;

const localMidnight = (date: string): Date => new Date(`${date}T00:00:00`);

export const idleDaysOf = (lastPlayedOn: string, today: string): number =>
	Math.max(
		0,
		differenceInCalendarDays(localMidnight(today), localMidnight(lastPlayedOn))
	);

export const isResting = (idleDays: number): boolean =>
	idleDays >= RESTING_AFTER_DAYS;

export const isRestingClimber = (climber: { idleDays?: number }): boolean =>
	climber.idleDays !== undefined && isResting(climber.idleDays);
