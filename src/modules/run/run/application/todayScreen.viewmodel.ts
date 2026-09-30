import {
	bandFor,
	bandOf,
	type CoverageBandId,
	ratioOf,
} from "~/modules/run/build/domain/coverageRatio.model";
import type { GateSwatch } from "~/modules/run/gate/domain/swatch.model";
import {
	gateSwatchAt,
	swatchTrackFor,
} from "~/modules/run/gate/application/swatchTrack.viewmodel";
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
import { plural } from "~/shared/lib/displayValue";
import type { RunReadoutProps } from "~/ui/kanto-theme/RunReadout.ui";
import type { SwatchFill } from "~/ui/kanto-theme/Swatch.ui";

const DIVIDER = " · ";
const PERCENT = "%";
const KB = "KB";

const kbGained = (kb: number): string => `+${kb} ${KB}`;

const START = "Start today’s climb";
const CONTINUE = "Continue to";

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

const gateNameOf = (view: RunView): string =>
	gateSwatchAt(view.gatesCleared).gateName;

const PREP_FIRST = "prep first";
const DAY_DONE = "today’s polls are done · come back tomorrow";

const LEFT_TRAIL = "left · they do not carry to tomorrow";

const isPartAnsweredDay = (view: RunView): boolean =>
	view.pollsLeftToday > 0 && view.pollsLeftToday < view.pollsPerGate;

const readyNoteFor = (view: RunView, pollsLeft: number): string => {
	if (isPrepPhase(view))
		return `${plural(pollsLeft, "poll")} ready${DIVIDER}${PREP_FIRST}`;
	if (isPartAnsweredDay(view))
		return `${pollLabelFor(view)}${DIVIDER}${view.pollsLeftToday} of today’s ${view.pollsPerGate} ${LEFT_TRAIL}`;

	return pollLabelFor(view);
};

const isWaiting = (view: RunView, clock: TodayClock): boolean =>
	view.pollsExhausted && !clock.isOpen;

export const todayPressFor = (
	view: RunView | null,
	clock: TodayClock
): TodayPress => {
	const pollsLeft = pollsLeftFor(view);

	if (view === null || view.isOver)
		return { kind: "start", label: START, note: clockLabel(clock), pollsLeft };

	if (isWaiting(view, clock))
		return {
			kind: "locked",
			label: `${gateNameOf(view)} opens in ${clock.remaining}`,
			note: DAY_DONE,
			pollsLeft,
		};

	return {
		kind: "resume",
		label: `${CONTINUE} ${gateNameOf(view)}`,
		note: readyNoteFor(view, pollsLeft),
		pollsLeft,
	};
};

export type HubStrip = RunReadoutProps & {
	readonly swatches: readonly SwatchFill[];
	readonly storage: number;
};

export const hubStripFor = (
	view: RunView | null,
	runNumber: number | null
): HubStrip | null =>
	view === null
		? null
		: {
				...runReadoutFor(view, runNumber),
				swatches: swatchTrackFor(view.swatchGates, view.gatesCleared),
				storage: view.storage,
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

export type RunSoFarNext = RunSoFarRow & {
	readonly share: string;
};

export type RunSoFar = {
	readonly banked: string;
	readonly rows: readonly RunSoFarRow[];
	readonly next: RunSoFarNext | null;
};

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

const nextRowOf = (view: RunView): RunSoFarNext => {
	const held = view.gateStake.coverageHeld;

	return {
		gate: view.gatesCleared,
		swatch: gateSwatchAt(view.gatesCleared),
		band: hubBandOf(bandFor(ratioOf(held), view.gatesCleared).id),
		share: `${roundToOneDecimal(held)}${PERCENT}`,
		kb: kbGained(view.fullClearKb),
	};
};

export const runSoFarFor = (view: RunView | null): RunSoFar | null => {
	if (view === null) return null;

	const closes = lastClosePerGate(view.closes);

	return {
		banked: kbGained(closes.reduce((total, close) => total + close.kb, 0)),
		rows: closes.map(closedRowOf),
		next: view.isOver ? null : nextRowOf(view),
	};
};

export type HubBuildRow = {
	readonly id: string;
	readonly name: string;
	readonly slots: number;
	readonly version: number;
};

export type HubBuild = {
	readonly rows: readonly HubBuildRow[];
	readonly weight: string;
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
					slots,
					version: config.level ?? FIRST_VERSION,
				})),
				weight: `${view.slotsUsed} / ${view.slots}`,
				free: view.slotsFree,
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

const PLAYER = "player";
const PLAYERS = "players";
const ANSWERED_TODAY = "answered today";

export type TodayCommunity = {
	readonly count: number;
	readonly detail: string;
	readonly ahead: number | null;
	readonly aheadDetail: string | null;
};

export type ClimberAt = {
	readonly gate: number;
	readonly you: boolean;
};

export const climbersAtOrPast = (
	climbers: readonly ClimberAt[],
	gate: number
): number =>
	climbers.filter((climber) => !climber.you && climber.gate >= gate).length;

export const communityLineFor = (
	players: number | undefined,
	ahead?: { readonly count: number; readonly gate: number }
): TodayCommunity | null => {
	if (players === undefined) return null;

	return {
		count: players,
		detail: `${players === 1 ? PLAYER : PLAYERS} ${ANSWERED_TODAY}`,
		ahead: ahead?.count ?? null,
		aheadDetail:
			ahead === undefined
				? null
				: `at ${gateSwatchAt(ahead.gate).gateName} or ahead`,
	};
};

const SHOP = "Shop";
const SHOP_SHUT = "the shop opens when you clear a gate";
const OPEN_UNTIL_START = "open until you start";

export type TodayShop = {
	readonly label: string;
	readonly open: boolean;
	readonly detail?: string;
	readonly highlighted: boolean;
	readonly hint?: string;
};

export const shopAsideFor = (
	view: RunView | null,
	clock: TodayClock
): TodayShop => {
	if (view?.status !== "rewarding")
		return {
			label: SHOP,
			open: false,
			highlighted: false,
			hint: `${SHOP}${DIVIDER}${SHOP_SHUT}`,
		};

	if (isWaiting(view, clock))
		return {
			label: SHOP,
			open: true,
			detail: `spend ${view.storage} ${KB}`,
			highlighted: true,
		};

	return {
		label: SHOP,
		open: true,
		detail: OPEN_UNTIL_START,
		highlighted: false,
	};
};
