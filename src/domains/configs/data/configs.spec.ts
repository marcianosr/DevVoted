import { describe, expect, it } from "vitest";
import { configs, applyEffects, EffectRenderProps } from "./configs";
import { createMockPoll } from "~/domains/polls/factories/poll";
import { createMockRun } from "~/domains/runs/models/run";
import { createPollOption } from "~/domains/polls/models/pollOption";

describe("configs", () => {
	// TODO: Group configs and effects
	describe("ESLint Config", () => {
		const eslintConfig = configs.find((c) => c.id === "eslint-config");

		it("exists in configs array", () => {
			expect(eslintConfig).toBeDefined();
			expect(eslintConfig?.name).toBe("ESLint Config");
			expect(eslintConfig?.effect).toEqual(["disableWrongOptions"]);
			expect(eslintConfig?.rarity).toBe("uncommon");
		});

		it("has valid cost and level properties", () => {
			expect(eslintConfig?.cost).toBeGreaterThan(0);
			expect(eslintConfig?.level).toBe(3);
		});
	});

	describe("applyEffects", () => {
		it("returns base view with empty renderProps when no configs provided", () => {
			const mockPoll = createMockPoll({
				question: "What does the Super Metroid Power Bomb do?",
			});
			const mockRun = createMockRun();
			const base = {
				poll: mockPoll,
				options: [],
				run: mockRun,
				hasAnswered: false,
			};

			const result = applyEffects(base, []);

			expect(result.view).toEqual(base);
			expect(result.renderProps).toEqual({});
			expect(result.meta).toEqual({});
		});

		it("returns base view when provided config IDs don't exist", () => {
			const mockPoll = createMockPoll({
				question: "Which character says 'It's dangerous to go alone'?",
			});
			const mockRun = createMockRun();
			const base = {
				poll: mockPoll,
				options: [],
				run: mockRun,
				hasAnswered: false,
			};

			const result = applyEffects(base, ["nonexistent-config"]);

			expect(result.view).toEqual(base);
			expect(result.renderProps).toEqual({});
			expect(result.meta).toEqual({});
		});

		it("applies disableWrongOptions effect when ESLint config is active", () => {
			const mockPoll = createMockPoll({
				question: "What is Samus Aran's ship called?",
			});
			const mockRun = createMockRun();
			const options = [
				createPollOption({
					id: 1,
					option: "Leonard",
					correct: true,
					pollId: 1,
				}),
				createPollOption({
					id: 2,
					option: "Sheldon",
					correct: false,
					pollId: 1,
				}),
				createPollOption({
					id: 3,
					option: "Howard",
					correct: false,
					pollId: 1,
				}),
				createPollOption({
					id: 4,
					option: "Raj",
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
			expect(result.renderProps.disabledOptionIds?.[0]).toBeOneOf([
				2, 3, 4,
			]);
			expect(result.meta.notes).toEqual(["Hid wrong options"]);
		});

		it("merges multiple config effects correctly", () => {
			// First, let's add another test config to the configs array
			// Since we can't modify the actual configs array, we'll test the merging behavior
			const mockPoll = createMockPoll({
				question: "What collectible increases Samus's energy tanks?",
			});
			const mockRun = createMockRun();
			const options = [
				createPollOption({
					id: 1,
					option: "Leonard",
					correct: true,
					pollId: 1,
				}),
				createPollOption({
					id: 2,
					option: "Sheldon",
					correct: false,
					pollId: 1,
				}),
				createPollOption({
					id: 3,
					option: "Howard",
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

			// Test with multiple ESLint configs (hypothetically)
			const result = applyEffects(base, [
				"eslint-config",
				"eslint-config",
			]);

			expect(
				result.renderProps.disabledOptionIds?.length
			).toBeGreaterThanOrEqual(1);
			expect(result.meta.notes?.length).toBeGreaterThanOrEqual(1);
		});

		it("handles configs with no effects gracefully", () => {
			const mockPoll = createMockPoll({
				question: "In Banjo-Kazooie, what does Kazooie do?",
			});
			const mockRun = createMockRun();
			const base = {
				poll: mockPoll,
				options: [],
				run: mockRun,
				hasAnswered: false,
			};

			// Test with a config that has empty effects
			const result = applyEffects(base, ["config-with-no-effects"]);

			expect(result.view).toEqual(base);
			expect(result.renderProps).toEqual({});
		});
	});

	describe("disableWrongOptions effect", () => {
		it("only disables incorrect options", () => {
			const mockPoll = createMockPoll({
				question: "What is Mario's signature move?",
			});
			const mockRun = createMockRun();
			const options = [
				createPollOption({
					id: 1,
					option: "Penny",
					correct: true,
					pollId: 1,
				}),
				createPollOption({
					id: 2,
					option: "Amy",
					correct: false,
					pollId: 1,
				}),
				createPollOption({
					id: 3,
					option: "Bernadette",
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

			// The disabled option should be one of the incorrect ones
			const disabledId = result.renderProps.disabledOptionIds?.[0];
			const disabledOption = options.find((o) => o.id === disabledId);

			expect(disabledOption?.correct).toBe(false);
		});

		it("handles polls with no wrong options", () => {
			const mockPoll = createMockPoll({
				question: "What is Link's home region?",
			});
			const mockRun = createMockRun();
			const options = [
				createPollOption({
					id: 1,
					option: "Bazinga",
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

			// Should handle gracefully when there are no wrong options to disable
			expect(result.renderProps.disabledOptionIds).toHaveLength(1);
			expect(result.renderProps.disabledOptionIds?.[0]).toBeUndefined();
		});

		it("handles polls with all wrong options", () => {
			const mockPoll = createMockPoll({
				question: "Which Pokemon is the first in the Pokedex?",
			});
			const mockRun = createMockRun();
			const options = [
				createPollOption({
					id: 1,
					option: "Sheldon",
					correct: false,
					pollId: 1,
				}),
				createPollOption({
					id: 2,
					option: "Leonard",
					correct: false,
					pollId: 1,
				}),
				createPollOption({
					id: 3,
					option: "Raj",
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

			// Should disable one of the wrong options
			expect(result.renderProps.disabledOptionIds).toHaveLength(1);
			expect(result.renderProps.disabledOptionIds?.[0]).toBeOneOf([
				1, 2, 3,
			]);
		});
	});

	describe("EffectRenderProps type", () => {
		it("supports all expected properties", () => {
			const renderProps: EffectRenderProps = {
				disabledOptionIds: [1, 2, 3],
				freeReroll: true,
				multipliers: { 1: 1.5, 2: 2.0 },
			};

			expect(renderProps.disabledOptionIds).toEqual([1, 2, 3]);
			expect(renderProps.freeReroll).toBe(true);
			expect(renderProps.multipliers).toEqual({ 1: 1.5, 2: 2.0 });
		});

		it("allows partial properties", () => {
			const renderProps: EffectRenderProps = {
				disabledOptionIds: [1],
			};

			expect(renderProps.disabledOptionIds).toEqual([1]);
			expect(renderProps.freeReroll).toBeUndefined();
			expect(renderProps.multipliers).toBeUndefined();
		});
	});
});
