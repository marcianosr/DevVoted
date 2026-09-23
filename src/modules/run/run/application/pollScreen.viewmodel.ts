import { format } from "date-fns";

import {
	abArmLabel,
	type Config,
	otherArmOf,
} from "~/modules/run/config/domain/config.model";
import {
	categoriesWord,
	chipFor,
	pollNoteFor,
} from "~/modules/run/config/application/configChip.viewmodel";
import {
	gateSwatchAt,
	swatchTrackFor,
} from "~/modules/run/gate/application/swatchTrack.viewmodel";
import type { AuditView } from "~/modules/run/run/application/gateStake.viewmodel";
import {
	BALANCE_WORD,
	fundsOf,
} from "~/modules/run/run/application/prepScreen.viewmodel";
import type { RunView } from "~/modules/run/run/application/runView.viewmodel";
import type { PollView } from "~/modules/run/run/application/pollView.viewmodel";
import type { PollKey } from "~/modules/run/run/application/usePollKeyboard.hook";
import {
	type CategoryRecord,
	maintainerTitleOf,
} from "~/modules/run/run/domain/categoryRecord.model";
import {
	difficultyBandOf,
	type DifficultyBand,
	firstAttemptRateOf,
	isSeenBefore,
	type PollStats,
} from "~/modules/run/run/domain/pollStats.model";
import type { PaidRefusal } from "~/modules/run/run/domain/paidAction.model";
import type { CoverageConfigBonus } from "~/modules/run/build/domain/coverageRatio.model";
import { scoringSlotsAt } from "~/modules/run/build/domain/coverageRatio.model";
import {
	answersPerGate,
	type AnsweredPoll,
	type AnswerOutcome,
} from "~/modules/run/run/domain/runPoll.model";
import {
	roundToOneDecimal,
	roundToTwoDecimals,
} from "~/modules/run/run/domain/rules.model";
import { CATEGORY_METADATA } from "~/shared/lib/categories";
import { kbLabel } from "~/shared/lib/storage";

import type { AuditProps } from "~/ui/kanto-theme/Audit.ui";
import type { BuildCounts } from "~/ui/kanto-theme/BuildFooter.ui";
import type { BuildProps } from "~/ui/kanto-theme/Build.ui";
import type { ConfigChipBadge } from "~/ui/kanto-theme/ConfigChip.ui";
import type { ChoiceVerdict } from "~/ui/kanto-theme/Choice.ui";
import type { KantoColor } from "~/ui/kanto-theme/colors";
import type { HallOfFameProps } from "~/ui/kanto-theme/HallOfFame.ui";
import type { PollFact, PollFactsProps } from "~/ui/kanto-theme/PollFacts.ui";
import type { CoverageBarProps } from "~/ui/kanto-theme/CoverageBar.ui";
import type { HeaderProps } from "~/ui/kanto-theme/Header.ui";
import type { LeadLine } from "~/ui/kanto-theme/Lead.ui";
import type { QuestionOption } from "~/ui/kanto-theme/Question.ui";
import type {
	FigureTone,
	LedgerRow,
	LedgerTag,
} from "~/ui/kanto-theme/LedgerRows.ui";
import type {
	PollPaid,
	PollScoreRow,
	PollScoresProps,
} from "~/ui/kanto-theme/PollScores.ui";

const OPTION_LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const OFFLINE_NOTE = "an audit has these offline this gate";
const HIDDEN_CATEGORY = "?????";

export const letterAt = (index: number): string => OPTION_LETTERS[index] ?? "?";

export const categoryNameOf = (view: RunView, code: string): string =>
	view.categoryHidden
		? HIDDEN_CATEGORY
		: (CATEGORY_METADATA[code as keyof typeof CATEGORY_METADATA]?.name ?? code);

export const auditPropsOf = (
	audits: readonly AuditView[]
): readonly AuditProps[] =>
	audits
		.filter((audit) => !audit.suppressed)
		.map((audit) => ({
			code: audit.code,
			name: audit.name,
			cue: audit.answerCue ?? audit.description,
		}));

const GATE_SEPARATOR = "·";

/**
 * The one place this screen names a gate. The header used to fall back to its
 * own copy of the string and the close button needs the same words, so both read
 * it from here rather than drifting apart.
 */
export const gateLabelFor = (gate: number): string => {
	const swatch = gateSwatchAt(gate);

	return `Gate ${swatch.gate} ${GATE_SEPARATOR} ${swatch.gateName}`;
};

export const pollHeaderFor = (view: RunView): HeaderProps => {
	const gate = view.gateStake.gateNumber;

	return {
		swatch: gateSwatchAt(gate),
		title: gateLabelFor(gate),
		swatches: swatchTrackFor(view.swatchGates, gate),
		funds: fundsOf(view.storage, BALANCE_WORD),
		swatchState: "current",
	};
};

const POLL_WORD = "Poll";
const OUT_OF = "out of";
const CORRECT_OUTCOME = "correct";
const SCORED_LEAD = "You have scored ";
const SCORED_JOIN = " units across ";
const SCORED_JOIN_ONE = " unit across ";
const SCORED_TRAIL = " slots, which is ";
const SCORED_CLOSE = " coverage.";

const PAID_COLOR = {
	correct: "viridian",
	partial: "saffron",
	wrong: "cinnabar",
} as const;

/** What `.length` buys: the gate's running tally, or nothing without it. */
export const pollHoldsFor = (view: RunView): string | undefined => {
	const count = view.correctAnswersThisGate;
	if (count === null) return undefined;
	const word = view.mirroredPolls ? "incorrect" : "correct";

	return `${count} ${word} ${count === 1 ? "answer" : "answers"} in this gate`;
};

const BAND_TONE = {
	untested: "pewter",
	brutal: "cinnabar",
	hard: "saffron",
	fair: "celadon",
	easy: "viridian",
} as const satisfies Record<DifficultyBand, KantoColor>;

const UNTESTED_TEXT = "too few first tries to say";
const SEEN_BADGE = "seen before";
const SEEN_TONE = "saffron";
const DATE_FORMAT = "d MMM";

const timesWord = (times: number): string => {
	if (times === 1) return "once";
	if (times === 2) return "twice";

	return `${times} times`;
};

const everyTimeWord = (times: number): string =>
	times === 2 ? "both times" : `all ${times} times`;

const outcomeClause = (attempts: number, misses: number): string => {
	if (misses === 0) {
		if (attempts === 1) return "you got it right";

		return `you got it right ${everyTimeWord(attempts)}`;
	}
	if (misses === attempts) {
		if (attempts === 1) return "you missed it";

		return `you missed it ${everyTimeWord(attempts)}`;
	}

	return `you missed it ${timesWord(misses)}`;
};

/**
 * How hard the room found the poll. Stated before the question is read, which
 * is the only place it is worth anything: it is the reason to spend a peek, not
 * a verdict on having spent one.
 */
export const pollDifficultyFor = (stats: PollStats): PollFact => {
	const band = difficultyBandOf(stats);
	if (band === "untested") {
		return { badge: band, tone: BAND_TONE[band], text: UNTESTED_TEXT };
	}

	return {
		badge: band,
		tone: BAND_TONE[band],
		figure: `${firstAttemptRateOf(stats)}%`,
		text: "got it right first time",
	};
};

/** Absent until this account has answered the poll — there is nothing to say. */
export const pollHistoryFor = (stats: PollStats): PollFact | undefined => {
	if (!isSeenBefore(stats)) return undefined;

	const when =
		stats.lastAnsweredAt === undefined
			? ""
			: `, last on ${format(new Date(stats.lastAnsweredAt), DATE_FORMAT)}`;

	return {
		badge: SEEN_BADGE,
		tone: SEEN_TONE,
		text: `answered ${timesWord(stats.attempts)} · ${outcomeClause(
			stats.attempts,
			stats.misses
		)}${when}`,
	};
};

/**
 * The band, or nothing. Undefined while an answer is on screen: the facts are
 * what you read *before* the question, and the personal half would be a tick
 * out of date the moment the answer lands.
 */
export const pollFactsFor = (
	poll: PollView | undefined
): Omit<PollFactsProps, "trailing"> | undefined => {
	const stats = poll?.stats;
	if (stats === undefined) return undefined;

	return {
		difficulty: pollDifficultyFor(stats),
		history: pollHistoryFor(stats),
	};
};

const RECORD_CAPTION = (category: string) =>
	`the longest run of correct ${category} answers`;
const RECORD_FIGURE = (streak: number) => `${streak} in a row`;
const YOUR_BEST = (streak: number) => `your best ${streak}`;

const recordHolderFor = (record: CategoryRecord): HallOfFameProps["holder"] => {
	const { holder } = record;
	if (holder === undefined) return undefined;

	return {
		handle: holder.handle,
		title: maintainerTitleOf(record.category),
		figure: RECORD_FIGURE(holder.streak),
		you: holder.you,
		...(holder.githubLogin === undefined
			? {}
			: { githubLogin: holder.githubLogin }),
		...(holder.avatarUrl === undefined ? {} : { photoUrl: holder.avatarUrl }),
		...(holder.borderUrl === undefined ? {} : { borderUrl: holder.borderUrl }),
	};
};

/**
 * Your own figure, or nothing to say.
 *
 * Left off at zero — `your best 0` states a fact nobody asked for — and left
 * off when you are the holder, where the record already *is* your best and the
 * row would print the same number twice.
 */
const yourBestFor = (record: CategoryRecord): string | undefined => {
	if (record.holder?.you === true) return undefined;
	if (record.yourBest === 0) return undefined;

	return YOUR_BEST(record.yourBest);
};

/**
 * The category's living record, under the byline.
 *
 * Withheld entirely while the category is hidden: the caption names the topic
 * in full, so blinding the header badge and leaving this would hand back the
 * very thing the audit took.
 */
export const hallOfFameFor = (
	view: RunView,
	poll: PollView | undefined
): HallOfFameProps | undefined => {
	const record = poll?.record;
	if (record === undefined || view.categoryHidden) return undefined;

	const holder = recordHolderFor(record);
	const yourBest = yourBestFor(record);

	return {
		caption: RECORD_CAPTION(categoryNameOf(view, record.category)),
		...(holder === undefined ? {} : { holder }),
		...(yourBest === undefined ? {} : { yourBest }),
	};
};

/** While an answer is on screen the step is the poll just answered, not the next one. */
export const pollLabelFor = (view: RunView, revealing = false): string => {
	const answered = view.answeredThisGate.length;
	const step = revealing
		? Math.max(1, answered)
		: Math.min(answered + 1, view.pollsPerGate);

	return `${POLL_WORD} ${step} ${OUT_OF} ${view.pollsPerGate}`;
};

const verdictOf = (
	label: string,
	answered: AnsweredPoll
): ChoiceVerdict | undefined => {
	if (answered.correct === undefined) return undefined;
	const picked = answered.picked.includes(label);
	const correct = answered.correct.includes(label);
	if (picked) return correct ? "right" : "wrong";
	return correct ? "missed" : undefined;
};

export const answeredOptionsFor = (
	answered: AnsweredPoll
): readonly QuestionOption[] => {
	const labels = answered.options ?? [
		...new Set([...answered.picked, ...(answered.correct ?? [])]),
	];

	return labels.map((label, index) => ({
		id: label,
		letter: letterAt(index),
		label,
		verdict: verdictOf(label, answered),
	}));
};

export const pollKeysFor = (view: RunView): readonly PollKey[] =>
	(view.poll?.options ?? [])
		.map((option, index) => ({ letter: letterAt(index), id: option.id }))
		.filter((key) => !view.disabledOptionIds.includes(key.id));

/** Percentages keep one decimal, so the badge reads as the panel meta does. */
const coveragePercent = (held: number): string =>
	`${roundToOneDecimal(held).toFixed(1)}%`;

export const coverageLeadFor = (view: RunView): LeadLine => {
	const units = roundToTwoDecimals(view.gateStake.unitsHeld);

	return [
		SCORED_LEAD,
		{ figure: `${units}`, gain: true },
		units === 1 ? SCORED_JOIN_ONE : SCORED_JOIN,
		{ figure: `${scoringSlotsAt(view.gateStake.gateNumber)}` },
		SCORED_TRAIL,
		{ figure: coveragePercent(view.gateStake.coverageHeld), gain: true },
		SCORED_CLOSE,
	];
};

const paidOf = (view: RunView, poll: AnsweredPoll): PollPaid => {
	const receipt = pollBreakdownFor(view, poll);

	return {
		figure: `${roundToTwoDecimals(poll.coverageEarned ?? 0)}`,
		color: PAID_COLOR[poll.outcome],
		...(receipt.length === 0 ? {} : { receipt }),
	};
};

const payoutRowFor = (
	view: RunView,
	answers: readonly AnsweredPoll[],
	gate: number,
	current: boolean,
	polls: number
): PollScoreRow => ({
	swatch: gateSwatchAt(gate),
	correct: answers.filter((poll) => poll.outcome === CORRECT_OUTCOME).length,
	polls,
	payouts: {
		slots: Array.from({ length: polls }, (_, position) => {
			const poll = answers[position];
			return poll === undefined ? undefined : paidOf(view, poll);
		}),
		total: `${roundToTwoDecimals(
			answers.reduce((sum, poll) => sum + (poll.coverageEarned ?? 0), 0)
		)}`,
	},
	...(current ? { current: true } : {}),
});

/** Every gate the run has opened. The debrief's view, where history is the point. */
export const runPaidFor = (view: RunView): PollScoresProps => {
	const gate = view.gateStake.gateNumber;

	return {
		rows: answersPerGate(view.allAnswered, gate).map((answers, index) =>
			payoutRowFor(view, answers, index, index === gate, view.pollsPerGate)
		),
	};
};

/**
 * The gate in hand only. The run's whole payout history is the debrief's job:
 * on the screen you answer on, every earlier gate is a row you cannot act on.
 *
 * Every chip carries its own receipt, so any poll in the gate explains itself
 * on hover rather than only the one just answered (ADR-095).
 */
export const pollPaidFor = (view: RunView): PollScoresProps => {
	const gate = view.gateStake.gateNumber;
	const answers = answersPerGate(view.allAnswered, gate)[gate] ?? [];

	return {
		rows: [payoutRowFor(view, answers, gate, true, view.pollsPerGate)],
	};
};

export const pollBarFor = (view: RunView, pin = false): CoverageBarProps => ({
	...view.gateStake.coverageLadder,
	held: view.gateStake.coverageHeld,
	pin,
});

const offlineIdsOf = (view: RunView): ReadonlySet<string> =>
	new Set(view.offlineConfigs.map((offline) => offline.config.id));

export type PressAction = "lint" | "peek" | "switch-arm" | "arm-strict";

export type PollPress = {
	readonly configId: string;
	readonly action: PressAction;
	readonly label: string;
	readonly ready: boolean;
	readonly refusal: string | undefined;
	/** Only a toggle carries this: a one-shot press has no pressed state to state. */
	readonly armed?: boolean;
};

const ARM_WORD = "arm";
const ARMED_WORD = "armed";
const WAGER_SETTLED = "wagered on this answer";
const WAGER_LOST_LABEL = "wager lost";
const WAGER_LOST_DETAIL = "an armed wager pays only an exact answer";

const REFUSAL_COPY: Record<PaidRefusal, string> = {
	offline: "offline",
	otherCategory: "waits for another category",
	frozen: "frozen",
	rateLimited: "rate limited",
	lastWrongStanding: "one wrong left",
	alreadyPeeked: "already read",
	cannotAfford: "cannot afford",
};

const lintRefusalCopy = (
	config: Config,
	refusal: PaidRefusal | undefined
): string | undefined => {
	if (refusal === undefined) return undefined;
	if (refusal !== "otherCategory") return REFUSAL_COPY[refusal];
	const categories = config.eliminatesWrongOptionsFor ?? [];
	return categories.length === 0
		? REFUSAL_COPY.otherCategory
		: `waits for ${categoriesWord(categories)}`;
};

const pressesOf = (view: RunView): readonly PollPress[] => {
	const { lintReady, lintCost, lintRefusal } = view.paidActions;
	const { peekReady, peekCost, peekRefusal } = view.paidActions;

	return view.configs.flatMap((config): PollPress[] => {
		if (config.eliminatesWrongOptionsFor !== undefined)
			return [
				{
					configId: config.id,
					action: "lint",
					label: `lint ${kbLabel(lintCost)}`,
					ready: lintReady && view.paidActions.linter?.id === config.id,
					refusal: lintRefusalCopy(config, lintRefusal),
				},
			];

		if (config.peeksCommunitySplit === true)
			return [
				{
					configId: config.id,
					action: "peek",
					label: `peek ${kbLabel(peekCost)}`,
					ready: peekReady,
					refusal:
						peekRefusal === undefined ? undefined : REFUSAL_COPY[peekRefusal],
				},
			];

		if (config.wagersAnswer !== undefined) {
			const { wagerArmed, wagerStake, canWager } = view.paidActions;
			return [
				{
					configId: config.id,
					action: "arm-strict",
					label: `${wagerArmed ? ARMED_WORD : ARM_WORD} ±${wagerStake}`,
					armed: wagerArmed,
					ready: canWager,
					refusal: canWager ? undefined : REFUSAL_COPY.offline,
				},
			];
		}

		const arm = otherArmOf(config);
		if (arm !== undefined)
			return [
				{
					configId: config.id,
					action: "switch-arm",
					label: `ship ${abArmLabel(arm)}`,
					ready: true,
					refusal: undefined,
				},
			];

		return [];
	});
};

/**
 * One source for both the chip badges and the footer count, so the count can
 * never again promise a press the screen does not draw (ADR-069).
 */
export const pollPressesOf = (view: RunView): readonly PollPress[] => {
	const offline = offlineIdsOf(view);
	return pressesOf(view).filter((press) => !offline.has(press.configId));
};

export const buildCountsOf = (view: RunView): BuildCounts => {
	const offline = offlineIdsOf(view);
	const ready = new Set(
		pollPressesOf(view)
			.filter((press) => press.ready)
			.map((press) => press.configId)
	);
	const online = view.configs.filter(
		(config) =>
			!offline.has(config.id) &&
			view.configStatuses[config.id]?.kind === "online"
	);

	return {
		applies: online.filter((config) => !ready.has(config.id)).length,
		ready: online.filter((config) => ready.has(config.id)).length,
		offline: offline.size,
		changing: 0,
	};
};

export type PressHandlers = {
	readonly onPress?: (action: PressAction, configId: string) => void;
};

/**
 * A refused press wears its reason as the label. `hint` only reaches the DOM as
 * an aria-label, which no sighted player reads and which would replace the
 * button's own name for everyone else.
 */
const badgesFor = (
	press: PollPress | undefined,
	onPress: PressHandlers["onPress"],
	revealed = false
): ConfigChipBadge[] => {
	if (press === undefined || onPress === undefined) return [];

	const settled = revealed && press.action === "arm-strict";
	const ready = press.ready && !settled;
	const refusal = settled ? WAGER_SETTLED : press.refusal;

	return [
		{
			label: ready ? press.label : (refusal ?? press.label),
			onPress: () => onPress(press.action, press.configId),
			...(press.armed === undefined ? {} : { armed: press.armed }),
			disabled: !ready,
		},
	];
};

const creditedIdsOf = (
	answered: AnsweredPoll | undefined
): ReadonlySet<string> =>
	new Set(
		(answered?.coverageBreakdown?.configBonuses ?? []).map(
			(bonus) => bonus.configId
		)
	);

export const pollBuildFor = (
	view: RunView,
	panels: Pick<BuildProps, "openInfo" | "onToggleInfo"> & PressHandlers = {},
	answered?: AnsweredPoll
): BuildProps => {
	const { onPress, ...rest } = panels;
	const offline = offlineIdsOf(view);
	const credited = creditedIdsOf(answered);
	const presses = new Map(
		pollPressesOf(view).map((press) => [press.configId, press])
	);
	const chip = (config: Config, note?: string) => {
		const { badge, detail } = pollNoteFor(view.configStatuses[config.id]);

		return {
			name: config.label,
			badges: [
				...(badge === undefined ? [] : [badge]),
				...badgesFor(presses.get(config.id), onPress, answered !== undefined),
			],
			...(detail === undefined ? {} : { detail }),
			...(credited.has(config.id) ? { credited: true } : {}),
			...chipFor(config, note),
		};
	};

	return {
		configs: view.configs
			.filter((config) => !offline.has(config.id))
			.map((config) => chip(config)),
		skipped: view.offlineConfigs.map((entry) =>
			chip(entry.config, entry.audit)
		),
		skippedNote: view.offlineConfigs.length === 0 ? undefined : OFFLINE_NOTE,
		...rest,
	};
};

const BASE_LABEL = {
	correct: "right answer",
	partial: "partial answer",
	wrong: "wrong answer",
} as const satisfies Record<AnswerOutcome, string>;

const BASE_DETAIL = "base";
const STREAK_LABEL = "streak";
const PAID_LABEL = "paid";
const MATCHES = "matches";
const QUIET: FigureTone = "quiet";

const unitsWord = (value: number): string => `${roundToTwoDecimals(value)}`;

/**
 * Two fixed decimals, so right-aligning the column also aligns the decimal
 * points: the receipt has to read as the arithmetic it is (ADR-095).
 */
const receiptUnits = (value: number): string =>
	roundToTwoDecimals(value).toFixed(2);

const contributionWord = (value: number): string =>
	`${value > 0 ? "+" : ""}${receiptUnits(value)}`;

/**
 * Only a multiplier needs one. An adder's sold form is the units it added, and
 * the figure already states those.
 */
const soldFormTagsFor = ({
	factor,
}: CoverageConfigBonus): readonly LedgerTag[] | undefined =>
	factor === undefined ? undefined : [{ label: `×${unitsWord(factor)}` }];

const quietRow = (
	label: string,
	figure: string,
	detail?: string
): LedgerRow => ({
	label,
	...(detail === undefined ? {} : { detail }),
	figures: [{ label: figure, tone: QUIET }],
});

const bonusRowFor = (
	view: RunView,
	answered: AnsweredPoll,
	bonus: CoverageConfigBonus
): LedgerRow => {
	const config = view.configs.find((held) => held.id === bonus.configId);
	const matched =
		config?.focusCategory === answered.category
			? `${MATCHES} ${categoryNameOf(view, answered.category)}`
			: undefined;
	const tags = soldFormTagsFor(bonus);

	return {
		...quietRow(
			config?.label ?? bonus.configId,
			contributionWord(bonus.value),
			matched
		),
		...(tags === undefined ? {} : { tags }),
	};
};

/**
 * The answer's receipt: where the figure in the payout badge came from. One row
 * per contributor, each stating the units it added, so the column sums to the
 * total it closes on. A multiplier keeps the factor it was sold in as a tag
 * beside its name (ADR-095, amending ADR-084).
 */
export const pollBreakdownFor = (
	view: RunView,
	answered: AnsweredPoll
): readonly LedgerRow[] => {
	const breakdown = answered.coverageBreakdown;
	if (breakdown === undefined) return [];

	const { base, streakBonus, configBonuses } = breakdown;
	const lost = answered.coverageLost ?? 0;
	const paid = roundToTwoDecimals(
		base +
			streakBonus +
			configBonuses.reduce((sum, bonus) => sum + bonus.value, 0) -
			lost
	);

	return [
		quietRow(BASE_LABEL[answered.outcome], receiptUnits(base), BASE_DETAIL),
		...configBonuses.map((bonus) => bonusRowFor(view, answered, bonus)),
		...(streakBonus === 0
			? []
			: [quietRow(STREAK_LABEL, contributionWord(streakBonus))]),
		...(lost === 0
			? []
			: [
					quietRow(
						WAGER_LOST_LABEL,
						`−${receiptUnits(lost)}`,
						WAGER_LOST_DETAIL
					),
				]),
		{
			label: PAID_LABEL,
			figures: [
				{ label: unitsWord(paid), color: PAID_COLOR[answered.outcome] },
			],
			total: true,
		},
	];
};
