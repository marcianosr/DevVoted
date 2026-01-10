import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { createMockPoll } from "~/domains/polls/factories/poll";
import { createPollOption } from "~/domains/polls/models/pollOption";
import { createMockRun } from "~/domains/runs/models/run";
import { createMockRunCategoryCoverage } from "~/domains/runs/models/runCategoryCoverage";
import * as thresholdService from "~/domains/runs/services/thresholdCalculator.service";

import { configs, applyEffects, EffectRenderProps } from "./configs";

vi.mock("~/domains/runs/services/thresholdCalculator.service", () => ({
	calculateThresholdInfo: vi.fn(),
}));

// TODO: Split up to make more readable
describe("configs", () => {
	describe("config definitions", () => {
		it("contains all expected configs", () => {
			const configIds = configs.map((c) => c.id);
			expect(configIds).toContain("eslint-config");
			expect(configIds).toContain(".html-config");
			expect(configIds).toContain(".css-config");
			expect(configIds).toContain(".js-config");
			expect(configIds).toContain(".ts-config");
			expect(configIds).toContain(".jsx-config");
			expect(configIds).toContain(".git-config");
			expect(configIds).toContain("package.json-config");
			expect(configIds).toContain("code-coverage-config");
			expect(configIds).toContain("math-random-config");
			expect(configIds).toContain("deflate-config");
			expect(configIds).toContain("hot-reload-config");
		});

		it("has valid properties for ESLint config", () => {
			const eslintConfig = configs.find((c) => c.id === "eslint-config");
			expect(eslintConfig).toBeDefined();
			expect(eslintConfig?.name).toBe("ESLint");
			expect(eslintConfig?.effect).toEqual(["disableWrongOptions"]);
			expect(eslintConfig?.rarity).toBe("uncommon");
			expect(eslintConfig?.cost).toBeGreaterThan(0);
		});

		it("has valid properties for 'file extension' configs", () => {
			const jsConfig = configs.find((c) => c.id === ".js-config");
			expect(jsConfig).toBeDefined();
			expect(jsConfig?.effect).toEqual(["streakAmp"]);
			expect(jsConfig?.rarity).toBe("common");
			expect(jsConfig?.description).toContain("+2% coverage");
			expect(jsConfig?.priority).toBe(100);

			const tsConfig = configs.find((c) => c.id === ".ts-config");
			expect(tsConfig).toBeDefined();
			expect(tsConfig?.effect).toEqual(["streakAmp"]);
			expect(tsConfig?.description).toContain("TypeScript");
			expect(tsConfig?.priority).toBe(100);
			expect(tsConfig?.targetCategories).toEqual(["ts"]);
			expect(tsConfig?.targetCategories).not.toEqual(["js"]);
			expect(tsConfig?.coverageBonus).toBe(2);
		});

		it("has valid properties for code coverage config", () => {
			const codeCoverageConfig = configs.find(
				(c) => c.id === "code-coverage-config"
			);
			expect(codeCoverageConfig).toBeDefined();
			expect(codeCoverageConfig?.name).toBe("Code Coverage");
			expect(codeCoverageConfig?.effect).toEqual(["streakAmp"]);
			expect(codeCoverageConfig?.rarity).toBe("common");
			expect(codeCoverageConfig?.description).toContain(
				"+0.5% coverage polls for every poll answered"
			);
			expect(codeCoverageConfig?.targetCategories).toEqual([]);
			expect(codeCoverageConfig?.coverageBonus).toBe(0.5);
		});

		it("has valid properties for math random config", () => {
			const mathConfig = configs.find((c) => c.id === "math-random-config");
			expect(mathConfig).toBeDefined();
			expect(mathConfig?.name).toBe("Math Random");
			expect(mathConfig?.effect).toEqual(["randomStreakAmp"]);
			expect(mathConfig?.rarity).toBe("rare");
			expect(mathConfig?.description).toContain(
				"code coverage value between -5 and +5 every poll"
			);
		});

		it("has valid properties for deflate config", () => {
			const deflateConfig = configs.find((c) => c.id === "deflate-config");
			expect(deflateConfig).toBeDefined();
			expect(deflateConfig?.name).toBe("Deflate");
			expect(deflateConfig?.effect).toEqual(["reduceConfigCost"]);
			expect(deflateConfig?.rarity).toBe("uncommon");
			expect(deflateConfig?.description).toContain(
				"Reduces the cost of all configs by 10%"
			);
			expect(deflateConfig?.reductionCost).toBe(0.1);
			expect(deflateConfig?.priority).toBe(50);
		});

		it("has valid properties for hot reload config", () => {
			const hotReloadConfig = configs.find((c) => c.id === "hot-reload-config");
			expect(hotReloadConfig).toBeDefined();
			expect(hotReloadConfig?.name).toBe("Hot Reload");
			expect(hotReloadConfig?.effect).toEqual(["resetRebuild"]);
			expect(hotReloadConfig?.rarity).toBe("rare");
			expect(hotReloadConfig?.description).toContain(
				"Allow rebuilds to reset after every poll"
			);
			expect(hotReloadConfig?.priority).toBe(50);
		});

		it("has valid properties for .includes config", () => {
			const includesConfig = configs.find((c) => c.id === "includes-config");
			expect(includesConfig).toBeDefined();
			expect(includesConfig?.name).toBe(".includes");
			expect(includesConfig?.effect).toEqual(["showCorrectOnMultipleChoice"]);
			expect(includesConfig?.rarity).toBe("rare");
			expect(includesConfig?.description).toContain(
				"at least one correct answer"
			);
			expect(includesConfig?.priority).toBe(100);
		});

		it("has valid properties for telemetry config", () => {
			const telemetryConfig = configs.find((c) => c.id === "telemetry-config");
			expect(telemetryConfig).toBeDefined();
			expect(telemetryConfig?.name).toBe("Telemetry");
			expect(telemetryConfig?.effect).toEqual(["showWhoPickedWhat"]);
			expect(telemetryConfig?.rarity).toBe("uncommon");
			expect(telemetryConfig?.description).toContain(
				"Show an answer chosen by another player"
			);
			expect(telemetryConfig?.priority).toBe(100);
		});

		it.todo("has valid properties for try/catch config", () => {
			const tryCatchConfig = configs.find((c) => c.id === "try-catch-config");
			expect(tryCatchConfig).toBeDefined();
			expect(tryCatchConfig?.name).toBe("Try/Catch");
			expect(tryCatchConfig?.effect).toEqual(["checkCoverageWithThreshold"]);
			expect(tryCatchConfig?.rarity).toBe("rare");
			expect(tryCatchConfig?.description).toContain(
				"Saves your run when you have at least 80% of the coverage threshold"
			);
		});
	});

	describe("applyEffects", () => {
		it("returns base view with empty renderProps when no configs provided", () => {
			const mockPoll = createMockPoll({
				categoryCode: "js",
			});
			const mockRun = createMockRun({
				activeConfigIds: [],
			});

			const base = {
				poll: mockPoll,
				options: [],
				run: mockRun,
				hasAnswered: false,
			};

			const result = applyEffects(base, mockRun.activeConfigIds);

			expect(result.view).toEqual(base);
			expect(result.renderProps).toEqual({});
			expect(result.coverage).toEqual({});
			expect(result.meta).toEqual({});
		});

		it("returns base view when provided config IDs don't exist", () => {
			const mockPoll = createMockPoll({
				categoryCode: "js",
			});
			const mockRun = createMockRun({
				activeConfigIds: ["nonexistent-config"],
			});
			const base = {
				poll: mockPoll,
				options: [],
				run: mockRun,
				hasAnswered: false,
			};

			const result = applyEffects(base, mockRun.activeConfigIds);

			expect(result.view).toEqual(base);
			expect(result.renderProps).toEqual({});
			expect(result.coverage).toEqual({});
			expect(result.meta).toEqual({});
		});

		it("returns props for ESLint config", () => {
			const mockPoll = createMockPoll({
				categoryCode: "js",
			});
			const mockRun = createMockRun({
				activeConfigIds: ["eslint-config"],
			});

			const base = {
				poll: mockPoll,
				options: [
					{
						id: 1,
						option: "On cinnabar island",
						correct: true,
						pollId: 1,
					},
					{
						id: 2,
						option: "On the SS Anne",
						correct: false,
						pollId: 1,
					},
				],
				run: mockRun,
				hasAnswered: false,
			};

			const result = applyEffects(base, mockRun.activeConfigIds);

			expect(result.view).toEqual(base);
			expect(result.renderProps).toEqual({
				disabledOptionIds: [2],
			});
			expect(result.meta).toEqual({
				notes: ["Hid wrong options"],
			});
		});
	});

	describe("disableWrongOptions effect", () => {
		it("disables one random wrong option", () => {
			const mockPoll = createMockPoll({
				categoryCode: "js",
			});
			const mockRun = createMockRun();
			const options = [
				createPollOption({
					id: 1,
					option: "Gunship",
					correct: true,
					pollId: 1,
				}),
				createPollOption({
					id: 2,
					option: "Falcon",
					correct: false,
					pollId: 1,
				}),
				createPollOption({
					id: 3,
					option: "Arwing",
					correct: false,
					pollId: 1,
				}),
				createPollOption({
					id: 4,
					option: "Blue Falcon",
					correct: false,
					pollId: 1,
				}),
			];
			const base = {
				poll: mockPoll,
				options,
				run: mockRun,
				hasAnswered: false,
			};

			const result = applyEffects(base, ["eslint-config"]);

			expect(result.view).toEqual(base);
			expect(result.renderProps.disabledOptionIds).toHaveLength(1);
			expect(result.renderProps.disabledOptionIds?.[0]).toBeOneOf([2, 3, 4]);
			expect(result.meta.notes).toEqual(["Hid wrong options"]);

			const disabledId = result.renderProps.disabledOptionIds?.[0];
			const disabledOption = options.find((o) => o.id === disabledId);
			expect(disabledOption?.correct).toBe(false);
		});

		it("handles polls with no wrong options gracefully", () => {
			const mockPoll = createMockPoll({
				categoryCode: "js",
			});
			const mockRun = createMockRun();
			const options = [
				createPollOption({
					id: 1,
					option: "Hyrule",
					correct: true,
					pollId: 1,
				}),
			];
			const base = {
				poll: mockPoll,
				options,
				run: mockRun,
				hasAnswered: false,
			};

			const result = applyEffects(base, ["eslint-config"]);

			// No disabledOptionIds property when there are no wrong options to disable
			expect(result.renderProps.disabledOptionIds).toBeUndefined();
			expect(result.meta.notes).toEqual(["Hid wrong options"]);
		});

		it("handles polls with all wrong options", () => {
			const mockPoll = createMockPoll({
				categoryCode: "js",
			});
			const mockRun = createMockRun();
			const options = [
				createPollOption({
					id: 1,
					option: "Saffron",
					correct: false,
					pollId: 1,
				}),
				createPollOption({
					id: 2,
					option: "Vermillion",
					correct: false,
					pollId: 1,
				}),
				createPollOption({
					id: 3,
					option: "Cerulean",
					correct: false,
					pollId: 1,
				}),
			];
			const base = {
				poll: mockPoll,
				options,
				run: mockRun,
				hasAnswered: false,
			};

			const result = applyEffects(base, ["eslint-config"]);

			expect(result.renderProps.disabledOptionIds).toHaveLength(1);
			expect(result.renderProps.disabledOptionIds?.[0]).toBeOneOf([1, 2, 3]);
			expect(result.meta.notes).toEqual(["Hid wrong options"]);
		});

		it("merges disabled options from multiple ESLint configs", () => {
			const mockPoll = createMockPoll({
				categoryCode: "js",
			});
			const mockRun = createMockRun();
			const options = [
				createPollOption({
					id: 1,
					option: "Sheldon Cooper",
					correct: true,
					pollId: 1,
				}),
				createPollOption({
					id: 2,
					option: "Leonard Hofstadter",
					correct: false,
					pollId: 1,
				}),
				createPollOption({
					id: 3,
					option: "Howard Wolowitz",
					correct: false,
					pollId: 1,
				}),
			];
			const base = {
				poll: mockPoll,
				options,
				run: mockRun,
				hasAnswered: false,
			};

			// Test with multiple ESLint configs
			const result = applyEffects(base, ["eslint-config", "eslint-config"]);

			// Should merge the disabled options (could be 1 or 2 depending on randomness)
			expect(
				result.renderProps.disabledOptionIds?.length
			).toBeGreaterThanOrEqual(1);
			expect(result.renderProps.disabledOptionIds?.length).toBeLessThanOrEqual(
				2
			);
			expect(result.meta.notes?.length).toBe(2); // Two "Hid wrong options" messages
		});

		it("doesn't disable options when holding eslint config but the category isn't js or ts", () => {
			const mockPoll = createMockPoll({
				categoryCode: "html",
			});

			const mockRun = createMockRun({
				activeConfigIds: ["eslint-config"],
			});

			const base = {
				poll: mockPoll,
				options: [],
				run: mockRun,
				hasAnswered: false,
			};

			const result = applyEffects(base, mockRun.activeConfigIds);

			expect(result.view).toEqual(base);
			expect(result.renderProps).toEqual({});
			expect(result.coverage).toEqual({
				coverageAdd: 0,
				coverageMult: 1,
			});
			expect(result.meta).toEqual({
				notes: ["No wrong options to hide"],
			});
		});
	});

	describe("streakAmp effect", () => {
		it("adds 2% coverage bonus when the poll category matches the config", () => {
			const mockPoll = createMockPoll({
				categoryCode: "js",
			});
			const mockRun = createMockRun({
				activeConfigIds: [".js"],
			});
			const base = {
				poll: mockPoll,
				options: [],
				run: mockRun,
				hasAnswered: false,
			};

			const result = applyEffects(base, [".js-config"]);

			expect(result.view).toEqual(base);
			expect(result.renderProps.coverageBonus).toBe(2);
			expect(result.coverage.coverageAdd).toBe(2);
			expect(result.meta.notes).toEqual(["+2 amp for js polls"]);
		});

		it("applies multiple streak amp effects with same poll category when the player has multiple streakAmp", () => {
			const mockPoll = createMockPoll({
				categoryCode: "css",
			});
			const mockRun = createMockRun({
				activeConfigIds: [".css", ".js", ".html"],
			});
			const base = {
				poll: mockPoll,
				options: [],
				run: mockRun,
				hasAnswered: false,
			};

			// Apply multiple streak amp configs
			const result = applyEffects(base, [
				".css-config",
				".js-config",
				".html-config",
			]);

			// Only .css config should apply to css polls
			expect(result.renderProps.coverageBonus).toBe(2);
			expect(result.coverage.coverageAdd).toBe(2);
			expect(result.meta.notes).toEqual(["+2 amp for css polls"]);
		});

		it("doesn't apply streak amp effects when the poll category doesn't match", () => {
			const mockPoll = createMockPoll({
				categoryCode: "html",
			});
			const mockRun = createMockRun({
				activeConfigIds: [".css", ".js"],
			});
			const base = {
				poll: mockPoll,
				options: [],
				run: mockRun,
				hasAnswered: false,
			};

			const result = applyEffects(base, [".css-config", ".js-config"]);

			expect(result.renderProps.coverageBonus).toBeUndefined();
			expect(result.coverage.coverageAdd).toBe(0);
			expect(result.meta.notes).toEqual([]);
		});
	});

	describe("randomStreakAmp effect", () => {
		beforeEach(() => {
			vi.spyOn(Math, "random");
		});

		afterEach(() => {
			vi.restoreAllMocks();
		});

		it("adds random amp bonus between -5 and +5, rounded to 1 decimal", () => {
			// (0.5 - 0.5) = 0, rounds to 0
			// (0.2 - 0.5) = -0.3, rounds to -0.3
			// (0.8 - 0.5) = +0.3, rounds to +0.3
			vi.mocked(Math.random).mockReturnValue(0.8);
			const mockPoll = createMockPoll({
				categoryCode: "js",
			});
			const mockRun = createMockRun();
			const base = {
				poll: mockPoll,
				options: [],
				run: mockRun,
				hasAnswered: false,
			};

			const result = applyEffects(base, ["math-random-config"]);

			expect(result.view).toEqual(base);
			expect(result.renderProps.coverageBonus).toBe(3);
			expect(result.meta.notes).toEqual([
				"Random code coverage bonus for js polls",
			]);
		});

		it("can yield negative amp", () => {
			vi.mocked(Math.random).mockReturnValue(0); // (0 - 0.5) = -0.5

			const mockPoll = createMockPoll({
				categoryCode: "js",
			});
			const mockRun = createMockRun();
			const base = {
				poll: mockPoll,
				options: [],
				run: mockRun,
				hasAnswered: false,
			};

			const result = applyEffects(base, ["math-random-config"]);

			expect(result.view).toEqual(base);
			expect(result.renderProps.coverageBonus).toBe(-5); // -5 raw value
			expect(result.meta.notes).toEqual([
				"Random code coverage bonus for js polls",
			]);
		});
	});

	describe("reduceConfigCost effect", () => {
		it("returns 10% cost reduction", () => {
			const mockPoll = createMockPoll({
				categoryCode: "js",
			});
			const mockRun = createMockRun();
			const base = {
				poll: mockPoll,
				options: [],
				run: mockRun,
				hasAnswered: false,
			};

			const result = applyEffects(base, ["deflate-config"]);

			expect(result.view).toEqual(base);
			expect(result.reductionCost).toBe(0.1);
			expect(result.meta.notes).toEqual(["Shop items cost 10% less!"]);
		});

		it("works independently without affecting other properties", () => {
			const mockPoll = createMockPoll({
				categoryCode: "react",
			});
			const mockRun = createMockRun();
			const base = {
				poll: mockPoll,
				options: [],
				run: mockRun,
				hasAnswered: false,
			};

			const result = applyEffects(base, ["deflate-config"]);

			expect(result.view).toEqual(base);
			expect(result.renderProps).toEqual({});
			expect(result.coverage).toEqual({
				coverageAdd: 0,
				coverageMult: 1,
			});
			expect(result.reductionCost).toBe(0.1);
			expect(result.resetRebuild).toBe(false);
			expect(result.protection.tryCatch).toBe(false);
		});

		it("applies regardless of poll category", () => {
			const mockPoll = createMockPoll({
				categoryCode: "html",
			});
			const mockRun = createMockRun();
			const base = {
				poll: mockPoll,
				options: [],
				run: mockRun,
				hasAnswered: false,
			};

			const result = applyEffects(base, ["deflate-config"]);

			expect(result.reductionCost).toBe(0.1);
			expect(result.meta.notes).toEqual(["Shop items cost 10% less!"]);
		});
	});

	describe("resetRebuild effect", () => {
		it("returns resetRebuild as true", () => {
			const mockPoll = createMockPoll({
				categoryCode: "ts",
			});
			const mockRun = createMockRun();
			const base = {
				poll: mockPoll,
				options: [],
				run: mockRun,
				hasAnswered: false,
			};

			const result = applyEffects(base, ["hot-reload-config"]);

			expect(result.view).toEqual(base);
			expect(result.resetRebuild).toBe(true);
			expect(result.meta.notes).toEqual([
				"Rebuilds will reset after every poll",
			]);
		});

		it("works independently without affecting other properties", () => {
			const mockPoll = createMockPoll({
				categoryCode: "css",
			});
			const mockRun = createMockRun();
			const base = {
				poll: mockPoll,
				options: [],
				run: mockRun,
				hasAnswered: false,
			};

			const result = applyEffects(base, ["hot-reload-config"]);

			expect(result.view).toEqual(base);
			expect(result.renderProps).toEqual({});
			expect(result.coverage).toEqual({
				coverageAdd: 0,
				coverageMult: 1,
			});
			// expect(result.reductionCost).toBe(0);
			expect(result.resetRebuild).toBe(true);
			expect(result.protection.tryCatch).toBe(false);
		});

		it("applies regardless of poll category", () => {
			const mockPoll = createMockPoll({
				categoryCode: "git",
			});
			const mockRun = createMockRun();
			const base = {
				poll: mockPoll,
				options: [],
				run: mockRun,
				hasAnswered: false,
			};

			const result = applyEffects(base, ["hot-reload-config"]);

			expect(result.resetRebuild).toBe(true);
			expect(result.meta.notes).toEqual([
				"Rebuilds will reset after every poll",
			]);
		});
	});

	describe("showCorrectOnMultipleChoice effect (.includes config)", () => {
		it("returns countCorrect true for multiple choice polls with correct options", () => {
			const mockPoll = createMockPoll({
				categoryCode: "js",
				answerType: "multiple",
			});
			const mockRun = createMockRun();
			const options = [
				createPollOption({
					id: 1,
					option: "Banjo",
					correct: true,
					pollId: 1,
				}),
				createPollOption({
					id: 2,
					option: "Kazooie",
					correct: true,
					pollId: 1,
				}),
				createPollOption({
					id: 3,
					option: "Gruntilda",
					correct: false,
					pollId: 1,
				}),
			];
			const base = {
				poll: mockPoll,
				options,
				run: mockRun,
				hasAnswered: false,
			};

			const result = applyEffects(base, ["includes-config"]);

			expect(result.countCorrect).toBe(true);
			expect(result.meta.notes).toContain(
				"Will show correct answers on multiple choice polls"
			);
		});

		it("returns countCorrect false for single choice polls", () => {
			const mockPoll = createMockPoll({
				categoryCode: "js",
				answerType: "single",
			});
			const mockRun = createMockRun();
			const options = [
				createPollOption({
					id: 1,
					option: "Pikachu",
					correct: true,
					pollId: 1,
				}),
				createPollOption({
					id: 2,
					option: "Charizard",
					correct: false,
					pollId: 1,
				}),
			];
			const base = {
				poll: mockPoll,
				options,
				run: mockRun,
				hasAnswered: false,
			};

			const result = applyEffects(base, ["includes-config"]);

			expect(result.countCorrect).toBe(false);
			expect(result.meta.notes).toContain("Not a multiple choice poll");
		});

		it("returns countCorrect false for multiple choice polls with no correct options", () => {
			const mockPoll = createMockPoll({
				categoryCode: "css",
				answerType: "multiple",
			});
			const mockRun = createMockRun();
			const options = [
				createPollOption({
					id: 1,
					option: "Bottles",
					correct: false,
					pollId: 1,
				}),
				createPollOption({
					id: 2,
					option: "Mumbo Jumbo",
					correct: false,
					pollId: 1,
				}),
			];
			const base = {
				poll: mockPoll,
				options,
				run: mockRun,
				hasAnswered: false,
			};

			const result = applyEffects(base, ["includes-config"]);

			expect(result.countCorrect).toBe(false);
		});

		it("works regardless of poll category", () => {
			const mockPoll = createMockPoll({
				categoryCode: "html",
				answerType: "multiple",
			});
			const mockRun = createMockRun();
			const options = [
				createPollOption({
					id: 1,
					option: "Jinjo",
					correct: true,
					pollId: 1,
				}),
			];
			const base = {
				poll: mockPoll,
				options,
				run: mockRun,
				hasAnswered: false,
			};

			const result = applyEffects(base, ["includes-config"]);

			expect(result.countCorrect).toBe(true);
		});

		it("combines with other effects like streakAmp", () => {
			const mockPoll = createMockPoll({
				categoryCode: "js",
				answerType: "multiple",
			});
			const mockRun = createMockRun();
			const options = [
				createPollOption({
					id: 1,
					option: "Tooty",
					correct: true,
					pollId: 1,
				}),
				createPollOption({
					id: 2,
					option: "Klungo",
					correct: false,
					pollId: 1,
				}),
			];
			const base = {
				poll: mockPoll,
				options,
				run: mockRun,
				hasAnswered: false,
			};

			const result = applyEffects(base, ["includes-config", ".js-config"]);

			expect(result.countCorrect).toBe(true);
			expect(result.coverage.coverageAdd).toBe(2);
			expect(result.meta.notes).toContain(
				"Will show correct answers on multiple choice polls"
			);
			expect(result.meta.notes).toContain("+2 amp for js polls");
		});
	});

	describe("showWhoPickedWhat effect (telemetry config)", () => {
		it("returns showWhoPickedWhat true when config is active", () => {
			const mockPoll = createMockPoll({
				categoryCode: "js",
			});
			const mockRun = createMockRun();
			const options = [
				createPollOption({
					id: 1,
					option: "Jinjo",
					correct: true,
					pollId: 1,
				}),
				createPollOption({
					id: 2,
					option: "Jiggy",
					correct: false,
					pollId: 1,
				}),
			];
			const base = {
				poll: mockPoll,
				options,
				run: mockRun,
				hasAnswered: false,
			};

			const result = applyEffects(base, ["telemetry-config"]);

			expect(result.showWhoPickedWhat).toBe(true);
			expect(result.meta.notes).toContain("Will show answers chosen by others");
		});

		it("works regardless of poll category", () => {
			const mockPoll = createMockPoll({
				categoryCode: "html",
			});
			const mockRun = createMockRun();
			const base = {
				poll: mockPoll,
				options: [],
				run: mockRun,
				hasAnswered: false,
			};

			const result = applyEffects(base, ["telemetry-config"]);

			expect(result.showWhoPickedWhat).toBe(true);
		});

		it("works regardless of answer type", () => {
			const mockPollSingle = createMockPoll({
				categoryCode: "css",
				answerType: "single",
			});
			const mockPollMultiple = createMockPoll({
				categoryCode: "css",
				answerType: "multiple",
			});
			const mockRun = createMockRun();

			const resultSingle = applyEffects(
				{ poll: mockPollSingle, options: [], run: mockRun, hasAnswered: false },
				["telemetry-config"]
			);
			const resultMultiple = applyEffects(
				{
					poll: mockPollMultiple,
					options: [],
					run: mockRun,
					hasAnswered: false,
				},
				["telemetry-config"]
			);

			expect(resultSingle.showWhoPickedWhat).toBe(true);
			expect(resultMultiple.showWhoPickedWhat).toBe(true);
		});

		it("combines with other effects like disableWrongOptions", () => {
			const mockPoll = createMockPoll({
				categoryCode: "js",
			});
			const mockRun = createMockRun();
			const options = [
				createPollOption({
					id: 1,
					option: "Banjo",
					correct: true,
					pollId: 1,
				}),
				createPollOption({
					id: 2,
					option: "Gruntilda",
					correct: false,
					pollId: 1,
				}),
				createPollOption({
					id: 3,
					option: "Bottles",
					correct: false,
					pollId: 1,
				}),
			];
			const base = {
				poll: mockPoll,
				options,
				run: mockRun,
				hasAnswered: false,
			};

			const result = applyEffects(base, ["telemetry-config", "eslint-config"]);

			expect(result.showWhoPickedWhat).toBe(true);
			expect(result.renderProps.disabledOptionIds).toHaveLength(1);
			expect(result.meta.notes).toContain("Will show answers chosen by others");
			expect(result.meta.notes).toContain("Hid wrong options");
		});

		it("combines with streakAmp effects", () => {
			const mockPoll = createMockPoll({
				categoryCode: "ts",
			});
			const mockRun = createMockRun();
			const base = {
				poll: mockPoll,
				options: [],
				run: mockRun,
				hasAnswered: false,
			};

			const result = applyEffects(base, ["telemetry-config", ".ts-config"]);

			expect(result.showWhoPickedWhat).toBe(true);
			expect(result.coverage.coverageAdd).toBe(2);
			expect(result.meta.notes).toContain("Will show answers chosen by others");
			expect(result.meta.notes).toContain("+2 amp for ts polls");
		});
	});

	describe.todo("checkCoverageWithThreshold effect", () => {
		beforeEach(() => {
			vi.clearAllMocks();
		});

		it("returns protection object with try/catch functionality", () => {
			const mockPoll = createMockPoll({
				categoryCode: "js",
			});
			const mockRun = createMockRun({
				activeConfigIds: ["try-catch-config"],
				categoryCoverage: [],
			});
			const base = {
				poll: mockPoll,
				options: [],
				run: mockRun,
				hasAnswered: false,
			};

			vi.mocked(thresholdService.calculateThresholdInfo).mockReturnValue({
				meetsThreshold: false,
				gateDefinition: {
					gate: 1,
					requirements: [{ threshold: 50, requiredCategories: 1 }],
					evaluationMode: "OR",
					pollsPerGate: 5,
				},
				maxCoverage: 0,
				pollNumber: 0,
				currentGate: 1,
				isThresholdCheckPoll: false,
				pollInRound: 0,
				requirementEvaluations: [],
				qualifyingCategories: [],
			});

			const result = applyEffects(base, ["try-catch-config"]);

			expect(result.protection).toBeDefined();
			expect(typeof result.protection.tryCatch).toBe("boolean");
			expect(result.meta.notes).toBeDefined();
		});

		it("activates protection when at 80% threshold on check poll and failing", () => {
			const mockPoll = createMockPoll({
				categoryCode: "js",
			});
			const mockRun = createMockRun({
				activeConfigIds: ["try-catch-config"],
				categoryCoverage: [
					createMockRunCategoryCoverage({
						id: 1,
						runId: 1,
						categoryCode: "js",
						currentCoverage: 80, // 80% of 100 threshold
						pollsAnswered: 3,
					}),
				],
			});
			const base = {
				poll: mockPoll,
				options: [],
				run: mockRun,
				hasAnswered: true,
			};

			// Mock the threshold calculation to return failing threshold at poll 3
			vi.mocked(thresholdService.calculateThresholdInfo).mockReturnValue({
				meetsThreshold: false, // Fixed: maxCoverage < requiredCoverage means failing
				gateDefinition: {
					gate: 1,
					requirements: [{ threshold: 100, requiredCategories: 1 }],
					evaluationMode: "OR",
					pollsPerGate: 5,
				},
				maxCoverage: 80,
				pollNumber: 3,
				currentGate: 1,
				isThresholdCheckPoll: true,
				pollInRound: 3,
				requirementEvaluations: [],
				qualifyingCategories: [],
			});

			const result = applyEffects(base, ["try-catch-config"]);

			expect(result.protection.tryCatch).toBe(true);
			expect(result.meta.notes).toContain(
				"Try/Catch will save your run! (have 80% of threshold)"
			);
			expect(result.meta.badges?.["try-catch"]).toBe(
				"Try/Catch will activate!"
			);
		});

		it("does not activate when below 80% threshold", () => {
			const mockPoll = createMockPoll({
				categoryCode: "js",
			});
			const mockRun = createMockRun({
				activeConfigIds: ["try-catch-config"],
				categoryCoverage: [
					createMockRunCategoryCoverage({
						id: 1,
						runId: 1,
						categoryCode: "js",
						currentCoverage: 60, // Only 60% of 100 threshold
						pollsAnswered: 3,
					}),
				],
			});
			const base = {
				poll: mockPoll,
				options: [],
				run: mockRun,
				hasAnswered: true,
			};

			vi.mocked(thresholdService.calculateThresholdInfo).mockReturnValue({
				meetsThreshold: false, // Fixed: maxCoverage < requiredCoverage means failing
				gateDefinition: {
					gate: 1,
					requirements: [{ threshold: 100, requiredCategories: 1 }],
					evaluationMode: "OR",
					pollsPerGate: 5,
				},
				maxCoverage: 60,
				pollNumber: 3,
				currentGate: 1,
				isThresholdCheckPoll: true,
				pollInRound: 3,
				requirementEvaluations: [],
				qualifyingCategories: [],
			});

			const result = applyEffects(base, ["try-catch-config"]);

			expect(result.protection.tryCatch).toBe(false);
			expect(result.meta.notes).toContain(
				"Try/Catch inactive (need 80% of threshold)"
			);
		});

		it("does not activate when meeting threshold normally", () => {
			const mockPoll = createMockPoll({
				categoryCode: "js",
			});
			const mockRun = createMockRun({
				activeConfigIds: ["try-catch-config"],
				categoryCoverage: [
					createMockRunCategoryCoverage({
						id: 1,
						runId: 1,
						categoryCode: "js",
						currentCoverage: 120, // Exceeds threshold
						pollsAnswered: 3,
					}),
				],
			});
			const base = {
				poll: mockPoll,
				options: [],
				run: mockRun,
				hasAnswered: true,
			};

			vi.mocked(thresholdService.calculateThresholdInfo).mockReturnValue({
				meetsThreshold: true, // 120 > 100, so passing
				gateDefinition: {
					gate: 1,
					requirements: [{ threshold: 100, requiredCategories: 1 }],
					evaluationMode: "OR",
					pollsPerGate: 5,
				},
				maxCoverage: 120,
				pollNumber: 3,
				currentGate: 1,
				isThresholdCheckPoll: true,
				pollInRound: 3,
				requirementEvaluations: [],
				qualifyingCategories: [],
			});

			const result = applyEffects(base, ["try-catch-config"]);

			expect(result.protection.tryCatch).toBe(false);
			expect(result.meta.notes).toContain(
				"Try/Catch ready (have 120% of threshold)"
			);
			expect(result.meta.badges?.["try-catch"]).toBe("Try/Catch ready");
		});

		it("does not activate on non-threshold check polls", () => {
			const mockPoll = createMockPoll({
				categoryCode: "js",
			});
			const mockRun = createMockRun({
				activeConfigIds: ["try-catch-config"],
				categoryCoverage: [
					createMockRunCategoryCoverage({
						id: 1,
						runId: 1,
						categoryCode: "js",
						currentCoverage: 40,
						pollsAnswered: 2, // Poll 2, not a threshold check
					}),
				],
			});
			const base = {
				poll: mockPoll,
				options: [],
				run: mockRun,
				hasAnswered: true,
			};

			vi.mocked(thresholdService.calculateThresholdInfo).mockReturnValue({
				meetsThreshold: false, // Not a threshold check poll
				gateDefinition: {
					gate: 1,
					requirements: [{ threshold: 50, requiredCategories: 1 }],
					evaluationMode: "OR",
					pollsPerGate: 5,
				},
				maxCoverage: 40,
				pollNumber: 2,
				currentGate: 1,
				isThresholdCheckPoll: false,
				pollInRound: 2,
				requirementEvaluations: [],
				qualifyingCategories: [],
			});

			const result = applyEffects(base, ["try-catch-config"]);

			expect(result.protection.tryCatch).toBe(false);
		});

		it("aggregates XP across multiple categories", () => {
			const mockPoll = createMockPoll({
				categoryCode: "js",
			});
			const mockRun = createMockRun({
				activeConfigIds: ["try-catch-config"],
				categoryCoverage: [
					createMockRunCategoryCoverage({
						id: 1,
						runId: 1,
						categoryCode: "js",
						currentCoverage: 40,
						pollsAnswered: 1,
					}),
					createMockRunCategoryCoverage({
						id: 2,
						runId: 1,
						categoryCode: "react",
						currentCoverage: 30,
						pollsAnswered: 1,
					}),
					createMockRunCategoryCoverage({
						id: 3,
						runId: 1,
						categoryCode: "css",
						currentCoverage: 15,
						pollsAnswered: 1,
					}),
				],
			});
			const base = {
				poll: mockPoll,
				options: [],
				run: mockRun,
				hasAnswered: true,
			};

			vi.mocked(thresholdService.calculateThresholdInfo).mockReturnValue({
				meetsThreshold: false, // Fixed: maxCoverage < requiredCoverage means failing
				gateDefinition: {
					gate: 1,
					requirements: [{ threshold: 100, requiredCategories: 1 }],
					evaluationMode: "OR",
					pollsPerGate: 5,
				},
				maxCoverage: 85,
				pollNumber: 3,
				currentGate: 1,
				isThresholdCheckPoll: true,
				pollInRound: 3,
				requirementEvaluations: [],
				qualifyingCategories: [],
			});

			const result = applyEffects(base, ["try-catch-config"]);

			expect(result.protection.tryCatch).toBe(true);
			expect(result.meta.notes).toContain(
				"Try/Catch will save your run! (have 85% of threshold)"
			);
		});

		it("works at exactly 80% threshold", () => {
			const mockPoll = createMockPoll({
				categoryCode: "js",
			});
			const mockRun = createMockRun({
				activeConfigIds: ["try-catch-config"],
				categoryCoverage: [
					createMockRunCategoryCoverage({
						id: 1,
						runId: 1,
						categoryCode: "js",
						currentCoverage: 160, // Exactly 80% of 200 threshold
						pollsAnswered: 6,
					}),
				],
			});
			const base = {
				poll: mockPoll,
				options: [],
				run: mockRun,
				hasAnswered: true,
			};

			vi.mocked(thresholdService.calculateThresholdInfo).mockReturnValue({
				meetsThreshold: false, // Fixed: maxCoverage < requiredCoverage means failing
				gateDefinition: {
					gate: 1,
					requirements: [{ threshold: 200, requiredCategories: 1 }],
					evaluationMode: "OR",
					pollsPerGate: 5,
				},
				maxCoverage: 160,
				pollNumber: 6,
				currentGate: 2,
				isThresholdCheckPoll: true,
				pollInRound: 6,
				requirementEvaluations: [],
				qualifyingCategories: [],
			});

			const result = applyEffects(base, ["try-catch-config"]);

			expect(result.protection.tryCatch).toBe(true);
			expect(result.meta.notes).toContain(
				"Try/Catch will save your run! (have 80% of threshold)"
			);
		});

		it("does not work at 79% threshold", () => {
			const mockPoll = createMockPoll({
				categoryCode: "js",
			});
			const mockRun = createMockRun({
				activeConfigIds: ["try-catch-config"],
				categoryCoverage: [
					createMockRunCategoryCoverage({
						id: 1,
						runId: 1,
						categoryCode: "js",
						currentCoverage: 79, // Just below 80% of 100 threshold
						pollsAnswered: 3,
					}),
				],
			});
			const base = {
				poll: mockPoll,
				options: [],
				run: mockRun,
				hasAnswered: true,
			};

			vi.mocked(thresholdService.calculateThresholdInfo).mockReturnValue({
				meetsThreshold: false, // Fixed: maxCoverage < requiredCoverage means failing
				gateDefinition: {
					gate: 1,
					requirements: [{ threshold: 100, requiredCategories: 1 }],
					evaluationMode: "OR",
					pollsPerGate: 5,
				},
				maxCoverage: 79,
				pollNumber: 3,
				currentGate: 1,
				isThresholdCheckPoll: true,
				pollInRound: 3,
				requirementEvaluations: [],
				qualifyingCategories: [],
			});

			const result = applyEffects(base, ["try-catch-config"]);

			expect(result.protection.tryCatch).toBe(false);
			expect(result.meta.notes).toContain(
				"Try/Catch inactive (need 80% of threshold)"
			);
		});
	});

	describe("effect combinations", () => {
		beforeEach(() => {
			vi.spyOn(Math, "random");
		});

		afterEach(() => {
			vi.restoreAllMocks();
		});

		it("combines disableWrongOptions and streakAmp effects", () => {
			const mockPoll = createMockPoll({
				categoryCode: "js",
			});
			const mockRun = createMockRun();
			const options = [
				createPollOption({
					id: 1,
					option: "Kazooie",
					correct: true,
					pollId: 1,
				}),
				createPollOption({
					id: 2,
					option: "Bottles",
					correct: false,
					pollId: 1,
				}),
				createPollOption({
					id: 3,
					option: "Tooty",
					correct: false,
					pollId: 1,
				}),
			];
			const base = {
				poll: mockPoll,
				options,
				run: mockRun,
				hasAnswered: false,
			};

			const result = applyEffects(base, ["eslint-config", ".js-config"]);

			expect(result.view).toEqual(base);
			expect(result.renderProps.disabledOptionIds).toHaveLength(1);
			expect(result.renderProps.disabledOptionIds?.[0]).toBeOneOf([2, 3]);
			expect(result.renderProps.coverageBonus).toBe(2);
			expect(result.coverage.coverageAdd).toBe(2);
			expect(result.meta.notes).toContain("Hid wrong options");
			expect(result.meta.notes).toContain("+2 amp for js polls");
		});

		it("combines randomStreakAmp with disableWrongOptions", () => {
			vi.spyOn(Math, "random").mockReturnValue(0.83); // (0.83 - 0.5) = 0.33, rounds to 0.3

			const mockPoll = createMockPoll({
				categoryCode: "js",
			});
			const mockRun = createMockRun();
			const options = [
				createPollOption({
					id: 1,
					option: "Green",
					correct: true,
					pollId: 1,
				}),
				createPollOption({
					id: 2,
					option: "Red",
					correct: false,
					pollId: 1,
				}),
			];
			const base = {
				poll: mockPoll,
				options,
				run: mockRun,
				hasAnswered: false,
			};

			const result = applyEffects(base, [
				"eslint-config",
				"math-random-config",
			]);

			expect(result.renderProps.disabledOptionIds).toHaveLength(1);
			expect(result.renderProps.coverageBonus).toBe(3.3);
			expect(result.meta.notes).toContain("Hid wrong options");
			expect(result.meta.notes).toContain(
				"Random code coverage bonus for js polls"
			);

			vi.restoreAllMocks();
		});

		it("is stackable if a category streakAmp is active", () => {
			vi.mocked(Math.random).mockReturnValue(0.56); // (0.56 - 0.5) = 0.06, rounds to 0.1

			const mockPoll = createMockPoll({
				categoryCode: "js",
			});
			const mockRun = createMockRun();
			const base = {
				poll: mockPoll,
				options: [],
				run: mockRun,
				hasAnswered: false,
			};

			const result = applyEffects(base, ["math-random-config", ".js-config"]);

			expect(result.view).toEqual(base);
			expect(result.renderProps.coverageBonus).toBe(2.6);
			expect(result.coverage.coverageAdd).toBe(2.6);
			expect(result.meta.notes).toEqual([
				"Random code coverage bonus for js polls",
				"+2 amp for js polls",
			]);
		});

		it("combines deflate and hot-reload effects", () => {
			const mockPoll = createMockPoll({
				categoryCode: "react",
			});
			const mockRun = createMockRun();
			const base = {
				poll: mockPoll,
				options: [],
				run: mockRun,
				hasAnswered: false,
			};

			const result = applyEffects(base, [
				"deflate-config",
				"hot-reload-config",
			]);

			expect(result.view).toEqual(base);
			expect(result.reductionCost).toBe(0.1);
			expect(result.resetRebuild).toBe(true);
			expect(result.meta.notes).toEqual([
				"Shop items cost 10% less!",
				"Rebuilds will reset after every poll",
			]);
		});

		it("combines deflate with streakAmp effects", () => {
			const mockPoll = createMockPoll({
				categoryCode: "ts",
			});
			const mockRun = createMockRun();
			const base = {
				poll: mockPoll,
				options: [],
				run: mockRun,
				hasAnswered: false,
			};

			const result = applyEffects(base, ["deflate-config", ".ts-config"]);

			expect(result.view).toEqual(base);
			expect(result.reductionCost).toBe(0.1);
			expect(result.renderProps.coverageBonus).toBe(2);
			expect(result.coverage.coverageAdd).toBe(2);
			expect(result.meta.notes).toContain("Shop items cost 10% less!");
			expect(result.meta.notes).toContain("+2 amp for ts polls");
		});

		it("combines hot-reload with disableWrongOptions", () => {
			const mockPoll = createMockPoll({
				categoryCode: "js",
			});
			const mockRun = createMockRun();
			const options = [
				createPollOption({
					id: 1,
					option: "Mumbo Jumbo",
					correct: true,
					pollId: 1,
				}),
				createPollOption({
					id: 2,
					option: "Gruntilda",
					correct: false,
					pollId: 1,
				}),
				createPollOption({
					id: 3,
					option: "Klungo",
					correct: false,
					pollId: 1,
				}),
			];
			const base = {
				poll: mockPoll,
				options,
				run: mockRun,
				hasAnswered: false,
			};

			const result = applyEffects(base, ["hot-reload-config", "eslint-config"]);

			expect(result.view).toEqual(base);
			expect(result.resetRebuild).toBe(true);
			expect(result.renderProps.disabledOptionIds).toHaveLength(1);
			expect(result.renderProps.disabledOptionIds?.[0]).toBeOneOf([2, 3]);
			expect(result.meta.notes).toContain(
				"Rebuilds will reset after every poll"
			);
			expect(result.meta.notes).toContain("Hid wrong options");
		});
	});

	describe("EffectRenderProps type", () => {
		it("supports disabledOptionIds property", () => {
			const renderProps: EffectRenderProps = {
				disabledOptionIds: [1, 2, 3],
			};

			expect(renderProps.disabledOptionIds).toEqual([1, 2, 3]);
		});

		it("supports amp property", () => {
			const renderProps: EffectRenderProps = {
				coverageBonus: 0.75,
			};

			expect(renderProps.coverageBonus).toBe(0.75);
		});

		it("is empty when no effects are applied", () => {
			const renderProps: EffectRenderProps = {};
			expect(renderProps).toEqual({});
		});

		it("allows multiple effects to be applied", () => {
			const renderProps: EffectRenderProps = {
				disabledOptionIds: [1, 2],
				coverageBonus: 1.5,
			};

			expect(renderProps.disabledOptionIds).toEqual([1, 2]);
			expect(renderProps.coverageBonus).toBe(1.5);
		});
	});
});
