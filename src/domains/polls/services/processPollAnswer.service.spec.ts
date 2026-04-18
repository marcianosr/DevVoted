import { describe, it, expect, vi, beforeEach } from "vitest";

import * as pollQueries from "~/domains/polls/api/queries";
import { createMockPoll } from "~/domains/polls/factories/poll";
import { createMockPollOption } from "~/domains/polls/factories/pollOption";
import * as runQueries from "~/domains/runs/api/queries";
import * as progressService from "~/domains/runs/services/progress.service";
import * as runCompletionService from "~/domains/runs/services/runCompletion.service";
import { createMockRun } from "~/domains/runs/models/run";
import {
	getSlotDefinition,
	SLOT_REWARDS,
} from "~/domains/runs/data/pipelineSlots";
import * as configs from "~/domains/configs/data/configs";
import type { ApplyEffects } from "~/domains/configs/data/configs";
import type {
	PollScoreBreakdown,
	ScoreCalculation,
} from "~/domains/score/services/score.service";

import { processPollAnswer } from "./processPollAnswer.service";

vi.mock("~/domains/polls/api/queries", () => ({
	fetchPollByIdWithOptions: vi.fn(),
	createPollResponse: vi.fn(),
	getPollsSeenInRun: vi.fn(),
	getAnsweredPollsCountInRun: vi.fn(),
	getWindowResults: vi.fn(),
}));

vi.mock("~/domains/runs/api/queries", () => ({
	getActiveRunByUserId: vi.fn(),
	incrementCorrectPollsCount: vi.fn(),
	resetPollRerolls: vi.fn(),
	awardStorage: vi.fn(),
	savePendingUpgradeCards: vi.fn(),
	clearPendingUpgradeCards: vi.fn(),
}));

vi.mock("~/domains/runs/services/progress.service", () => ({
	incrementRunProgress: vi.fn(),
}));

vi.mock("~/domains/runs/services/runCompletion.service", () => ({
	endRunForThresholdFailure: vi
		.fn()
		.mockResolvedValue({ runEnded: true, reason: "pipeline_failure" }),
}));

vi.mock("~/domains/configs/data/configs", () => ({
	applyEffects: vi.fn(),
}));

vi.mock("~/lib/dateUtils", () => ({
	getTodayDateString: vi.fn().mockReturnValue("2025-05-13"),
}));

// Banjo-Kazooie themed test data
const BANJO_POLL_ID = 64;
const BANJO_USER_ID = "b4nj0-k4z00ie-test-user-id";

const mockPoll = createMockPoll({
	id: BANJO_POLL_ID,
	question: "In Banjo-Kazooie, what does Mumbo Jumbo transform Banjo into?",
	categoryCode: "js",
	answerType: "single",
});

const correctOption = createMockPollOption({
	id: 1,
	pollId: BANJO_POLL_ID,
	option: "Termite",
	correct: true,
});
const wrongOptions = [
	createMockPollOption({
		id: 2,
		pollId: BANJO_POLL_ID,
		option: "Pumpkin",
		correct: false,
	}),
	createMockPollOption({
		id: 3,
		pollId: BANJO_POLL_ID,
		option: "Walrus",
		correct: false,
	}),
	createMockPollOption({
		id: 4,
		pollId: BANJO_POLL_ID,
		option: "Bee",
		correct: false,
	}),
];
const mockOptions = [correctOption, ...wrongOptions];

const mockBreakdown: PollScoreBreakdown = {
	streak: 1,
	earnedCoverage: 1.2,
	delta: 1.2,
	baseCoverage: 1.2,
	streakBonus: 0,
	configBonus: 0,
};

const mockScoreCalculation: ScoreCalculation = {
	breakdown: mockBreakdown,
	newStreak: 1,
	newBestStreak: 1,
	newPollsAnswered: 1,
	newTotalCoverage: 1.2,
};

const mockRun = createMockRun({ id: 1, userId: BANJO_USER_ID });

const mockEffects: ApplyEffects = {
	view: {
		poll: mockPoll,
		options: mockOptions,
		hasAnswered: true,
		run: mockRun,
	},
	renderProps: {},
	coverage: {},
	meta: {},
	storage: {},
	protection: { tryCatch: false },
	reductionCost: 0,
	resetRebuild: false,
	extraSlot: false,
	countCorrect: false,
	showCorrectCount: false,
	showWhoPickedWhat: false,
	lockShop: false,
	showNextConfigs: false,
	exposeConfigDeck: false,
};

const defaultInput = {
	pollId: BANJO_POLL_ID,
	userId: BANJO_USER_ID,
	selectedOptionIds: [correctOption.id],
};

describe("processPollAnswer", () => {
	beforeEach(() => {
		vi.clearAllMocks();

		vi.mocked(pollQueries.fetchPollByIdWithOptions).mockResolvedValue({
			poll: mockPoll,
			options: mockOptions,
		});
		vi.mocked(runQueries.getActiveRunByUserId).mockResolvedValue(
			createMockRun({ id: 1, userId: BANJO_USER_ID })
		);
		vi.mocked(progressService.incrementRunProgress).mockResolvedValue(
			mockScoreCalculation
		);
		vi.mocked(pollQueries.getAnsweredPollsCountInRun).mockResolvedValue(3);
		vi.mocked(pollQueries.getWindowResults).mockResolvedValue([]);
		vi.mocked(configs.applyEffects).mockReturnValue(mockEffects);
	});

	describe("no active run", () => {
		it("returns safe defaults without throwing", async () => {
			vi.mocked(runQueries.getActiveRunByUserId).mockResolvedValue(null);

			const result = await processPollAnswer(defaultInput);

			expect(result.runId).toBeNull();
			expect(result.runEnded).toBe(false);
			expect(result.breakdown).toBeNull();
			expect(result.tryCatchUsed).toBe(false);
		});
	});

	describe("correct answer", () => {
		it("returns outcome full and does not end the run", async () => {
			const result = await processPollAnswer(defaultInput);

			expect(result.outcome).toBe("full");
			expect(result.runEnded).toBe(false);
			expect(result.runId).toBe(1);
			expect(result.correctOptionIds).toEqual([correctOption.id]);
			expect(result.selectedOptionIds).toEqual([correctOption.id]);
		});

		it("increments correct polls count", async () => {
			await processPollAnswer(defaultInput);

			expect(runQueries.incrementCorrectPollsCount).toHaveBeenCalledWith(1);
		});

		it("returns the score breakdown", async () => {
			const result = await processPollAnswer(defaultInput);

			expect(result.breakdown).toEqual(mockBreakdown);
		});
	});

	describe("wrong answer", () => {
		it("does not end the run between gate checks", async () => {
			// Default: answered 3 polls, window is 5 — no gate check fires
			const result = await processPollAnswer({
				...defaultInput,
				selectedOptionIds: [wrongOptions[0].id],
			});

			expect(result.runEnded).toBe(false);
			expect(
				runCompletionService.endRunForThresholdFailure
			).not.toHaveBeenCalled();
		});

		it("does not increment correct polls count", async () => {
			await processPollAnswer({
				...defaultInput,
				selectedOptionIds: [wrongOptions[0].id],
			});

			expect(runQueries.incrementCorrectPollsCount).not.toHaveBeenCalled();
		});
	});

	describe("resetRebuild config effect", () => {
		it("resets rerolls when resetRebuild effect is active", async () => {
			vi.mocked(configs.applyEffects).mockReturnValue({
				...mockEffects,
				resetRebuild: true,
			});

			await processPollAnswer(defaultInput);

			expect(runQueries.resetPollRerolls).toHaveBeenCalledWith(1);
		});
	});

	describe("pipeline evaluation", () => {
		const runWithSlot = createMockRun({
			id: 1,
			userId: BANJO_USER_ID,
			pipelineSlots: [getSlotDefinition("correct-answers", "easy")], // needs 3/5
		});

		// 3 correct, 1 wrong, 1 partial — meets the easy correct-answers requirement
		const windowWith3Correct = [
			{ isCorrect: true, isWrong: false },
			{ isCorrect: true, isWrong: false },
			{ isCorrect: true, isWrong: false },
			{ isCorrect: false, isWrong: true },
			{ isCorrect: false, isWrong: false },
		];

		it("does not evaluate pipeline between windows", async () => {
			// Default: getAnsweredPollsCountInRun returns 3, windowSize 5 → 3 % 5 ≠ 0
			const result = await processPollAnswer(defaultInput);

			expect(result.pipelineEvaluation).toBeNull();
			expect(result.upgradeCards).toHaveLength(0);
			expect(pollQueries.getWindowResults).not.toHaveBeenCalled();
		});

		it("evaluates pipeline at window boundary and passes", async () => {
			vi.mocked(pollQueries.getAnsweredPollsCountInRun).mockResolvedValue(5);
			vi.mocked(pollQueries.getWindowResults).mockResolvedValue(
				windowWith3Correct
			);
			vi.mocked(runQueries.getActiveRunByUserId).mockResolvedValue(runWithSlot);

			const result = await processPollAnswer(defaultInput);

			expect(result.pipelineEvaluation).not.toBeNull();
			expect(result.pipelineEvaluation?.passed).toBe(true);
			expect(result.upgradeCards.length).toBeGreaterThan(0);
		});

		it("awards storage when pipeline passes", async () => {
			vi.mocked(pollQueries.getAnsweredPollsCountInRun).mockResolvedValue(5);
			vi.mocked(pollQueries.getWindowResults).mockResolvedValue(
				windowWith3Correct
			);
			vi.mocked(runQueries.getActiveRunByUserId).mockResolvedValue(runWithSlot);

			await processPollAnswer(defaultInput);

			expect(runQueries.awardStorage).toHaveBeenCalledWith(
				1,
				SLOT_REWARDS.easy
			);
		});

		it("does not award storage when pipeline fails", async () => {
			vi.mocked(pollQueries.getAnsweredPollsCountInRun).mockResolvedValue(5);
			vi.mocked(pollQueries.getWindowResults).mockResolvedValue(
				// Only 2 correct — fails easy correct-answers (needs 3)
				Array(5).fill({ isCorrect: false, isWrong: true })
			);
			vi.mocked(runQueries.getActiveRunByUserId).mockResolvedValue(runWithSlot);

			const result = await processPollAnswer(defaultInput);

			expect(result.pipelineEvaluation?.passed).toBe(false);
			expect(runQueries.awardStorage).not.toHaveBeenCalled();
			expect(result.upgradeCards).toHaveLength(0);
		});

		it("includes an upgrade-slot card alongside add-slot cards when only one slot exists", async () => {
			vi.mocked(pollQueries.getAnsweredPollsCountInRun).mockResolvedValue(5);
			vi.mocked(pollQueries.getWindowResults).mockResolvedValue(
				windowWith3Correct
			);
			vi.mocked(runQueries.getActiveRunByUserId).mockResolvedValue(runWithSlot);

			const result = await processPollAnswer(defaultInput);

			expect(
				result.upgradeCards.filter((c) => c.kind === "add-slot").length
			).toBe(2);
			expect(
				result.upgradeCards.filter((c) => c.kind === "upgrade-slot").length
			).toBe(1);
		});

		it("ends the run when pipeline fails at a gate check", async () => {
			vi.mocked(pollQueries.getAnsweredPollsCountInRun).mockResolvedValue(5);
			vi.mocked(pollQueries.getWindowResults).mockResolvedValue(
				Array(5).fill({ isCorrect: false, isWrong: true }) // 0/5 correct — fails
			);
			vi.mocked(runQueries.getActiveRunByUserId).mockResolvedValue(runWithSlot);

			const result = await processPollAnswer(defaultInput);

			expect(result.runEnded).toBe(true);
			expect(
				runCompletionService.endRunForThresholdFailure
			).toHaveBeenCalledWith(1, [
				{ gateTypeId: "correct-answers", difficulty: "easy" },
			]);
		});

		it("does not end the run when pipeline fails but tryCatch is active", async () => {
			vi.mocked(pollQueries.getAnsweredPollsCountInRun).mockResolvedValue(5);
			vi.mocked(pollQueries.getWindowResults).mockResolvedValue(
				Array(5).fill({ isCorrect: false, isWrong: true })
			);
			vi.mocked(runQueries.getActiveRunByUserId).mockResolvedValue(runWithSlot);
			vi.mocked(configs.applyEffects).mockReturnValue({
				...mockEffects,
				protection: { tryCatch: true },
			});

			const result = await processPollAnswer(defaultInput);

			expect(result.runEnded).toBe(false);
			expect(result.tryCatchUsed).toBe(true);
			expect(
				runCompletionService.endRunForThresholdFailure
			).not.toHaveBeenCalled();
		});

		it("resets rerolls at every gate check", async () => {
			vi.mocked(pollQueries.getAnsweredPollsCountInRun).mockResolvedValue(5);
			vi.mocked(pollQueries.getWindowResults).mockResolvedValue(
				windowWith3Correct
			);
			vi.mocked(runQueries.getActiveRunByUserId).mockResolvedValue(runWithSlot);

			await processPollAnswer(defaultInput);

			expect(runQueries.resetPollRerolls).toHaveBeenCalledWith(1);
		});
	});
});
