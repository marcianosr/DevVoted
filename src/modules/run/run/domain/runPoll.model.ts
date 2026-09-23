import type {
	CoverageBreakdown,
	CoverageFactors,
} from "~/modules/run/build/domain/coverageRatio.model";
import type { CategoryCode } from "~/shared/lib/categories";
import {
	partialShareFor,
	SLICE_WINDOW,
} from "~/modules/run/run/domain/rules.model";

const FULL_SHARE = 1;
const NO_SHARE = 0;

export type RunOption = {
	readonly id: string;
	readonly label: string;
	readonly correct: boolean;
};
export type AnswerType = "single" | "multiple";

export type PollAuthor = {
	readonly handle: string;
	readonly avatarUrl?: string;
	readonly borderUrl?: string;
	readonly title?: string;
};

export type RunPoll = {
	readonly id: string;
	readonly category: CategoryCode;
	readonly question: string;
	readonly codeBlock?: string;
	readonly codeSandboxUrl?: string;
	readonly answerType: AnswerType;
	readonly options: readonly RunOption[];
	readonly explanation?: string;
	readonly author?: PollAuthor;
	/**
	 * This account has answered this poll before and did not get it fully right.
	 * Attached when the sequence is read, never stored on the snapshot: the set
	 * shrinks as the player learns, so a persisted flag would go stale.
	 */
	readonly missedBefore?: boolean;
};

type GradedPoll<Id> = {
	readonly answerType: AnswerType;
	readonly options: readonly { readonly id: Id; readonly correct: boolean }[];
};

type PollGrade = {
	readonly keySize: number;
	readonly net: number;
	readonly exact: boolean;
};

const gradeOf = <Id>(
	poll: GradedPoll<Id>,
	picked: ReadonlySet<Id>
): PollGrade => {
	const correctIds = poll.options
		.filter((option) => option.correct)
		.map((option) => option.id);
	const caught = correctIds.filter((id) => picked.has(id)).length;
	const exact =
		poll.answerType === "single"
			? picked.size === 1 && caught === 1
			: correctIds.length === picked.size && caught === correctIds.length;

	return {
		keySize: correctIds.length,
		net: caught - (picked.size - caught),
		exact,
	};
};

export type AnswerOutcome = "correct" | "partial" | "wrong";

export const coverageShare = <Id>(
	poll: GradedPoll<Id>,
	optionIds: Iterable<Id>
): number => {
	const grade = gradeOf(poll, new Set(optionIds));
	if (grade.exact) return FULL_SHARE;
	if (poll.answerType === "single" || grade.keySize === 0) return NO_SHARE;
	if (grade.net <= 0) return NO_SHARE;

	return partialShareFor(grade.net / grade.keySize);
};

export const answerOutcome = <Id>(
	poll: GradedPoll<Id>,
	optionIds: Iterable<Id>
): AnswerOutcome => {
	const grade = gradeOf(poll, new Set(optionIds));
	if (grade.exact) return "correct";
	if (poll.answerType === "single") return "wrong";

	return grade.net > 0 ? "partial" : "wrong";
};

export const mirrorPoll = (poll: RunPoll): RunPoll => {
	const wrongCount = poll.options.filter((option) => !option.correct).length;
	if (wrongCount === 0) return poll;
	return {
		...poll,
		answerType: mirroredAnswerType(wrongCount),
		options: poll.options.map((option) => ({
			...option,
			correct: !option.correct,
		})),
	};
};

export const mirroredAnswerType = (wrongCount: number): AnswerType =>
	wrongCount > 1 ? "multiple" : "single";

export const mirrorGrading = <Id>(poll: GradedPoll<Id>): GradedPoll<Id> => {
	const wrong = poll.options.filter((option) => !option.correct);
	if (wrong.length === 0) return poll;
	return {
		answerType: mirroredAnswerType(wrong.length),
		options: poll.options.map((option) => ({
			id: option.id,
			correct: !option.correct,
		})),
	};
};

export const nextStreak = (current: number, outcome: AnswerOutcome): number => {
	if (outcome === "correct") return current + 1;
	if (outcome === "wrong") return 0;
	return current;
};

export type AnsweredPoll = {
	readonly id: string;
	readonly question: string;
	readonly category: CategoryCode;
	readonly outcome: AnswerOutcome;
	readonly picked: readonly string[];
	readonly correct?: readonly string[];
	readonly codeBlock?: string;
	readonly explanation?: string;
	readonly author?: PollAuthor;
	readonly options?: readonly string[];
	readonly answerType?: AnswerType;
	readonly gate?: number;
	readonly coverageEarned?: number;
	readonly coverageLost?: number;
	readonly coverageBreakdown?: CoverageBreakdown;
	readonly coverageFactors?: CoverageFactors;
	readonly faucetKb?: number;
	readonly elapsedMs?: number;
	readonly timedOut?: boolean;
};

const gateOfAnswer = (poll: AnsweredPoll, index: number): number =>
	poll.gate ?? Math.floor(index / SLICE_WINDOW);

const latestAttemptIn = (
	answers: readonly AnsweredPoll[]
): readonly AnsweredPoll[] => {
	if (answers.length === 0) return answers;

	const attempt = Math.floor((answers.length - 1) / SLICE_WINDOW);
	return answers.slice(attempt * SLICE_WINDOW);
};

export const answersPerGate = (
	answered: readonly AnsweredPoll[],
	gate: number
): readonly (readonly AnsweredPoll[])[] => {
	const placed = answered.map((poll, index) => ({
		poll,
		gate: gateOfAnswer(poll, index),
	}));

	return Array.from({ length: Math.max(0, gate) + 1 }, (_, index) =>
		latestAttemptIn(
			placed.filter((entry) => entry.gate === index).map((entry) => entry.poll)
		)
	);
};

export const cachedHitsFor = (
	answered: readonly AnsweredPoll[],
	category: CategoryCode
): number =>
	answered
		.filter((poll) => poll.category === category)
		.reduce((hits, poll) => {
			if (poll.outcome === "correct") return hits + 1;
			if (poll.outcome === "wrong") return 0;
			return hits;
		}, 0);
