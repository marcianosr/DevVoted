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
import { categoryLeaderRowFor } from "~/modules/run/run/application/categoryLeader.viewmodel";
import {
	difficultyBandOf,
	type DifficultyBand,
	firstAttemptRateOf,
	isSeenBefore,
	type PollStats,
} from "~/modules/run/run/domain/pollStats.model";
import type { PaidRefusal } from "~/modules/run/run/domain/paidAction.model";
import type { CoverageConfigBonus } from "~/modules/run/build/domain/coverageRatio.model";
import {
	healthyUnitsAt,
	scoringSlotsAt,
} from "~/modules/run/build/domain/coverageRatio.model";
import {
	answersPerGate,
	type AnsweredPoll,
	type AnswerOutcome,
	type AnswerType,
} from "~/modules/run/run/domain/runPoll.model";
import {
	roundToOneDecimal,
	roundToTwoDecimals,
} from "~/modules/run/run/domain/rules.model";
import { CATEGORY_METADATA } from "~/shared/lib/categories";
import { plural } from "~/shared/lib/displayValue";
import { kbLabel } from "~/shared/lib/storage";

import type { AuditProps } from "~/ui/kanto-theme/Audit.ui";
import type { BuildCounts } from "~/ui/kanto-theme/BuildFooter.ui";
import type { BuildProps } from "~/ui/kanto-theme/Build.ui";
import type { ConfigChipBadge } from "~/ui/kanto-theme/ConfigChip.ui";
import type { ChoiceVerdict } from "~/ui/kanto-theme/Choice.ui";
import type { KantoColor } from "~/ui/kanto-theme/colors";
import type { CategoryLeaderProps } from "~/ui/kanto-theme/CategoryLeader.ui";
import type { PollFact, PollFactsProps } from "~/ui/kanto-theme/PollFacts.ui";
import {
	coverageBandOf,
	type CoverageBarProps,
} from "~/ui/kanto-theme/CoverageBar.ui";
import { gateTitleOf, type HeaderProps } from "~/ui/kanto-theme/Header.ui";
import type { LeadLine } from "~/ui/kanto-theme/Lead.ui";
import type { PollCommit } from "~/ui/kanto-theme/PollScreen.ui";
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

export const gateLabelFor = (gate: number): string =>
	gateTitleOf(gateSwatchAt(gate));

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

export const categoryLeaderFor = (
	view: RunView,
	poll: PollView | undefined
): CategoryLeaderProps | undefined => {
	const seat = poll?.categorySeat;
	if (seat === undefined || view.categoryHidden) return undefined;

	return categoryLeaderRowFor(seat);
};

const LOCK_IN = "Lock in";
const ANSWER_WORD = "answer";
const PICKED_WORD = "picked";
const PICK_ONE = "pick an answer first";
const PICK_EVERY = "pick every answer that fits";

export const pollCommitFor = (
	answerType: AnswerType,
	picked: number,
	onSubmit: () => void
): PollCommit => {
	if (picked === 0)
		return {
			label: LOCK_IN,
			note: answerType === "multiple" ? PICK_EVERY : PICK_ONE,
		};

	return {
		label: `${LOCK_IN} ${plural(picked, ANSWER_WORD)}`,
		note: `${picked} ${PICKED_WORD}`,
		onPress: onSubmit,
	};
};

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

const coveragePercent = (held: number): string =>
	`${roundToOneDecimal(held).toFixed(1)}%`;

export const coverageLeadFor = (view: RunView): LeadLine => {
	const units = roundToTwoDecimals(view.gateStake.unitsHeld);
	const band = coverageBandOf(
		view.gateStake.coverageHeld,
		view.gateStake.coverageLadder
	);

	return [
		SCORED_LEAD,
		{ figure: `${units}`, band },
		units === 1 ? SCORED_JOIN_ONE : SCORED_JOIN,
		{ figure: `${scoringSlotsAt(view.gateStake.gateNumber)}` },
		SCORED_TRAIL,
		{ figure: coveragePercent(view.gateStake.coverageHeld), band },
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

const answeredIn = (row: PollScoreRow): number =>
	row.payouts?.slots.filter((paid) => paid !== undefined).length ?? 0;

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

export const runPaidFor = (view: RunView): PollScoresProps => {
	const gate = view.gateStake.gateNumber;

	return {
		rows: answersPerGate(view.allAnswered, gate)
			.map((answers, index) =>
				payoutRowFor(view, answers, index, index === gate, view.pollsPerGate)
			)
			.filter((row) => row.correct > 0 || answeredIn(row) > 0),
	};
};

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
	units: {
		held: view.gateStake.unitsHeld,
		healthy: healthyUnitsAt(view.gateStake.gateNumber),
	},
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

const receiptUnits = (value: number): string =>
	roundToTwoDecimals(value).toFixed(2);

const contributionWord = (value: number): string =>
	`${value > 0 ? "+" : ""}${receiptUnits(value)}`;

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
