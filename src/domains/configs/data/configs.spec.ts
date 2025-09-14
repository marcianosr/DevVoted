import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { configs, applyEffects, EffectRenderProps } from "./configs";
import { createMockPoll } from "~/domains/polls/factories/poll";
import { createMockRun } from "~/domains/runs/models/run";
import { createPollOption } from "~/domains/polls/models/pollOption";

describe("configs", () => {
	describe("config definitions", () => {
		it("contains all expected configs", () => {
			const configIds = configs.map((c) => c.id);
			expect(configIds).toContain("eslint-config");
			expect(configIds).toContain(".html");
			expect(configIds).toContain(".css");
			expect(configIds).toContain(".js");
			expect(configIds).toContain(".ts");
			expect(configIds).toContain(".jsx");
			expect(configIds).toContain(".git");
			expect(configIds).toContain("package.json");
			expect(configIds).toContain("math-random-config");
		});

		it("has valid properties for ESLint config", () => {
			const eslintConfig = configs.find((c) => c.id === "eslint-config");
			expect(eslintConfig).toBeDefined();
			expect(eslintConfig?.name).toBe("ESLint Config");
			expect(eslintConfig?.effect).toEqual(["disableWrongOptions"]);
			expect(eslintConfig?.rarity).toBe("uncommon");
			expect(eslintConfig?.cost).toBeGreaterThan(0);
			expect(eslintConfig?.level).toBe(3);
		});

		it("has valid properties for file extension configs", () => {
			const jsConfig = configs.find((c) => c.id === ".js");
			expect(jsConfig).toBeDefined();
			expect(jsConfig?.effect).toEqual(["streakAmp"]);
			expect(jsConfig?.rarity).toBe("common");
			expect(jsConfig?.description).toContain("+0.5 amp");

			const tsConfig = configs.find((c) => c.id === ".ts");
			expect(tsConfig).toBeDefined();
			expect(tsConfig?.effect).toEqual(["streakAmp"]);
			expect(tsConfig?.description).toContain("TypeScript");
		});

		it("has valid properties for math random config", () => {
			const mathConfig = configs.find(
				(c) => c.id === "math-random-config"
			);
			expect(mathConfig).toBeDefined();
			expect(mathConfig?.name).toBe("Math Random");
			expect(mathConfig?.effect).toEqual(["randomStreakAmp"]);
			expect(mathConfig?.rarity).toBe("rare");
			expect(mathConfig?.description).toContain("Random amp value");
		});
	});

	describe("applyEffects", () => {
		it("returns base view with empty renderProps when no configs provided", () => {
			const mockPoll = createMockPoll({
				id: 1,
				question: "What does the Super Metroid Power Bomb do?",
				categoryCode: "js",
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
				id: 1,
				question: "Which character says 'It's dangerous to go alone'?",
				categoryCode: "js",
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

		it("handles configs with unknown effects gracefully", () => {
			const mockPoll = createMockPoll({
				id: 1,
				question: "In Banjo-Kazooie, what does Kazooie do?",
				categoryCode: "js",
			});
			const mockRun = createMockRun();
			const base = {
				poll: mockPoll,
				options: [],
				run: mockRun,
				hasAnswered: false,
			};

			// Create a temporary config with unknown effect
			const originalConfigs = [...configs];
			(configs as any).push({
				id: "test-unknown-effect",
				effect: ["unknownEffect"],
			});

			const result = applyEffects(base, ["test-unknown-effect"]);

			expect(result.view).toEqual(base);
			expect(result.renderProps).toEqual({});
			expect(result.meta).toEqual({});

			// Restore original configs
			configs.length = originalConfigs.length;
		});
	});

	describe("disableWrongOptions effect", () => {
		it("disables one random wrong option", () => {
			const mockPoll = createMockPoll({
				id: 1,
				question: "What is Samus Aran's ship called?",
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
			expect(result.renderProps.disabledOptionIds?.[0]).toBeOneOf([
				2, 3, 4,
			]);
			expect(result.meta.notes).toEqual(["Hid wrong options"]);

			// Verify the disabled option is actually wrong
			const disabledId = result.renderProps.disabledOptionIds?.[0];
			const disabledOption = options.find((o) => o.id === disabledId);
			expect(disabledOption?.correct).toBe(false);
		});

		it("handles polls with no wrong options gracefully", () => {
			const mockPoll = createMockPoll({
				id: 1,
				question: "What is Link's home region?",
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

			// Should still return a disabled option ID array, but with undefined value
			expect(result.renderProps.disabledOptionIds).toHaveLength(1);
			expect(result.renderProps.disabledOptionIds?.[0]).toBeUndefined();
			expect(result.meta.notes).toEqual(["Hid wrong options"]);
		});

		it("handles polls with all wrong options", () => {
			const mockPoll = createMockPoll({
				id: 1,
				question: "Which Pokemon is the first in the Pokedex?",
				categoryCode: "js",
			});
			const mockRun = createMockRun();
			const options = [
				createPollOption({
					id: 1,
					option: "Pikachu",
					correct: false,
					pollId: 1,
				}),
				createPollOption({
					id: 2,
					option: "Charizard",
					correct: false,
					pollId: 1,
				}),
				createPollOption({
					id: 3,
					option: "Mewtwo",
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
			expect(result.meta.notes).toEqual(["Hid wrong options"]);
		});

		it("merges disabled options from multiple ESLint configs", () => {
			const mockPoll = createMockPoll({
				id: 1,
				question: "What collectible increases Samus's energy tanks?",
				categoryCode: "js",
			});
			const mockRun = createMockRun();
			const options = [
				createPollOption({
					id: 1,
					option: "Energy Tank",
					correct: true,
					pollId: 1,
				}),
				createPollOption({
					id: 2,
					option: "Missile",
					correct: false,
					pollId: 1,
				}),
				createPollOption({
					id: 3,
					option: "Power Bomb",
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
			const result = applyEffects(base, [
				"eslint-config",
				"eslint-config",
			]);

			// Should merge the disabled options (could be 1 or 2 depending on randomness)
			expect(
				result.renderProps.disabledOptionIds?.length
			).toBeGreaterThanOrEqual(1);
			expect(
				result.renderProps.disabledOptionIds?.length
			).toBeLessThanOrEqual(2);
			expect(result.meta.notes?.length).toBe(2); // Two "Hid wrong options" messages
		});
	});

	describe("streakAmp effect", () => {
		it("adds 0.5 amp bonus", () => {
			const mockPoll = createMockPoll({
				id: 1,
				question: "What is Mario's signature move?",
				categoryCode: "js",
			});
			const mockRun = createMockRun();
			const base = {
				poll: mockPoll,
				options: [],
				run: mockRun,
				hasAnswered: false,
			};

			const result = applyEffects(base, [".js"]);

			expect(result.view).toEqual(base);
			expect(result.renderProps.amp).toBe(0.5);
			expect(result.meta.notes).toEqual(["+0.5 amp for js polls"]);
		});

		it("applies multiple streak amp effects with same poll category", () => {
			const mockPoll = createMockPoll({
				id: 1,
				question: "What does CSS stand for?",
				categoryCode: "css",
			});
			const mockRun = createMockRun();
			const base = {
				poll: mockPoll,
				options: [],
				run: mockRun,
				hasAnswered: false,
			};

			// Apply multiple streak amp configs
			const result = applyEffects(base, [".css", ".js"]);

			// The last amp should be in renderProps since they overwrite
			expect(result.renderProps.amp).toBe(0.5);
			// Both effects generate notes, but both show "css polls" since that's poll.categoryCode
			expect(result.meta.notes).toHaveLength(2);
			expect(result.meta.notes).toEqual([
				"+0.5 amp for css polls",
				"+0.5 amp for css polls",
			]);
		});
	});

	describe("randomStreakAmp effect", () => {
		beforeEach(() => {
			vi.spyOn(Math, "random");
		});

		afterEach(() => {
			vi.restoreAllMocks();
		});

		it("adds random amp bonus between -0.5 and +0.5, rounded to 1 decimal", () => {
			vi.mocked(Math.random).mockReturnValue(0.76); // (0.76 - 0.5) = 0.26, rounds to 0.3

			const mockPoll = createMockPoll({
				id: 1,
				question: "What is the highest level in Donkey Kong?",
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
			expect(result.renderProps.amp).toBe(0.3);
			expect(result.meta.notes).toEqual(["Random amp for js polls"]);
		});

		it("generates different rounded random values on multiple calls", () => {
			vi.mocked(Math.random)
				.mockReturnValueOnce(0.24) // (0.24 - 0.5) = -0.26, rounds to -0.3
				.mockReturnValueOnce(0.86); // (0.86 - 0.5) = 0.36, rounds to 0.4

			const mockPoll = createMockPoll({
				id: 1,
				question: "Who is the final boss in Super Metroid?",
				categoryCode: "js",
			});
			const mockRun = createMockRun();
			const base = {
				poll: mockPoll,
				options: [],
				run: mockRun,
				hasAnswered: false,
			};

			const result1 = applyEffects(base, ["math-random-config"]);
			expect(result1.renderProps.amp).toBe(-0.3);
			expect(result1.meta.notes).toEqual(["Random amp for js polls"]);

			const result2 = applyEffects(base, ["math-random-config"]);
			expect(result2.renderProps.amp).toBe(0.4);
			expect(result2.meta.notes).toEqual(["Random amp for js polls"]);
		});
	});

	describe("effect combinations", () => {
		it("combines disableWrongOptions and streakAmp effects", () => {
			const mockPoll = createMockPoll({
				id: 1,
				question: "What is Banjo's companion's name?",
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

			const result = applyEffects(base, ["eslint-config", ".js"]);

			expect(result.view).toEqual(base);
			expect(result.renderProps.disabledOptionIds).toHaveLength(1);
			expect(result.renderProps.disabledOptionIds?.[0]).toBeOneOf([2, 3]);
			expect(result.renderProps.amp).toBe(0.5);
			expect(result.meta.notes).toContain("Hid wrong options");
			expect(result.meta.notes).toContain("+0.5 amp for js polls");
		});

		it("combines randomStreakAmp with disableWrongOptions", () => {
			vi.spyOn(Math, "random").mockReturnValue(0.83); // (0.83 - 0.5) = 0.33, rounds to 0.3

			const mockPoll = createMockPoll({
				id: 1,
				question: "What color is Yoshi?",
				categoryCode: "react",
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
			expect(result.renderProps.amp).toBe(0.3);
			expect(result.meta.notes).toContain("Hid wrong options");
			expect(result.meta.notes).toContain("Random amp for react polls");

			vi.restoreAllMocks();
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
				amp: 0.75,
			};

			expect(renderProps.amp).toBe(0.75);
		});

		it("allows empty object", () => {
			const renderProps: EffectRenderProps = {};
			expect(renderProps).toEqual({});
		});

		it("allows all properties together", () => {
			const renderProps: EffectRenderProps = {
				disabledOptionIds: [1, 2],
				amp: 1.5,
			};

			expect(renderProps.disabledOptionIds).toEqual([1, 2]);
			expect(renderProps.amp).toBe(1.5);
		});
	});
});
