import type { CoverageBreakdown } from "~/modules/run/pipeline/domain/pipeline.model";
import type { CategoryCode } from "~/shared/lib/categories";

export type RunOption = {
	readonly id: string;
	readonly label: string;
	readonly correct: boolean;
};
export type AnswerType = "single" | "multiple";

export type RunPoll = {
	readonly id: string;
	readonly category: CategoryCode;
	readonly question: string;
	readonly codeBlock?: string;
	readonly codeSandboxUrl?: string;
	readonly answerType: AnswerType;
	readonly options: readonly RunOption[];
	readonly explanation?: string;
};

/** Generic over id: the engine grades string ids, the community board numeric DB ones. */
type GradedPoll<Id> = {
	readonly answerType: AnswerType;
	readonly options: readonly { readonly id: Id; readonly correct: boolean }[];
};

const isCorrect = <Id>(
	poll: GradedPoll<Id>,
	picked: ReadonlySet<Id>
): boolean => {
	const correctIds = poll.options
		.filter((option) => option.correct)
		.map((option) => option.id);
	if (poll.answerType === "single")
		return picked.size === 1 && correctIds.some((id) => picked.has(id));
	return (
		correctIds.length === picked.size &&
		correctIds.every((id) => picked.has(id))
	);
};

export type AnswerOutcome = "correct" | "partial" | "wrong";

export const coverageShare = (
	poll: RunPoll,
	optionIds: readonly string[]
): number => {
	const picked = new Set(optionIds);
	if (isCorrect(poll, picked)) return 1;
	if (poll.answerType === "single") return 0;
	const correctIds = poll.options
		.filter((option) => option.correct)
		.map((option) => option.id);
	if (correctIds.length === 0) return 0;
	const correctPicked = correctIds.filter((id) => picked.has(id)).length;
	const wrongPicked = picked.size - correctPicked;
	return Math.max(
		0,
		Math.min(1, (correctPicked - wrongPicked) / correctIds.length)
	);
};

export const answerOutcome = <Id>(
	poll: GradedPoll<Id>,
	optionIds: Iterable<Id>
): AnswerOutcome => {
	const picked = new Set(optionIds);
	if (isCorrect(poll, picked)) return "correct";
	if (poll.answerType === "single") return "wrong";
	const pickedACorrectOption = poll.options.some(
		(option) => option.correct && picked.has(option.id)
	);
	return pickedACorrectOption ? "partial" : "wrong";
};

/** ADR-038. A poll with no wrong options is left alone: mirrored it would be unanswerable. */
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

/** Separate from `mirrorPoll` because the board's options carry different fields; only the grading shape is common. */
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
	readonly options?: readonly string[];
	readonly answerType?: AnswerType;
	readonly coverageEarned?: number;
	readonly coverageBreakdown?: CoverageBreakdown;
	readonly elapsedMs?: number;
	/** Scored as a miss whatever was picked, so the review can tell it from a genuine wrong. */
	readonly timedOut?: boolean;
};
