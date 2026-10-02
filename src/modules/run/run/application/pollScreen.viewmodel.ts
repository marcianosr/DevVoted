import { format } from "date-fns";

import {
	abArmLabel,
	type Config,
	otherArmOf,
} from "~/modules/run/config/domain/config.model";
import {
	chipFor,
	pollNoteFor,
} from "~/modules/run/config/application/configChip.viewmodel";
import {
	gateSwatchAt,
	swatchTrackFor,
} from "~/modules/run/gate/application/swatchTrack.viewmodel";
import type {
	AccuracyView,
	AuditView,
} from "~/modules/run/run/application/gateStake.viewmodel";
import {
	BALANCE_WORD,
	fundsOf,
} from "~/modules/run/run/application/prepScreen.viewmodel";
import type { RunView } from "~/modules/run/run/application/runView.viewmodel";
import type { PollView } from "~/modules/run/run/application/pollView.viewmodel";
import type { PollKey } from "~/modules/run/run/application/usePollKeyboard.hook";
import { categoryLeaderRowFor } from "~/modules/run/run/application/categoryLeader.viewmodel";
import { runReadoutFor } from "~/modules/run/run/application/runReadout.viewmodel";
import type { Disclosure } from "~/shared/hooks/useDisclosure.hook";
import {
	difficultyBandOf,
	type DifficultyBand,
	firstAttemptRateOf,
	isSeenBefore,
	type PollStats,
} from "~/modules/run/run/domain/pollStats.model";
import type { PaidRefusal } from "~/modules/run/run/domain/paidAction.model";
import {
	type CoverageConfigBonus,
	accuracyMultiplierFor,
} from "~/modules/run/build/domain/coverageRatio.model";
import {
	answersPerGate,
	type AnsweredPoll,
	type AnswerOutcome,
	type AnswerType,
} from "~/modules/run/run/domain/runPoll.model";
import { roundToTwoDecimals } from "~/modules/run/run/domain/rules.model";
import { CATEGORY_METADATA } from "~/shared/lib/categories";
import { plural } from "~/shared/lib/displayValue";
import { kbLabel } from "~/shared/lib/storage";

import type { AuditProps } from "~/ui/kanto-theme/Audit.ui";
import type { BuildCounts } from "~/ui/kanto-theme/BuildFooter.ui";
import type { BuildProps } from "~/ui/kanto-theme/Build.ui";
import type { ConfigChipBadge } from "~/ui/kanto-theme/ConfigChip.ui";
import type { AccuracyTrackProps } from "~/ui/kanto-theme/AccuracyTrack.ui";
import type { ChoiceState } from "~/ui/kanto-theme/Choice.ui";
import type { KantoColor } from "~/ui/kanto-theme/colors";
import type { CategoryLeaderProps } from "~/ui/kanto-theme/CategoryLeader.ui";
import type { PollFact, PollFactsProps } from "~/ui/kanto-theme/PollFacts.ui";
import { stakeBarFor } from "~/modules/run/run/application/gateStake.viewmodel";
import type { CoverageBarProps } from "~/ui/kanto-theme/CoverageBar.ui";
import { gateTitleOf, type HeaderProps } from "~/ui/kanto-theme/Header.ui";
import type { LeadLine } from "~/ui/kanto-theme/Lead.ui";

import { scoredLeadFor } from "./scoredLead.viewmodel";
import type { AuthorProps } from "~/ui/kanto-theme/Author.ui";
import type {
	PollCommit,
	PollLock,
	PollSkip,
	PollCoverage,
	PollFlight,
	PollScreenProps,
} from "~/ui/kanto-theme/PollScreen.ui";
import type {
	QuestionOption,
	QuestionProps,
} from "~/ui/kanto-theme/Question.ui";
import type { SwatchMark } from "~/ui/kanto-theme/Swatch.ui";
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

export const gateMarkFor = (gate: number): SwatchMark => ({
	state: "current",
	swatch: gateSwatchAt(gate),
});

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

const PAID_COLOR = {
	correct: "viridian",
	partial: "saffron",
	wrong: "cinnabar",
	skipped: "pewter",
} as const satisfies Record<AnswerOutcome, string>;

const SECOND_MS = 1000;
const URGENT_SECONDS = 3;
const SECONDS_LEFT = "s left";
const SECONDS = "s";
const CLOCK_JOIN = " · ";

export type PollClock = { label: string; color: KantoColor };

const secondsLeft = (limitMs: number, elapsedMs: number): number =>
	Math.max(0, Math.ceil((limitMs - elapsedMs) / SECOND_MS));

export const pollClockFor = (
	view: RunView,
	elapsedMs: number
): PollClock | undefined => {
	if (view.pollTimeLimitMs !== null) {
		const left = secondsLeft(view.pollTimeLimitMs, elapsedMs);
		return {
			label: `${left}${SECONDS_LEFT}`,
			color: left <= URGENT_SECONDS ? "cinnabar" : "saffron",
		};
	}

	const clock = view.fastAnswer;
	if (clock === null) return undefined;
	if (elapsedMs > clock.withinMs)
		return { label: `${clock.label} ×${clock.slow}`, color: "pewter" };
	return {
		label: `${clock.label} ×${clock.fast}${CLOCK_JOIN}${secondsLeft(clock.withinMs, elapsedMs)}${SECONDS}`,
		color: "viridian",
	};
};

const clockOf = (clock: PollClock | undefined): { clock?: PollClock } =>
	clock === undefined ? {} : { clock };

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

	return categoryLeaderRowFor("streak", seat);
};

const LOCK_IN = "Lock in";
const ANSWER_WORD = "answer";
export const PICK_EVERY = "pick every answer that fits";
export const SINGLE_KEYS = "press a letter to answer";
export const MULTIPLE_KEYS = "press letters, then Enter";

export const SKIP_LABEL = "Skip";
export const SKIP_NOTE =
	"covers nothing · keeps your multiplier · breaks the streak";

const skipOf = (onSkip?: () => void): { skip?: PollSkip } =>
	onSkip === undefined
		? {}
		: { skip: { label: SKIP_LABEL, note: SKIP_NOTE, onPress: onSkip } };

export const pollKeysHintFor = (answerType: AnswerType): string =>
	answerType === "multiple" ? MULTIPLE_KEYS : SINGLE_KEYS;

const lockInFor = (picked: number, onSubmit: () => void): PollLock =>
	picked === 0
		? { label: LOCK_IN, note: PICK_EVERY }
		: { label: `${LOCK_IN} ${plural(picked, ANSWER_WORD)}`, onPress: onSubmit };

export const pollCommitFor = (
	answerType: AnswerType,
	picked: number,
	onSubmit: () => void,
	onSkip?: () => void
): PollCommit =>
	answerType === "multiple"
		? { lock: lockInFor(picked, onSubmit), ...skipOf(onSkip) }
		: skipOf(onSkip);

const APPROVE_LABEL = "LGTM";
const APPROVE_NOTE = "the room answers this one for you";

export const approvalCommitFor = (
	onApprove: () => void,
	refusal?: string
): PollCommit => ({
	lock: {
		label: APPROVE_LABEL,
		note: refusal ?? APPROVE_NOTE,
		onPress: onApprove,
	},
});

export const pollStepFor = (view: RunView, revealing = false): number => {
	const answered = view.answeredThisGate.length;

	return revealing
		? Math.max(1, answered)
		: Math.min(answered + 1, view.pollsPerGate);
};

export const pollLabelFor = (view: RunView, revealing = false): string =>
	`${POLL_WORD} ${pollStepFor(view, revealing)} ${OUT_OF} ${view.pollsPerGate}`;

const stateOf = (label: string, answered: AnsweredPoll): ChoiceState => {
	if (answered.correct === undefined) return "idle";
	if (answered.correct.includes(label)) return "right";
	return answered.picked.includes(label) ? "wrong" : "idle";
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
		state: stateOf(label, answered),
	}));
};

export const pollKeysFor = (view: RunView): readonly PollKey[] =>
	(view.poll?.options ?? [])
		.map((option, index) => ({ letter: letterAt(index), id: option.id }))
		.filter((key) => !view.disabledOptionIds.includes(key.id));

export const coverageLeadFor = (view: RunView): LeadLine =>
	scoredLeadFor({
		held: view.gateStake.coverageHeld,
		ladder: view.gateStake.coverageLadder,
	});

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

const withMultiplier = (multiplier: string | undefined) =>
	multiplier === undefined ? {} : { multiplier };

const multiplierLandedAt = (
	view: RunView,
	gate: number,
	answers: readonly AnsweredPoll[],
	polls: number
): string | undefined => {
	if (answers.length < polls) return undefined;
	const accuracy = view.closes
		.filter((close) => close.gate === gate)
		.at(-1)?.accuracy;
	return accuracy === undefined
		? undefined
		: `×${roundToTwoDecimals(accuracyMultiplierFor(accuracy))}`;
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
		...withMultiplier(multiplierLandedAt(view, gate, answers, polls)),
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

const ACCURACY_WORD = "Accuracy";
const UP_TO = "up to";
const FIGURE_JOIN = " · ";
const LABEL_JOIN = ", ";
const TOP_MULTIPLIER = 2;

const multiplierLabel = (multiplier: number): string =>
	`×${roundToTwoDecimals(multiplier)}`;

const shareOfTop = (multiplier: number): number =>
	(multiplier - 1) / (TOP_MULTIPLIER - 1);

const readingsOf = ({ guaranteed, best }: AccuracyView): readonly string[] =>
	roundToTwoDecimals(guaranteed) === roundToTwoDecimals(best)
		? [multiplierLabel(guaranteed)]
		: [multiplierLabel(guaranteed), `${UP_TO} ${multiplierLabel(best)}`];

const pulseOf = (
	answered: AnsweredPoll | undefined
): Pick<AccuracyTrackProps, "pulse"> =>
	answered?.outcome === CORRECT_OUTCOME ? { pulse: { key: answered.id } } : {};

export const accuracyTrackFor = (
	view: RunView,
	answered?: AnsweredPoll
): AccuracyTrackProps => {
	const accuracy = view.gateStake.accuracy;
	const readings = readingsOf(accuracy);

	return {
		label: `${ACCURACY_WORD} ${readings.join(LABEL_JOIN)}`,
		figure: readings.join(FIGURE_JOIN),
		sure: shareOfTop(accuracy.guaranteed),
		best: shareOfTop(accuracy.best),
		...pulseOf(answered),
	};
};

const TENTHS = 10;

export const gainFigureOf = (
	before: number,
	after: number
): string | undefined => {
	const gain = Math.round((after - before) * TENTHS) / TENTHS;
	return gain > 0 ? `+${gain}%` : undefined;
};

export const pollFlightFor = (
	before: RunView | undefined,
	view: RunView,
	answered: AnsweredPoll | undefined
): PollFlight | undefined => {
	if (answered === undefined || before === undefined || view.meterHidden)
		return undefined;
	if (answered.outcome === "wrong") return undefined;
	const fromHeld = before.gateStake.coverageHeld;
	const toHeld = view.gateStake.coverageHeld;
	const figure = gainFigureOf(fromHeld, toHeld);

	return figure === undefined
		? undefined
		: { figure, id: answered.id, fromHeld, toHeld };
};

export const pollShakeFor = (
	answered: AnsweredPoll | undefined
): string | undefined =>
	answered?.outcome === "wrong" ? answered.id : undefined;

export const pollBarFor = (view: RunView): CoverageBarProps =>
	stakeBarFor(view.gateStake);

export const pollCoverageFor = (
	view: RunView,
	{ shown = view, answered }: { shown?: RunView; answered?: AnsweredPoll } = {}
): PollCoverage =>
	view.meterHidden
		? { locked: true }
		: {
				bar: pollBarFor(shown),
				lead: coverageLeadFor(shown),
				accuracy: accuracyTrackFor(view, answered),
			};

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
					refusal:
						lintRefusal === undefined ? undefined : REFUSAL_COPY[lintRefusal],
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

const isSittingOut = (view: RunView, configId: string): boolean =>
	view.configStatuses[configId]?.kind === "skipped";

export const pollPressesOf = (view: RunView): readonly PollPress[] => {
	const offline = offlineIdsOf(view);
	return pressesOf(view).filter(
		(press) =>
			!offline.has(press.configId) && !isSittingOut(view, press.configId)
	);
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
	skipped: "skipped",
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

	const { base, streakBonus = 0, configBonuses } = breakdown;
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

type LivePoll = NonNullable<RunView["poll"]>;

const wrongCostOf = (view: RunView): string | undefined => {
	const cost = view.gateStake.perAnswer.coveragePerWrong;
	return cost === 0 ? undefined : `${Math.abs(cost).toFixed(1)}`;
};

const optionsOf = (
	poll: LivePoll,
	view: RunView,
	onUnseal: ((optionId: string) => void) | undefined
): readonly QuestionOption[] =>
	poll.options.map((option, index) =>
		view.hiddenOptionIds.includes(option.id)
			? {
					id: option.id,
					letter: letterAt(index),
					seal: {
						price: kbLabel(view.buyBack.costKb),
						onUnseal:
							onUnseal === undefined || !view.buyBack.ready
								? undefined
								: () => onUnseal(option.id),
					},
				}
			: {
					id: option.id,
					letter: letterAt(index),
					label: option.label,
					crossedOut: view.disabledOptionIds.includes(option.id),
				}
	);

const liveQuestionFor = (
	view: RunView,
	poll: LivePoll,
	selectedOptionIds: readonly string[],
	onSelect: (optionId: string) => void,
	onUnseal: ((optionId: string) => void) | undefined
): QuestionProps => ({
	answerType: poll.answerType,
	question: poll.question,
	options: optionsOf(poll, view, onUnseal),
	codeBlock: poll.codeBlock,
	pickedIds: selectedOptionIds,
	onPick: onSelect,
});

const answeredQuestionFor = (answered: AnsweredPoll): QuestionProps => ({
	answerType: answered.answerType ?? "single",
	question: answered.question,
	options: answeredOptionsFor(answered),
	codeBlock: answered.codeBlock,
	pickedIds: answered.picked,
});

const authorOf = (poll: LivePoll): AuthorProps | undefined =>
	poll.author === undefined
		? undefined
		: {
				handle: poll.author.handle,
				userId: poll.author.userId,
				role: poll.author.role,
				title: poll.author.title,
				photoUrl: poll.author.avatarUrl,
				borderUrl: poll.author.borderUrl,
			};

export const enterActionFor = (
	revealing: boolean,
	picked: boolean,
	onSubmit: () => void
): (() => void) | undefined => (picked && !revealing ? onSubmit : undefined);

type PollMood = Pick<
	PollScreenProps,
	| "question"
	| "category"
	| "categoryColor"
	| "wrongCost"
	| "hint"
	| "author"
	| "commit"
	| "keysHint"
	| "categoryLeader"
	| "footer"
>;

const answeredMoodFor = (view: RunView, answered: AnsweredPoll): PollMood => ({
	question: answeredQuestionFor(answered),
	category: categoryNameOf(view, answered.category),
	hint: answered.explanation,
});

const wasApprovedUnread = (view: RunView, poll: LivePoll): boolean =>
	view.approvedPollId !== null && view.approvedPollId === poll.id;

const approvedQuestionFor = (
	view: RunView,
	poll: LivePoll,
	onUnseal: ((optionId: string) => void) | undefined
): QuestionProps => ({
	answerType: poll.answerType,
	question: poll.question,
	options: optionsOf(poll, view, onUnseal),
	codeBlock: poll.codeBlock,
	pickedIds: [],
});

const withShake = (shake: string | undefined) =>
	shake === undefined ? {} : { shake };

export type PollScreenHandlers = {
	onSelect: (optionId: string) => void;
	onSubmit: () => void;
	onSkip?: () => void;
	onNext: () => void;
	onLanded?: () => void;
	onPress?: (action: PressAction, configId: string) => void;
	onUnseal?: (optionId: string) => void;
	onApprove?: () => void;
	approveRefusal?: string;
};

const liveMoodFor = (
	view: RunView,
	poll: LivePoll,
	selectedOptionIds: readonly string[],
	on: PollScreenHandlers
): PollMood => {
	const shared = {
		category: categoryNameOf(view, poll.category),
		wrongCost: wrongCostOf(view),
		author: authorOf(poll),
		categoryLeader: categoryLeaderFor(view, poll),
	};

	if (wasApprovedUnread(view, poll) && on.onApprove !== undefined)
		return {
			...shared,
			question: approvedQuestionFor(view, poll, on.onUnseal),
			commit: approvalCommitFor(on.onApprove, on.approveRefusal),
		};

	return {
		...shared,
		question: liveQuestionFor(
			view,
			poll,
			selectedOptionIds,
			on.onSelect,
			on.onUnseal
		),
		keysHint: pollKeysHintFor(poll.answerType),
		commit: pollCommitFor(
			poll.answerType,
			selectedOptionIds.length,
			on.onSubmit,
			on.onSkip
		),
	};
};

export type PollScreenFrame = {
	view: RunView;
	runNumber?: number | null;
	answered?: AnsweredPoll;
	before?: RunView;
	landed?: boolean;
	selectedOptionIds: readonly string[];
	on: PollScreenHandlers;
	ui: { build: Disclosure; clockMs?: number };
};

export const pollScreenPropsFor = ({
	view,
	runNumber = null,
	answered,
	before,
	landed = false,
	selectedOptionIds,
	on,
	ui,
}: PollScreenFrame): PollScreenProps | null => {
	const live = view.poll ?? undefined;
	const flight = pollFlightFor(before, view, answered);
	const mood =
		answered !== undefined
			? answeredMoodFor(view, answered)
			: live === undefined
				? undefined
				: liveMoodFor(view, live, selectedOptionIds, on);
	if (mood === undefined) return null;

	return {
		...mood,
		header: {
			...pollHeaderFor(view),
			readout: runReadoutFor(view, runNumber),
		},
		step: pollStepFor(view, answered !== undefined),
		coverage: pollCoverageFor(view, {
			shown: flight !== undefined && !landed ? before : view,
			answered,
		}),
		...(flight === undefined ? {} : { flight, onFlightLanded: on.onLanded }),
		...withShake(pollShakeFor(answered)),
		holds: pollHoldsFor(view),
		...(answered === undefined && ui.clockMs !== undefined
			? clockOf(pollClockFor(view, ui.clockMs))
			: {}),
		facts: pollFactsFor(live),
		audits: auditPropsOf(view.audits),
		buildFooter: {
			build: pollBuildFor(
				view,
				{
					openInfo: ui.build.open,
					onToggleInfo: ui.build.toggle,
					onPress: on.onPress,
				},
				answered
			),
			counts: buildCountsOf(view),
			flash: answered?.id,
		},
	};
};
