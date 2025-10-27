import { describe, expect, it } from "vitest";
import {
	addConfigsToRun,
	canAddConfigToRun,
	getRandomConfigs,
	getStorageInfo,
	removeConfigsFromRun,
} from "~/domains/economy/services/configManager.service";
import { createMockRun } from "~/domains/runs/models/run";
import { createConfig } from "~/domains/configs/factories/config";
import { STORAGE_UNITS } from "~/lib/storage";

describe("configStorage", () => {
	describe("canAddConfigToRun", () => {
		it("returns false when config is already found in config deck", () => {
			const mockRun = createMockRun({
				activeConfigIds: ["eslint", "jest-config"],
			});
			const mockConfig = createConfig({
				id: "jest-config",
			});

			const result = canAddConfigToRun(mockRun, mockConfig);

			expect(result).toBe(false);
		});

		it("returns true when config is not found in config deck", () => {
			const mockRun = createMockRun({
				activeConfigIds: ["eslint", "jest-config"],
			});
			const mockConfig = createConfig({
				id: "tsconfig",
			});

			const result = canAddConfigToRun(mockRun, mockConfig);

			expect(result).toBe(true);
		});
	});

	describe("addConfigsToRun", () => {
		it("prevents adding the same config if already in config deck", () => {
			const mockRun = createMockRun({
				activeConfigIds: ["eslint", "jest-config"],
			});
			const mockConfigs = [
				createConfig({
					id: "eslint",
				}),
				createConfig({
					id: "jest-config",
				}),
				createConfig({
					id: "webpack-config",
				}),
			];

			const result = addConfigsToRun(
				mockRun,
				["eslint", "webpack-config"],
				mockConfigs
			);

			expect(result.activeConfigIds).toEqual([
				"eslint",
				"jest-config",
				"webpack-config",
			]);
		});

		it("adds config to config deck if not already present", () => {
			const mockRun = createMockRun({
				activeConfigIds: ["eslint", "jest-config"],
			});
			const mockConfigs = [
				createConfig({
					id: "eslint",
				}),
				createConfig({
					id: "jest-config",
				}),
				createConfig({
					id: "tsconfig",
				}),
			];

			const result = addConfigsToRun(mockRun, ["tsconfig"], mockConfigs);

			expect(result.activeConfigIds).toEqual([
				"eslint",
				"jest-config",
				"tsconfig",
			]);
		});

		it("adds multiple configs when given", () => {
			const mockRun = createMockRun({
				activeConfigIds: ["eslint", "jest-config"],
			});
			const mockConfigs = [
				createConfig({
					id: "eslint",
				}),
				createConfig({
					id: "jest-config",
				}),
				createConfig({
					id: "tsconfig",
				}),
				createConfig({
					id: "webpack-config",
				}),
			];

			const result = addConfigsToRun(
				mockRun,
				["tsconfig", "webpack-config"],
				mockConfigs
			);

			expect(result.activeConfigIds).toEqual([
				"eslint",
				"jest-config",
				"tsconfig",
				"webpack-config",
			]);
		});
	});

	describe("removeConfigsFromRun", () => {
		it("removes the given config", () => {
			const mockRun = createMockRun({
				activeConfigIds: ["eslint", "ts-config"],
			});
			const mockConfig = createConfig({
				id: "ts-config",
			});

			const result = removeConfigsFromRun(mockRun, [mockConfig.id]);

			expect(result.activeConfigIds).toEqual(["eslint"]);
		});

		it("removes multiple given config", () => {
			const mockRun = createMockRun({
				activeConfigIds: ["eslint", "ts-config"],
			});
			const mockConfig = [
				createConfig({
					id: "ts-config",
				}),
				createConfig({
					id: "eslint",
				}),
			];

			const result = removeConfigsFromRun(
				mockRun,
				mockConfig.map((c) => c.id)
			);

			expect(result.activeConfigIds).toEqual([]);
		});
	});

	describe("getStorageInfo", () => {
		it("initializes without configs, 1 MB of storage, storageAvailable has the same amount as storageLimit and 0 storage used", () => {
			const mockConfigs = [
				createConfig({
					id: "vanilla-config",
					name: "Vanilla Config",
					image: "/configs/vanilla.png",
					cost: STORAGE_UNITS.MB / 4, // 256KB
					level: 0,
					description:
						"Shows community correctness percentage after each answer",
					effect: ["showCommunityPercentage"],
					rarity: "common",
				}),
			];

			const result = getStorageInfo(
				createMockRun({
					storageLimit: STORAGE_UNITS.MB, // 1MB
					activeConfigIds: ["vanilla-config"],
				}),
				mockConfigs
			);

			expect(result).toEqual({
				activeConfigs: [
					{
						id: "vanilla-config",
						name: "Vanilla Config",
						image: "/configs/vanilla.png",
						cost: STORAGE_UNITS.MB / 4, // 256KB
						level: 0,
						description:
							"Shows community correctness percentage after each answer",
						effect: ["showCommunityPercentage"],
						rarity: "common",
						priority: 1,
					},
				],
				configsStorage: STORAGE_UNITS.MB / 4, // 256KB
				rerollsStorage: 0, // No rerolls yet
				storageUsed: STORAGE_UNITS.MB / 4, // 256KB
				storageAvailable: STORAGE_UNITS.MB - STORAGE_UNITS.MB / 4, // 1MB - 256KB
				storageLimit: STORAGE_UNITS.MB, // 1MB (effective limit, no bonuses)
				baseStorageLimit: STORAGE_UNITS.MB, // 1MB base
				usagePercentage: 25,
			});
		});
	});

	describe("getRandomConfigs", () => {
		it("generates random configs but doesn't return configs the player already has", () => {
			const configs = [
				createConfig({
					id: "package.json-config",
					rarity: "common",
				}),
				createConfig({
					id: "eslint-config",
					rarity: "uncommon",
				}),
				createConfig({
					id: "local-storage-config",
					rarity: "common",
				}),
			];
			const result = getRandomConfigs({
				run: createMockRun({
					activeConfigIds: [".js-config", "eslint-config"],
				}),
				configs,
				count: 2,
			});

			expect(result).toHaveLength(2);
			expect(result.map((c) => c.id).sort()).toEqual([
				"local-storage-config",
				"package.json-config",
			]);
			expect(result).not.toContainEqual(
				expect.objectContaining({ id: "eslint-config" })
			);
		});

		it("respects rarity weights when selecting configs", () => {
			const configs = [
				createConfig({ id: ".js-config", rarity: "common" }),
				createConfig({ id: ".ts-config", rarity: "common" }),
				createConfig({ id: "package.json-config", rarity: "common" }),
				createConfig({ id: "local-storage-config", rarity: "common" }),
				createConfig({ id: "eslint-config", rarity: "uncommon" }),
				createConfig({ id: "math-random-config", rarity: "rare" }),
				createConfig({ id: "try-catch-config", rarity: "rare" }),
			];

			// Run many iterations to verify distribution
			const distribution = {
				common: 0,
				uncommon: 0,
				rare: 0,
				legendary: 0,
			};
			const iterations = 1000;

			for (let i = 0; i < iterations; i++) {
				const result = getRandomConfigs({
					run: createMockRun({ activeConfigIds: [] }),
					configs,
					count: 1,
				});
				distribution[result[0].rarity]++;
			}

			// Common should appear most frequently (around 69%)
			expect(distribution.common).toBeGreaterThan(iterations * 0.5);
			// Rare should appear less frequently (around 8%)
			expect(distribution.rare).toBeLessThan(iterations * 0.25);
			// Common should definitely appear more than rare
			expect(distribution.common).toBeGreaterThan(distribution.rare);
			// With multiple of each rarity, there's some variance in uncommon vs rare
			// Just verify they're both less frequent than common
			expect(distribution.common).toBeGreaterThan(distribution.uncommon);
		});

		it("handles selection when only certain rarities are available", () => {
			const configs = [
				createConfig({ id: "math-random-config", rarity: "rare" }),
				createConfig({ id: "try-catch-config", rarity: "rare" }),
			];

			const result = getRandomConfigs({
				run: createMockRun({ activeConfigIds: [] }),
				configs,
				count: 2,
			});

			expect(result).toHaveLength(2);
			// Should still select from available configs even if no common ones exist
			expect(result.map((c) => c.id)).toContain("math-random-config");
			expect(result.map((c) => c.id)).toContain("try-catch-config");
		});

		it("returns fewer configs than requested when pool is exhausted", () => {
			const configs = [
				createConfig({ id: ".js-config", rarity: "common" }),
				createConfig({ id: "eslint-config", rarity: "uncommon" }),
			];

			const result = getRandomConfigs({
				run: createMockRun({ activeConfigIds: [] }),
				configs,
				count: 5, // Requesting more than available
			});

			expect(result).toHaveLength(2); // Should only return what's available
		});

		it("ensures no duplicates in selected configs", () => {
			const configs = [
				createConfig({ id: ".js-config", rarity: "common" }),
				createConfig({ id: ".ts-config", rarity: "common" }),
				createConfig({ id: ".css-config", rarity: "common" }),
				createConfig({ id: ".html-config", rarity: "common" }),
				createConfig({ id: "package.json-config", rarity: "common" }),
			];

			const result = getRandomConfigs({
				run: createMockRun({ activeConfigIds: [] }),
				configs,
				count: 5,
			});

			const ids = result.map((c) => c.id);
			const uniqueIds = new Set(ids);
			expect(uniqueIds.size).toBe(ids.length); // All IDs should be unique
		});
	});
});
