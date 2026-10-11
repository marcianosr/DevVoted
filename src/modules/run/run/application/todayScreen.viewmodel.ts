import {
	bandOf,
	type CoverageBandId,
} from "~/modules/run/build/domain/coverageRatio.model";
import type { CommunityVoter } from "~/modules/run/community/domain/voter.model";
import { bandAtLadder } from "~/modules/run/gate/domain/gate.model";
import type { GateSwatch } from "~/modules/run/gate/domain/swatch.model";
import { gateSwatchAt } from "~/modules/run/gate/application/swatchTrack.viewmodel";
import { pollLabelFor } from "~/modules/run/run/application/pollScreen.viewmodel";
import { runReadoutFor } from "~/modules/run/run/application/runReadout.viewmodel";
import type { RunView } from "~/modules/run/run/application/runView.viewmodel";
import {
	isPrepPhase,
	type RecordedClose,
} from "~/modules/run/run/domain/run.model";
import {
	roundToOneDecimal,
	SLICE_WINDOW,
} from "~/modules/run/run/domain/rules.model";
import { NEW_POLLS_IN } from "~/shared/lib/copy";
import { type ClockParts, formatClock } from "~/shared/lib/dateUtils";
import { plural } from "~/shared/lib/displayValue";
import type { ClimberProps } from "~/ui/kanto-theme/Climber.ui";
import type { RunReadoutProps } from "~/ui/kanto-theme/RunReadout.ui";

const DIVIDER = " · ";
const PERCENT = "%";
const KB = "KB";

const kbGained = (kb: number): string => `+${kb} ${KB}`;

const START = "Start today’s climb";
const CONTINUE = "Continue to";
const OPENS_IN = "opens in";
const NEW_POLLS = "New polls in";
const DAY_DONE = "Today’s polls are done. Back tomorrow!";
const READY = "ready";

export type TodayClock = {
	readonly isOpen: boolean;
	readonly remaining: string;
	readonly remainingMs: number;
};

const clockLabel = (clock: TodayClock): string => NEW_POLLS_IN(clock.remaining);

const pollsLeftInGate = (view: RunView): number =>
	Math.max(0, view.pollsPerGate - view.answeredThisGate.length);

const isLiveRun = (view: RunView | null): view is RunView =>
	view !== null && !view.isOver;

const pollsLeftFor = (
	view: RunView | null,
	pollsLeftToday: number | null
): number =>
	isLiveRun(view) ? pollsLeftInGate(view) : (pollsLeftToday ?? SLICE_WINDOW);

const isDaySpent = (
	view: RunView | null,
	clock: TodayClock,
	pollsLeftToday: number | null
): boolean => {
	if (clock.isOpen) return false;

	return isLiveRun(view) ? view.pollsExhausted : pollsLeftToday === 0;
};

const isWaiting = (view: RunView, clock: TodayClock): boolean =>
	view.pollsExhausted && !clock.isOpen;

export const startRefusalFor = (
	view: RunView | null,
	clock: TodayClock,
	pollsLeftToday: number | null
): string | undefined =>
	isDaySpent(view, clock, pollsLeftToday) ? clockLabel(clock) : undefined;

export const pollsBadgeFor = (
	view: RunView | null,
	clock: TodayClock,
	pollsLeftToday: number | null
): number | undefined => {
	if (isDaySpent(view, clock, pollsLeftToday)) return undefined;

	const left = pollsLeftFor(view, pollsLeftToday);

	return left > 0 ? left : undefined;
};

const FIRST_GATE = 0;

const standingGateOf = (view: RunView | null): number =>
	isLiveRun(view) ? view.gatesCleared : FIRST_GATE;

export const hubSwatchFor = (view: RunView | null): GateSwatch =>
	gateSwatchAt(standingGateOf(view));

const gateNameOf = (view: RunView | null): string =>
	hubSwatchFor(view).gateName;

const PREP_FIRST = "prep first";
const LEFT_TRAIL = "left · they do not carry to tomorrow";

const isPartAnsweredDay = (view: RunView): boolean =>
	view.pollsLeftToday > 0 && view.pollsLeftToday < view.pollsPerGate;

const readyNoteFor = (view: RunView, pollsLeft: number): string => {
	if (isPrepPhase(view))
		return `${plural(pollsLeft, "poll")} ${READY}${DIVIDER}${PREP_FIRST}`;
	if (isPartAnsweredDay(view))
		return `${pollLabelFor(view)}${DIVIDER}${view.pollsLeftToday} of today’s ${view.pollsPerGate} ${LEFT_TRAIL}`;

	return pollLabelFor(view);
};

const freshNoteFor = (clock: TodayClock, pollsLeft: number): string =>
	`${plural(pollsLeft, "poll")} ${READY}${DIVIDER}${clockLabel(clock)}`;

export type HubMark =
	| { readonly kind: "lock" }
	| { readonly kind: "polls"; readonly count: number };

export type HubHeadline = {
	readonly readout: RunReadoutProps | null;
	readonly title: string;
	readonly clock: ClockParts | null;
	readonly subtext: string;
	readonly mark: HubMark;
};

export const hubHeadlineFor = (
	view: RunView | null,
	clock: TodayClock,
	pollsLeftToday: number | null,
	runNumber: number | null
): HubHeadline => {
	const readout = isLiveRun(view) ? runReadoutFor(view, runNumber) : null;
	const pollsLeft = pollsLeftFor(view, pollsLeftToday);

	if (isDaySpent(view, clock, pollsLeftToday))
		return {
			readout,
			title: isLiveRun(view) ? `${gateNameOf(view)} ${OPENS_IN}` : NEW_POLLS,
			clock: formatClock(clock.remainingMs),
			subtext: DAY_DONE,
			mark: { kind: "lock" },
		};

	return {
		readout,
		title: gateNameOf(view),
		clock: null,
		subtext: isLiveRun(view)
			? readyNoteFor(view, pollsLeft)
			: freshNoteFor(clock, pollsLeft),
		mark: { kind: "polls", count: pollsLeft },
	};
};

const TO_SHOP = "To shop";
const SHOP_SKIPPED = "skipped";

export type HubPressKind = "start" | "resume" | "shop" | "locked";
export type HubPressMark = "shop" | "polls";

export type HubPress = {
	readonly kind: HubPressKind;
	readonly label: string;
	readonly note?: string;
	readonly mark: HubPressMark;
	readonly pollsLeft?: number;
};

const isShopPaying = (view: RunView | null): view is RunView =>
	isLiveRun(view) && view.status === "rewarding";

const shopLeadsFor = (
	view: RunView | null,
	clock: TodayClock,
	pollsLeftToday: number | null
): boolean => isShopPaying(view) && isDaySpent(view, clock, pollsLeftToday);

const shopPressOf = (view: RunView): HubPress => ({
	kind: "shop",
	label: TO_SHOP,
	note: view.shopControls.shopSkipped
		? SHOP_SKIPPED
		: `spend ${view.storage} ${KB}`,
	mark: "shop",
});

const climbLabelOf = (view: RunView | null): string =>
	isLiveRun(view) ? `${CONTINUE} ${gateNameOf(view)}` : START;

const countOrNothing = (count: number): number | undefined =>
	count > 0 ? count : undefined;

export const hubPressFor = (
	view: RunView | null,
	clock: TodayClock,
	pollsLeftToday: number | null
): HubPress => {
	if (isShopPaying(view) && isDaySpent(view, clock, pollsLeftToday))
		return shopPressOf(view);

	const pollsLeft = countOrNothing(pollsLeftFor(view, pollsLeftToday));

	if (isDaySpent(view, clock, pollsLeftToday))
		return { kind: "locked", label: climbLabelOf(view), mark: "polls" };

	return {
		kind: isLiveRun(view) ? "resume" : "start",
		label: climbLabelOf(view),
		mark: "polls",
		pollsLeft,
	};
};

export type HubBand = {
	readonly id: CoverageBandId;
	readonly label: string;
};

export type RunSoFarRow = {
	readonly gate: number;
	readonly swatch: GateSwatch;
	readonly band: HubBand;
	readonly kb: string;
};

export type RunSoFarQuote = {
	readonly band: HubBand;
	readonly kb: string;
	readonly started: boolean;
	readonly share: string;
};

export type RunSoFarNext = {
	readonly gate: number;
	readonly swatch: GateSwatch;
	readonly note: string;
	readonly quote: RunSoFarQuote | null;
};

export type RunSoFar = {
	readonly earned: string;
	readonly rows: readonly RunSoFarRow[];
	readonly next: RunSoFarNext | null;
};

const NEXT = "next";
const OPENS_TOMORROW = "opens tomorrow";

const hubBandOf = (id: CoverageBandId): HubBand => ({
	id,
	label: bandOf(id).label,
});

const lastClosePerGate = (
	closes: readonly RecordedClose[]
): readonly RecordedClose[] =>
	closes.filter(
		(close, index) =>
			!closes.slice(index + 1).some((later) => later.gate === close.gate)
	);

const closedRowOf = (close: RecordedClose): RunSoFarRow => ({
	gate: close.gate,
	swatch: gateSwatchAt(close.gate),
	band: hubBandOf(close.band),
	kb: kbGained(close.kb),
});

const nextQuoteOf = (view: RunView): RunSoFarQuote => {
	const held = view.gateStake.coverageHeld;

	return {
		band: hubBandOf(bandAtLadder(held, view.gateStake.coverageLadder).id),
		kb: kbGained(view.fullClearKb),
		started: view.pollsAnswered > 0,
		share: `${roundToOneDecimal(held)}${PERCENT}`,
	};
};

const nextRowOf = (view: RunView, clock: TodayClock): RunSoFarNext => {
	const waiting = isWaiting(view, clock);

	return {
		gate: view.gatesCleared,
		swatch: gateSwatchAt(view.gatesCleared),
		note: waiting ? OPENS_TOMORROW : NEXT,
		quote: waiting ? null : nextQuoteOf(view),
	};
};

export const runSoFarFor = (
	view: RunView | null,
	clock: TodayClock
): RunSoFar | null => {
	if (view === null) return null;

	const closes = lastClosePerGate(view.closes);

	return {
		earned: kbGained(closes.reduce((total, close) => total + close.kb, 0)),
		rows: closes.map(closedRowOf),
		next: view.isOver ? null : nextRowOf(view, clock),
	};
};

export type HubBuildRow = {
	readonly id: string;
	readonly name: string;
	readonly description: string;
	readonly slots: number;
	readonly version: number;
};

export type HubBuild = {
	readonly rows: readonly HubBuildRow[];
	readonly weight: string;
	readonly held: number;
	readonly free: number;
};

const FIRST_VERSION = 1;

export const hubBuildFor = (view: RunView | null): HubBuild | null =>
	view === null || view.isOver
		? null
		: {
				rows: view.installed.map(({ config, slots }) => ({
					id: config.id,
					name: config.label,
					description: config.description,
					slots,
					version: config.level ?? FIRST_VERSION,
				})),
				weight: `${view.slotsUsed} / ${view.slots}`,
				held: view.slots,
				free: view.buildSpace.freeWeight,
			};

export type HubIncident = {
	readonly id: string;
	readonly code: number;
	readonly name: string;
	readonly cue: string;
	readonly sender: string;
};

const REPLACES_ONE = "it replaces one audit";

export const incomingIncidentsFor = (
	view: RunView | null
): readonly HubIncident[] => {
	if (view === null || view.isOver) return [];

	const cue = `waits at ${gateNameOf(view)}${DIVIDER}${REPLACES_ONE}`;

	return view.audits.flatMap((audit) =>
		audit.sentBy === undefined
			? []
			: [
					{
						id: audit.id,
						code: audit.code,
						name: audit.name,
						cue,
						sender: `@${audit.sentBy.name}`,
					},
				]
	);
};

const TODAY = "today";
const FACES_SHOWN = 10;

export type TodayCommunity = {
	readonly count: number;
	readonly detail: string;
	readonly faces: readonly ClimberProps[];
	readonly overflow: number;
};

const faceOf = (voter: CommunityVoter): ClimberProps => ({
	name: voter.displayName,
	photoUrl: voter.photoUrl ?? undefined,
	borderUrl: voter.borderUrl ?? undefined,
	you: voter.you,
});

export const communityLineFor = (
	players: number | undefined,
	voters: readonly CommunityVoter[] = []
): TodayCommunity | null => {
	if (players === undefined) return null;

	return {
		count: players,
		detail: TODAY,
		faces: voters.slice(0, FACES_SHOWN).map(faceOf),
		overflow: Math.max(0, players - FACES_SHOWN),
	};
};

const SHOP = "Shop";
const SHOP_SHUT = "the shop opens when you clear a gate";
const OPEN_UNTIL_START = "open until you start";

export type TodayShop = {
	readonly label: string;
	readonly open: boolean;
	readonly detail?: string;
	readonly hint?: string;
};

export const shopAsideFor = (
	view: RunView | null,
	clock: TodayClock,
	pollsLeftToday: number | null
): TodayShop | null => {
	if (shopLeadsFor(view, clock, pollsLeftToday)) return null;

	if (!isShopPaying(view))
		return {
			label: SHOP,
			open: false,
			hint: `${SHOP}${DIVIDER}${SHOP_SHUT}`,
		};

	return {
		label: SHOP,
		open: true,
		detail: view.shopControls.shopSkipped ? SHOP_SKIPPED : OPEN_UNTIL_START,
	};
};
