import {
	COMMUNITY,
	NEW,
	NOTHING_NEW,
	STORAGE_BALANCE,
} from "~/shared/lib/copy";
import { plural } from "~/shared/lib/displayValue";
import { type Config, slotsOf } from "~/modules/run/config/domain/config.model";
import { settledFactsFor } from "~/modules/run/config/application/configChip.viewmodel";
import {
	gateSwatchAt,
	swatchTrackFor,
} from "~/modules/run/gate/application/swatchTrack.viewmodel";
import { swatchesEarnedFrom } from "~/modules/run/gate/domain/swatch.model";
import { stakeBarFor } from "~/modules/run/run/application/gateStake.viewmodel";
import { runPaidFor } from "~/modules/run/run/application/pollScreen.viewmodel";
import { fundsOf } from "~/modules/run/run/application/prepScreen.viewmodel";
import type { RunView } from "~/modules/run/run/application/runView.viewmodel";
import {
	type UnlockLine,
	unlockLinesFor,
} from "~/modules/run/run/application/unlockNotes.viewmodel";
import type { AnsweredPoll } from "~/modules/run/run/domain/runPoll.model";
import {
	roundToOneDecimal,
	bankedKb,
	unbankedKb,
} from "~/modules/run/run/domain/rules.model";
import { CATEGORY_METADATA, type CategoryCode } from "~/shared/lib/categories";
import { kbLabel, signedKbLabel } from "~/shared/lib/storage";

import type { KantoColor } from "~/ui/kanto-theme/colors";
import type { ConfigChipProps } from "~/ui/kanto-theme/ConfigChip.ui";
import {
	COVERAGE_BAND_COLOR,
	type CoverageBarProps,
} from "~/ui/kanto-theme/CoverageBar.ui";
import type {
	PollScoreRow,
	PollScoresProps,
} from "~/ui/kanto-theme/PollScores.ui";
import type { SwatchFill } from "~/ui/kanto-theme/Swatch.ui";
import type {
	RunOverCategory,
	RunOverScreenProps,
	RunOverStorageRow,
	RunOverUnlock,
} from "~/ui/kanto-theme/RunOverScreen.ui";

const noop = () => {};

export const RUN_OVER_TITLE = "Run over";
export const SUMMIT_TITLE = "The climb is done";
export const NEW_RUN_LABEL = "Start new run";
export const COMMUNITY_LABEL = COMMUNITY;

const NO_RETRY = "no retry, no peel";
const HELD_WORD = "held";
const EVERY_GATE = "every gate held";
const BANKED_TRAIL = "banked into your archive";
const FRESH_HAND = "a new run deals a fresh hand and starts at gate 0";

const BEST_TAG = "best";
const LEAK_TAG = "leak";
const NO_PAYING_GATE = "no gate paid";
const BEST_WAS = "best was";

const FINAL_COVERAGE = "final coverage";
const HELD_AT_CLOSE = "held at the close";

const A_GATE = "a gate";
const NO_UPKEEP = "The run never paid upkeep.";
const NEVER_PAID = "never paid for itself";
const STAYED_EMPTY = "stayed empty";
const OFF_THE_BILL = "a gate off the bill";
const BARE_BUILD = "The run ended with nothing installed.";

const ARCHIVED_ROW = "archived this run";
const ARCHIVE_AFTER_ROW = "archive after the run";
const LOST_ROW = "run balance, lost";

const INSTALLABLE = "Able to install in future builds";
const SWATCH_ROW_BADGE = "kept";
const UNLOCK_ROW_BADGE = "registered";
const SPENT_ROW_BADGE = "gone";
const SPENT_ROW_LABEL = "The build and the run balance";
const ON_PROFILE = "on your profile";

const GAIN_COLOR: KantoColor = "viridian";
const LOSS_COLOR: KantoColor = "cinnabar";
const TERM_COLOR: KantoColor = "saffron";

const LEAK_SHARE = 0.5;

const PERCENT = "%";
const SEPARATOR = " · ";

export type RunOverFrame = {
	readonly gate: number;
	readonly won: boolean;
	readonly answers: readonly AnsweredPoll[];
	readonly payouts: PollScoresProps;
	readonly bar: CoverageBarProps;
	readonly swatchGates: readonly number[];
	readonly configs: readonly Config[];
	readonly weight: number;
	readonly freeWeight: number;
	readonly emptyCreditKb: number;
	readonly upkeepKb: number;
	readonly balanceKb: number;
	readonly upkeepPaidKb: number;
	readonly archiveAfterKb?: number;
	readonly unlocked: readonly UnlockLine[];
};

const weightLabel = (weight: number) => `${weight} weight`;

const swatchCount = (count: number) =>
	`${count} ${count === 1 ? "swatch" : "swatches"}`;

const pct = (value: number) => `${roundToOneDecimal(value)}${PERCENT}`;

const lineOf = (frame: RunOverFrame) =>
	frame.won ? frame.bar.healthy : frame.bar.floor;

const subtitleOf = (frame: RunOverFrame): string => {
	const line = `${pct(frame.bar.held)} against a line of ${pct(lineOf(frame))}`;

	if (frame.won) return [EVERY_GATE, line].join(SEPARATOR);

	return [
		`${gateSwatchAt(frame.gate).gateName} ${HELD_WORD}`,
		line,
		NO_RETRY,
	].join(SEPARATOR);
};

const coverageNoteOf = (frame: RunOverFrame): string => {
	const line = lineOf(frame);
	const short = roundToOneDecimal(line - frame.bar.held);
	const name = gateSwatchAt(frame.gate).gateName;

	if (short <= 0)
		return `${pct(frame.bar.held)} held against a ${pct(line)} line at ${name}.`;

	return `${pct(short)} short of the ${pct(line)} line at ${name}.`;
};

const totalOf = (row: PollScoreRow): number => Number(row.payouts?.total ?? 0);

const NO_BEST = -1;

const bestIndexOf = (rows: readonly PollScoreRow[]): number =>
	rows.reduce(
		(leader, row, index) =>
			totalOf(row) > 0 &&
			(leader === NO_BEST || totalOf(row) > totalOf(rows[leader]))
				? index
				: leader,
		NO_BEST
	);

const gatesOf = (frame: RunOverFrame) => {
	const best = bestIndexOf(frame.payouts.rows);

	const rows = frame.payouts.rows.map((row, index) => ({
		...row,
		label: gateSwatchAt(index).gateName,
		...(row.payouts === undefined
			? {}
			: {
					payouts: {
						...row.payouts,
						total: `${row.payouts.total} of ${row.polls}`,
					},
				}),
		...(index === best ? { tag: { label: BEST_TAG } } : {}),
	}));

	return {
		meta:
			best === NO_BEST
				? NO_PAYING_GATE
				: `${BEST_WAS} ${gateSwatchAt(best).gateName}`,
		payouts: { rows },
		total: {
			score: FINAL_COVERAGE,
			badge: {
				label: pct(frame.bar.held),
				color: COVERAGE_BAND_COLOR[frame.bar.band],
			},
		},
	};
};

type CategoryTally = { code: CategoryCode; correct: number; seen: number };

const tallyCategories = (
	answers: readonly AnsweredPoll[]
): readonly CategoryTally[] => {
	const counts = new Map<CategoryCode, { correct: number; seen: number }>();

	for (const answer of answers) {
		const tally = counts.get(answer.category) ?? { correct: 0, seen: 0 };
		counts.set(answer.category, {
			correct: tally.correct + (answer.outcome === "correct" ? 1 : 0),
			seen: tally.seen + 1,
		});
	}

	return [...counts.entries()]
		.map(([code, tally]) => ({ code, ...tally }))
		.sort((one, other) => other.correct / other.seen - one.correct / one.seen);
};

const tagFor = (
	tally: CategoryTally,
	index: number,
	last: number
): RunOverCategory["tag"] => {
	if (last === 0) return undefined;
	if (index === last && tally.correct / tally.seen < LEAK_SHARE)
		return { label: LEAK_TAG, color: LOSS_COLOR };
	if (index === 0 && tally.correct > 0) return { label: BEST_TAG };
	return undefined;
};

const categoryRowsOf = (
	tallies: readonly CategoryTally[]
): readonly RunOverCategory[] => {
	const last = tallies.length - 1;

	return tallies.map((tally, index) => {
		const tag = tagFor(tally, index, last);

		return {
			name: CATEGORY_METADATA[tally.code].name,
			correct: tally.correct,
			seen: tally.seen,
			score: `${tally.correct}/${tally.seen}`,
			theme: tag?.label === LEAK_TAG ? LOSS_COLOR : GAIN_COLOR,
			...(tag === undefined ? {} : { tag }),
		};
	});
};

const categoriesOf = (answers: readonly AnsweredPoll[]) => {
	const tallies = tallyCategories(answers);
	const correct = tallies.reduce((sum, tally) => sum + tally.correct, 0);
	const seen = tallies.reduce((sum, tally) => sum + tally.seen, 0);

	return { meta: `${correct} of ${seen}`, rows: categoryRowsOf(tallies) };
};

const chipOf = (config: Config): ConfigChipProps => ({
	name: config.label,
	slots: slotsOf(config),
	version: config.level ?? 1,
	badges: [],
	info: settledFactsFor(config),
});

const buildNoteOf = (frame: RunOverFrame): string => {
	if (frame.configs.length === 0) return BARE_BUILD;
	if (frame.upkeepPaidKb === 0) return NO_UPKEEP;

	const spare = frame.freeWeight;
	const credit = frame.emptyCreditKb;
	const spent = `Upkeep took ${kbLabel(frame.upkeepPaidKb)} across ${plural(frame.gate, "gate")}.`;

	if (spare === 0) return spent;
	if (credit > 0)
		return `${spent} ${weightLabel(spare)} of it ${STAYED_EMPTY}, taking ${kbLabel(credit)} ${OFF_THE_BILL}.`;

	return `${spent} ${weightLabel(spare)} of it ${NEVER_PAID}.`;
};

const buildOf = (frame: RunOverFrame) => ({
	meta: weightLabel(frame.weight),
	badge: {
		label: `${kbLabel(frame.upkeepKb)} ${A_GATE}`,
		color: TERM_COLOR,
	},
	configs: frame.configs.map(chipOf),
	note: buildNoteOf(frame),
});

const storageOf = (frame: RunOverFrame): readonly RunOverStorageRow[] => {
	const archived = bankedKb(frame.balanceKb, frame.gate, frame.won);
	const lost = unbankedKb(frame.balanceKb, frame.gate, frame.won);

	return [
		{
			label: ARCHIVED_ROW,
			figure: signedKbLabel(archived),
			color: GAIN_COLOR,
		},
		...(frame.archiveAfterKb === undefined
			? []
			: [
					{
						label: ARCHIVE_AFTER_ROW,
						figure: kbLabel(frame.archiveAfterKb),
						color: GAIN_COLOR,
					},
				]),
		{ label: LOST_ROW, figure: kbLabel(lost), spent: true },
	];
};

const unlockRowsOf = (frame: RunOverFrame): readonly RunOverUnlock[] => {
	const earned = swatchesEarnedFrom(frame.swatchGates);

	return [
		...(earned.length === 0
			? []
			: [
					{
						label: `${swatchCount(earned.length)} ${ON_PROFILE}`,
						marks: earned.map((swatch): SwatchFill => ({
							state: "discovered",
							swatch,
						})),
						badge: { label: SWATCH_ROW_BADGE },
					},
				]),
		...frame.unlocked.map((line) => ({
			chip: chipOf(line.config),
			detail: INSTALLABLE,
			badge: { label: UNLOCK_ROW_BADGE, color: GAIN_COLOR },
		})),
		{
			label: SPENT_ROW_LABEL,
			badge: { label: SPENT_ROW_BADGE },
			spent: true,
		},
	];
};

const unlockedOf = (frame: RunOverFrame) => {
	const kept = frame.swatchGates.length + frame.unlocked.length;

	return {
		badge: { label: kept === 0 ? NOTHING_NEW : `${kept} ${NEW}` },
		rows: unlockRowsOf(frame),
	};
};

export const runOverPropsFor = (frame: RunOverFrame): RunOverScreenProps => ({
	header: {
		swatch: gateSwatchAt(frame.gate),
		swatches: swatchTrackFor(frame.swatchGates, frame.gate),
		title: frame.won ? SUMMIT_TITLE : RUN_OVER_TITLE,
		...(frame.won
			? {
					subtitle: `${signedKbLabel(bankedKb(frame.balanceKb, frame.gate, true))} ${BANKED_TRAIL}`,
				}
			: {}),
		note: subtitleOf(frame),
		funds: fundsOf(frame.balanceKb, STORAGE_BALANCE),
	},
	bar: frame.bar,
	coverage: {
		meta: HELD_AT_CLOSE,
		badge: {
			label: pct(frame.bar.held),
			color: COVERAGE_BAND_COLOR[frame.bar.band],
		},
		note: coverageNoteOf(frame),
	},
	gates: gatesOf(frame),
	categories: categoriesOf(frame.answers),
	build: buildOf(frame),
	storage: { rows: storageOf(frame) },
	unlocked: unlockedOf(frame),
	footer: {
		asides: [{ label: COMMUNITY_LABEL, icon: "community", onPress: noop }],
		note: FRESH_HAND,
		action: {
			label: NEW_RUN_LABEL,
			icon: "chevron",
			iconAt: "trail",
			onPress: noop,
		},
	},
	won: frame.won,
});

const closeBarFor = (view: RunView, gate: number): CoverageBarProps => {
	const close = view.lastClose;

	return close !== null && close.gate === gate
		? { ...close.ladder, held: close.held, band: close.band }
		: stakeBarFor(view.gateStake);
};

export const runOverFrameOf = (
	view: RunView,
	archiveAfterKb?: number
): RunOverFrame => {
	const won = view.status === "won";
	const gate = won ? view.victoryGate : view.gateStake.gateNumber;

	return {
		gate,
		won,
		answers: view.allAnswered,
		payouts: runPaidFor(view),
		bar: closeBarFor(view, gate),
		swatchGates: view.swatchGates,
		configs: view.configs,
		weight: view.buildSpace.weight,
		freeWeight: view.buildSpace.freeWeight,
		emptyCreditKb: view.buildSpace.emptyCreditKb,
		upkeepKb: view.buildSpace.perGateKb,
		balanceKb: view.storage,
		upkeepPaidKb: view.upkeepPaidKb,
		...(archiveAfterKb === undefined ? {} : { archiveAfterKb }),
		unlocked: unlockLinesFor(view.unlockedThisRun),
	};
};

export type RunOverScreenHandlers = {
	onNewRun: () => void;
	onCommunity?: () => void;
};

export type RunOverScreenFrame = {
	view: RunView;
	archiveAfterKb?: number;
	startRefusal?: string;
	on: RunOverScreenHandlers;
};

export const runOverScreenPropsFor = ({
	view,
	archiveAfterKb,
	startRefusal,
	on,
}: RunOverScreenFrame): RunOverScreenProps => {
	const props = runOverPropsFor(runOverFrameOf(view, archiveAfterKb));

	return {
		...props,
		footer: {
			...props.footer,
			refusal: startRefusal,
			action: {
				...props.footer.action,
				onPress: startRefusal === undefined ? on.onNewRun : undefined,
			},
			asides: (props.footer.asides ?? []).map((aside) => ({
				...aside,
				onPress: on.onCommunity,
			})),
		},
	};
};
