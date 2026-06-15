import { describe, it, expect, vi, beforeEach } from "vitest";

import * as pollQueries from "~/domains/polls/api/poll.queries";
import { createMockPoll } from "~/domains/polls/models/poll.mock";
import { createMockPollOption } from "~/domains/polls/models/pollOption.mock";
import * as runQueries from "~/domains/runs/api/run.queries";
import * as coverageQueries from "~/domains/runs/api/coverage.queries";
import * as windowQueries from "~/domains/runs/api/window.queries";
import * as pollResponseQueries from "~/domains/polls/api/pollResponse.queries";
import * as progressService from "~/domains/runs/services/progress.service";
import * as runCompletionService from "~/domains/runs/services/runCompletion.service";
import { createMockRun } from "~/domains/runs/models/run.mock";
import {
	getSlotDefinition,
	SLOT_REWARDS,
} from "~/domains/runs/data/pipelineSlots";
import * as configs from "~/domains/economy/data/configs";
import type { ApplyEffects } from "~/domains/economy/data/configs";
import type {
	PollScoreBreakdown,
	ScoreCalculation,
} from "~/domains/runs/services/score.service";

import { processTurn } from "./turn.service";

vi.mock("~/domains/polls/api/poll.queries", () => ({
	fetchPollByIdWithOptions: vi.fn(),
}));

vi.mock("~/domains/runs/api/run.queries", () => ({
	getActiveRunByUserId: vi.fn(),
	resetPollRerolls: vi.fn(),
	awardStorage: vi.fn(),
	savePendingUpgradeCards: vi.fn(),
	clearPendingUpgradeCards: vi.fn(),
}));

vi.mock("~/domains/runs/api/coverage.queries", () => ({
	incrementCorrectPollsCount: vi.fn(),
}));

vi.mock("~/domains/runs/api/window.queries", () => ({
	getWindowResults: vi.fn(),
}));

vi.mock("~/domains/polls/api/pollResponse.queries", () => ({
	createPollResponse: vi.fn(),
	getAnsweredPollsCountInRun: vi.fn(),
}));

vi.mock("~/domains/runs/services/progress.service", () => ({
	incrementRunProgress: vi.fn(),
}));

vi.mock("~/domains/runs/services/runCompletion.service", () => ({
	endRunForThresholdFailure: vi
		.fn()
		.mockResolvedValue({ runEnded: true, reason: "pipeline_failure" }),
}));

vi.mock("~/domains/economy/data/configs", () => ({
	applyEffects: vi.fn(),
}));

vi.mock("~/lib/dateUtils", () => ({
	getTodayDateString: vi.fn().mockReturnValue("2025-05-13"),
}));

vi.mock("~/domains/techDebt/services/handlePollAnswer.service", () => ({
	handlePollAnswerForTechDebt: vi.fn().mockResolvedValue({
		clearedTemplateIds: [],
	}),
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
	coverageContributingConfigIds: [],
	perConfigCoverageEffects: [],
};

const defaultInput = {
	pollId: BANJO_POLL_ID,
	userId: BANJO_USER_ID,
	selectedOptionIds: [correctOption.id],
};

describe("processTurn", () => {
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
		vi.mocked(pollResponseQueries.getAnsweredPollsCountInRun).mockResolvedValue(
			3
		);
		vi.mocked(windowQueries.getWindowResults).mockResolvedValue([]);
		vi.mocked(configs.applyEffects).mockReturnValue(mockEffects);
	});

	describe("no active run", () => {
		it("returns safe defaults without throwing", async () => {
			vi.mocked(runQueries.getActiveRunByUserId).mockResolvedValue(null);

			const result = await processTurn(defaultInput);

			expect(result.runId).toBeNull();
			expect(result.runEnded).toBe(false);
			expect(result.breakdown).toBeNull();
			expect(result.tryCatchUsed).toBe(false);
		});
	});

	describe("correct answer", () => {
		it("returns outcome full and does not end the run", async () => {
			const result = await processTurn(defaultInput);

			expect(result.outcome).toBe("full");
			expect(result.runEnded).toBe(false);
			expect(result.runId).toBe(1);
			expect(result.correctOptionIds).toEqual([correctOption.id]);
			expect(result.selectedOptionIds).toEqual([correctOption.id]);
		});

		it("increments correct polls count", async () => {
			await processTurn(defaultInput);

			expect(coverageQueries.incrementCorrectPollsCount).toHaveBeenCalledWith(
				1
			);
		});

		it("returns the score breakdown", async () => {
			const result = await processTurn(defaultInput);

			expect(result.breakdown).toEqual(mockBreakdown);
		});
	});

	describe("wrong answer", () => {
		it("does not end the run between gate checks", async () => {
			const result = await processTurn({
				...defaultInput,
				selectedOptionIds: [wrongOptions[0].id],
			});

			expect(result.runEnded).toBe(false);
			expect(
				runCompletionService.endRunForThresholdFailure
			).not.toHaveBeenCalled();
		});

		it("does not increment correct polls count", async () => {
			await processTurn({
				...defaultInput,
				selectedOptionIds: [wrongOptions[0].id],
			});

			expect(coverageQueries.incrementCorrectPollsCount).not.toHaveBeenCalled();
		});
	});

	describe("resetRebuild config effect", () => {
		it("resets rerolls when resetRebuild effect is active", async () => {
			vi.mocked(configs.applyEffects).mockReturnValue({
				...mockEffects,
				resetRebuild: true,
			});

			await processTurn(defaultInput);

			expect(runQueries.resetPollRerolls).toHaveBeenCalledWith(1);
		});
	});

	describe("pipeline evaluation", () => {
		const runWithSlot = createMockRun({
			id: 1,
			userId: BANJO_USER_ID,
			pipelineSlots: [getSlotDefinition("correct-answers", "low")!],
		});

		const windowWith3Correct = [
			{
				isCorrect: true,
				isWrong: false,
				coverageDelta: 1.2,
				categoryCode: "js" as const,
			},
			{
				isCorrect: true,
				isWrong: false,
				coverageDelta: 1.2,
				categoryCode: "js" as const,
			},
			{
				isCorrect: true,
				isWrong: false,
				coverageDelta: 1.2,
				categoryCode: "css" as const,
			},
			{
				isCorrect: false,
				isWrong: true,
				coverageDelta: -0.5,
				categoryCode: "css" as const,
			},
			{
				isCorrect: false,
				isWrong: false,
				coverageDelta: 0,
				categoryCode: "ts" as const,
			},
		];

		it("does not evaluate pipeline between windows", async () => {
			const result = await processTurn(defaultInput);

			expect(result.pipelineEvaluation).toBeNull();
			expect(result.upgradeCards).toHaveLength(0);
		});

		it("evaluates pipeline at window boundary and passes", async () => {
			vi.mocked(
				pollResponseQueries.getAnsweredPollsCountInRun
			).mockResolvedValue(5);
			vi.mocked(windowQueries.getWindowResults).mockResolvedValue(
				windowWith3Correct
			);
			vi.mocked(runQueries.getActiveRunByUserId).mockResolvedValue(runWithSlot);

			const result = await processTurn(defaultInput);

			expect(result.pipelineEvaluation).not.toBeNull();
			expect(result.pipelineEvaluation?.passed).toBe(true);
			expect(result.upgradeCards.length).toBeGreaterThan(0);
		});

		it("awards storage when pipeline passes", async () => {
			vi.mocked(
				pollResponseQueries.getAnsweredPollsCountInRun
			).mockResolvedValue(5);
			vi.mocked(windowQueries.getWindowResults).mockResolvedValue(
				windowWith3Correct
			);
			vi.mocked(runQueries.getActiveRunByUserId).mockResolvedValue(runWithSlot);

			await processTurn(defaultInput);

			expect(runQueries.awardStorage).toHaveBeenCalledWith(1, SLOT_REWARDS.low);
		});

		it("does not award storage when pipeline fails", async () => {
			vi.mocked(
				pollResponseQueries.getAnsweredPollsCountInRun
			).mockResolvedValue(5);
			vi.mocked(windowQueries.getWindowResults).mockResolvedValue(
				Array(5).fill({
					isCorrect: false,
					isWrong: true,
					coverageDelta: -0.5,
					categoryCode: "js" as const,
				})
			);
			vi.mocked(runQueries.getActiveRunByUserId).mockResolvedValue(runWithSlot);

			const result = await processTurn(defaultInput);

			expect(result.pipelineEvaluation?.passed).toBe(false);
			expect(runQueries.awardStorage).not.toHaveBeenCalled();
			expect(result.upgradeCards).toHaveLength(0);
		});

		it("includes an upgrade-slot card alongside add-slot cards when only one slot exists", async () => {
			vi.mocked(
				pollResponseQueries.getAnsweredPollsCountInRun
			).mockResolvedValue(5);
			vi.mocked(windowQueries.getWindowResults).mockResolvedValue(
				windowWith3Correct
			);
			vi.mocked(runQueries.getActiveRunByUserId).mockResolvedValue(runWithSlot);

			const result = await processTurn(defaultInput);

			expect(
				result.upgradeCards.filter((c) => c.kind === "add-slot").length
			).toBe(2);
			expect(
				result.upgradeCards.filter((c) => c.kind === "upgrade-slot").length
			).toBe(1);
		});

		it("ends the run when pipeline fails at a gate check", async () => {
			vi.mocked(
				pollResponseQueries.getAnsweredPollsCountInRun
			).mockResolvedValue(5);
			vi.mocked(windowQueries.getWindowResults).mockResolvedValue(
				Array(5).fill({
					isCorrect: false,
					isWrong: true,
					coverageDelta: -0.5,
					categoryCode: "js" as const,
				})
			);
			vi.mocked(runQueries.getActiveRunByUserId).mockResolvedValue(runWithSlot);

			const result = await processTurn(defaultInput);

			expect(result.runEnded).toBe(true);
			expect(
				runCompletionService.endRunForThresholdFailure
			).toHaveBeenCalledWith(1, [
				{
					gateTypeId: "correct-answers",
					difficulty: "low",
					requirement: { type: "correct-answers", count: 2 },
				},
			]);
		});

		it("does not end the run when pipeline fails but tryCatch is active", async () => {
			vi.mocked(
				pollResponseQueries.getAnsweredPollsCountInRun
			).mockResolvedValue(5);
			vi.mocked(windowQueries.getWindowResults).mockResolvedValue(
				Array(5).fill({
					isCorrect: false,
					isWrong: true,
					coverageDelta: -0.5,
					categoryCode: "js" as const,
				})
			);
			vi.mocked(runQueries.getActiveRunByUserId).mockResolvedValue(runWithSlot);
			vi.mocked(configs.applyEffects).mockReturnValue({
				...mockEffects,
				protection: { tryCatch: true },
			});

			const result = await processTurn(defaultInput);

			expect(result.runEnded).toBe(false);
			expect(result.tryCatchUsed).toBe(true);
			expect(
				runCompletionService.endRunForThresholdFailure
			).not.toHaveBeenCalled();
		});

		it("resets rerolls at every gate check", async () => {
			vi.mocked(
				pollResponseQueries.getAnsweredPollsCountInRun
			).mockResolvedValue(5);
			vi.mocked(windowQueries.getWindowResults).mockResolvedValue(
				windowWith3Correct
			);
			vi.mocked(runQueries.getActiveRunByUserId).mockResolvedValue(runWithSlot);

			await processTurn(defaultInput);

			expect(runQueries.resetPollRerolls).toHaveBeenCalledWith(1);
		});
	});
});
