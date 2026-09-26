import { plural } from "~/shared/lib/displayValue";
import { type Config, slotsOf } from "~/modules/run/config/domain/config.model";
import { settledFactsFor } from "~/modules/run/config/application/configChip.viewmodel";
import { scoringSlotsAt } from "~/modules/run/build/domain/coverageRatio.model";
import {
	gateSwatchAt,
	swatchTrackFor,
} from "~/modules/run/gate/application/swatchTrack.viewmodel";
import { swatchesEarnedFrom } from "~/modules/run/gate/domain/swatch.model";
import type { UnlockLine } from "~/modules/run/run/application/unlockNotes.viewmodel";
import type { AnsweredPoll } from "~/modules/run/run/domain/runPoll.model";
import {
	GATE_COUNT,
	roundToOneDecimal,
	roundToTwoDecimals,
	storageCreditRate,
	upkeepForSpace,
} from "~/modules/run/run/domain/rules.model";
import { CATEGORY_METADATA, type CategoryCode } from "~/shared/lib/categories";
import { kbLabel, signedKbLabel } from "~/shared/lib/storage";

import type { KantoColor } from "~/ui/kanto-theme/colors";
import type { ConfigChipProps } from "~/ui/kanto-theme/ConfigChip.ui";
import {
	COVERAGE_BAND_COLOR,
	type CoverageBarProps,
	coverageBandOf,
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
export const COMMUNITY_LABEL = "Community";

const NO_RETRY = "no retry, no peel";
const HELD_WORD = "held";
const SUMMITED = "summited";
const EVERY_GATE = "every gate held";
const FRESH_HAND = "a new run deals a fresh hand and starts at gate 0";

const BEST_TAG = "best";
const LEAK_TAG = "leak";
const NO_PAYING_GATE = "no gate paid";
const BEST_WAS = "best was";

const AGAINST_WINDOW = "against a window of";
const NOTHING_EARNED = "nothing earned";
const STOPPED_AT = "stopped at";
const EARNED_WORD = "earned";

const A_GATE = "a gate";
const NO_UPKEEP = "The run never paid upkeep.";
const NEVER_PAID = "never paid for itself";
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
const NEW_WORD = "new";
const NOTHING_NEW = "nothing new";

const GAIN_COLOR: KantoColor = "viridian";
const LOSS_COLOR: KantoColor = "cinnabar";
const TERM_COLOR: KantoColor = "saffron";

/** Below this share a category reads as the run's leak rather than a soft spot. */
const LEAK_SHARE = 0.5;

const PERCENT = "%";
const SEPARATOR = " · ";

export type RunOverFrame = {
	/** The gate the run stopped on: the one it failed, or the summit it took. */
	readonly gate: number;
	readonly won: boolean;
	readonly answers: readonly AnsweredPoll[];
	readonly payouts: PollScoresProps;
	readonly bar: CoverageBarProps;
	readonly unitsHeld: number;
	readonly swatchGates: readonly number[];
	readonly configs: readonly Config[];
	/** The build space the run rented at the end (ADR-082): the rung it held. */
	readonly space: number;
	readonly weight: number;
	readonly balanceKb: number;
	readonly upkeepPaidKb: number;
	/** The account archive once this run banks. Absent where no account is loaded. */
	readonly archiveAfterKb?: number;
	readonly unlocked: readonly UnlockLine[];
};

/** Weight is a mass noun everywhere else in the kit ("7 of 10 weight · 3 free"). */
const weightLabel = (weight: number) => `${weight} weight`;

const swatchCount = (count: number) =>
	`${count} ${count === 1 ? "swatch" : "swatches"}`;

const pct = (value: number) => `${roundToOneDecimal(value)}${PERCENT}`;

const units = (value: number) => `${roundToTwoDecimals(value)}`;

const bandOf = (bar: CoverageBarProps) => coverageBandOf(bar.held, bar);

/**
 * The line the run is measured against. A dead run missed the floor, so quoting
 * it the healthy line reports a shortfall it was never close to clearing; a
 * summited one has no floor left to miss. Both come off the bar rather than the
 * raw ladder, because an audit scales the gate's demand.
 */
const lineOf = (frame: RunOverFrame) =>
	frame.won ? frame.bar.healthy : frame.bar.floor;

const windowOf = (gate: number) => scoringSlotsAt(gate);

const subtitleOf = (frame: RunOverFrame): string => {
	const line = `${pct(frame.bar.held)} against a line of ${pct(lineOf(frame))}`;

	if (frame.won) return [EVERY_GATE, line].join(SEPARATOR);

	return [
		`${gateSwatchAt(frame.gate).gateName} ${HELD_WORD}`,
		line,
		NO_RETRY,
	].join(SEPARATOR);
};

const captionOf = (frame: RunOverFrame): string => {
	const earned = frame.swatchGates.length;
	const tally = earned === 0 ? NOTHING_EARNED : `${earned} ${EARNED_WORD}`;
	const place = frame.won
		? SUMMITED
		: `${STOPPED_AT} ${gateSwatchAt(frame.gate).gateName}`;

	return [tally, place].join(SEPARATOR);
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
			score: `${units(frame.unitsHeld)} of ${windowOf(frame.gate)}`,
			badge: {
				label: pct(frame.bar.held),
				color: COVERAGE_BAND_COLOR[bandOf(frame.bar)],
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

/** Ranked rows only earn a tag when there is something to rank them against. */
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

	const spare = frame.space - frame.weight;
	const spent = `Upkeep took ${kbLabel(frame.upkeepPaidKb)} across ${plural(frame.gate, "gate")}.`;

	return spare <= 0
		? spent
		: `${spent} ${weightLabel(spare)} of it ${NEVER_PAID}.`;
};

const buildOf = (frame: RunOverFrame) => ({
	meta: weightLabel(frame.weight),
	badge: {
		label: `${kbLabel(upkeepForSpace(frame.space))} ${A_GATE}`,
		color: TERM_COLOR,
	},
	configs: frame.configs.map(chipOf),
	note: buildNoteOf(frame),
});

const storageOf = (frame: RunOverFrame): readonly RunOverStorageRow[] => {
	const rate = storageCreditRate(frame.won ? "victory" : "dead", frame.gate);
	const archived = Math.round(frame.balanceKb * rate);
	const lost = frame.balanceKb - archived;

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
		badge: { label: kept === 0 ? NOTHING_NEW : `${kept} ${NEW_WORD}` },
		rows: unlockRowsOf(frame),
	};
};

export const runOverPropsFor = (frame: RunOverFrame): RunOverScreenProps => ({
	header: {
		swatch: gateSwatchAt(frame.gate),
		swatches: swatchTrackFor(frame.swatchGates, frame.gate),
		title: frame.won ? SUMMIT_TITLE : RUN_OVER_TITLE,
		subtitle: subtitleOf(frame),
		figure: {
			amount: plural(frame.gate, "gate"),
			note: `of ${GATE_COUNT}`,
		},
		caption: captionOf(frame),
	},
	bar: frame.bar,
	coverage: {
		meta: `${units(frame.unitsHeld)} ${AGAINST_WINDOW} ${windowOf(frame.gate)}`,
		badge: {
			label: pct(frame.bar.held),
			color: COVERAGE_BAND_COLOR[bandOf(frame.bar)],
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
