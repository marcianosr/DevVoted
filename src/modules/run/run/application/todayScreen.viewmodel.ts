import {
	bandOf,
	type CoverageBandId,
} from "~/modules/run/build/domain/coverageRatio.model";
import type { GateLadder } from "~/modules/run/gate/domain/gate.model";
import { gateSwatchAt } from "~/modules/run/gate/application/swatchTrack.viewmodel";
import { pollLabelFor } from "~/modules/run/run/application/pollScreen.viewmodel";
import type { RunView } from "~/modules/run/run/application/runView.viewmodel";
import {
	roundToOneDecimal,
	SLICE_WINDOW,
} from "~/modules/run/run/domain/rules.model";
import { NEW_POLLS_IN } from "~/shared/lib/copy";
import { plural } from "~/shared/lib/displayValue";

type PollsToday = Pick<RunView, "pollsLeftToday" | "pollsPerGate">;

const DIVIDER = " · ";
const PERCENT = "%";

const READY_TRAIL = "are ready";
const DONE_TRAIL = "are answered";
const LEFT_TRAIL = "left · they do not carry to tomorrow";

const todays = (words: string): string => `today’s ${words}`;

export const pollsNoteFor = (view: PollsToday): string => {
	const { pollsLeftToday, pollsPerGate } = view;
	const wholeDay = todays(plural(pollsPerGate, "poll"));

	if (pollsLeftToday >= pollsPerGate) return `${wholeDay} ${READY_TRAIL}`;
	if (pollsLeftToday <= 0) return `${wholeDay} ${DONE_TRAIL}`;

	return `${pollsLeftToday} of ${todays(String(pollsPerGate))} ${LEFT_TRAIL}`;
};

const START = "Start today’s climb";
const RESUME = "Resume";

export type TodayClock = {
	readonly isOpen: boolean;
	readonly remaining: string;
};

const clockLabel = (clock: TodayClock): string => NEW_POLLS_IN(clock.remaining);

export type TodayPressKind = "start" | "resume" | "locked";

export type TodayPress = {
	readonly kind: TodayPressKind;
	readonly label: string;
	readonly note: string;
	readonly pollsLeft: number;
};

const pollsLeftInGate = (view: RunView): number =>
	Math.max(0, view.pollsPerGate - view.answeredThisGate.length);

const pollsLeftFor = (view: RunView | null): number =>
	view === null ? SLICE_WINDOW : pollsLeftInGate(view);

const noPollsLeftToday = (view: RunView | null, clock: TodayClock): boolean =>
	view !== null && view.pollsExhausted && !clock.isOpen;

export const pollsBadgeFor = (
	view: RunView | null,
	clock: TodayClock
): number | undefined => {
	if (noPollsLeftToday(view, clock)) return undefined;

	const left = pollsLeftFor(view);

	return left > 0 ? left : undefined;
};

export const todayPressFor = (
	view: RunView | null,
	clock: TodayClock
): TodayPress => {
	const pollsLeft = pollsLeftFor(view);

	if (view === null || view.isOver)
		return { kind: "start", label: START, note: clockLabel(clock), pollsLeft };

	if (view.pollsExhausted && !clock.isOpen)
		return {
			kind: "locked",
			label: clockLabel(clock),
			note: pollLabelFor(view),
			pollsLeft,
		};

	return {
		kind: "resume",
		label: `${RESUME} ${gateSwatchAt(view.gatesCleared).gateName}`,
		note: `${pollLabelFor(view)}${DIVIDER}${clockLabel(clock)}`,
		pollsLeft,
	};
};

const GATE_WORD = "gate";
const OF = "of";
const KB = "KB";
const STORED = "stored";
const BANKED = "banked";

export const standingFor = (view: RunView): string =>
	[
		`${GATE_WORD} ${view.gatesCleared} ${OF} ${view.victoryGate}`,
		`${view.storage} ${KB} ${view.isOver ? BANKED : STORED}`,
		pollsNoteFor(view),
	].join(DIVIDER);

export type TodayRung = {
	readonly band: CoverageBandId;
	readonly label: string;
	readonly at: string;
};

const rungFor = (band: CoverageBandId, percent: number): TodayRung => ({
	band,
	label: bandOf(band).label,
	at: `${roundToOneDecimal(percent)}${PERCENT}`,
});

export const rungsFor = ({ ok, healthy }: GateLadder): readonly TodayRung[] => [
	rungFor("ok", ok),
	rungFor("healthy", healthy),
];

export type TodayCoverage = {
	readonly held: number;
	readonly demand: number;
	readonly rungs: readonly TodayRung[];
};

export const coverageReadingFor = (
	view: RunView | null
): TodayCoverage | null => {
	if (view === null || view.isOver) return null;

	const { coverageHeld, coverageLadder } = view.gateStake;

	return {
		held: coverageHeld,
		demand: coverageLadder.healthy,
		rungs: rungsFor(coverageLadder),
	};
};

const PLAYER = "player";
const PLAYERS = "players";
const ANSWERED_TODAY = "answered today";

export type TodayCommunity = {
	readonly count: number;
	readonly detail: string;
};

export const communityLineFor = (
	players: number | undefined
): TodayCommunity | null => {
	if (players === undefined) return null;

	return {
		count: players,
		detail: `${players === 1 ? PLAYER : PLAYERS} ${ANSWERED_TODAY}`,
	};
};

const SHOP = "Shop";
const SHOP_SHUT = "the shop opens when you clear a gate";

export type TodayShop = {
	readonly label: string;
	readonly open: boolean;
	readonly hint?: string;
};

export const shopAsideFor = (view: RunView | null): TodayShop => {
	if (view?.status === "rewarding") return { label: SHOP, open: true };

	return { label: SHOP, open: false, hint: `${SHOP}${DIVIDER}${SHOP_SHUT}` };
};
