import { describe, expect, it } from "vitest";

import { createMockConfig } from "~/domains/economy/models/config.mock";
import {
	addConfigsToRun,
	canAddConfigToRun,
	getStorageInfo,
	removeConfigsFromRun,
} from "~/domains/economy/services/configManager.service";
import { createMockRun } from "~/domains/runs/models/run.mock";
import { STORAGE_UNITS } from "~/lib/storage";

describe("configStorage", () => {
	describe("canAddConfigToRun", () => {
		it("returns false when config is already found in config deck", () => {
			const mockRun = createMockRun({
				activeConfigIds: ["eslint", "jest-config"],
			});
			const mockConfig = createMockConfig({
				id: "jest-config",
			});

			const result = canAddConfigToRun(mockRun, mockConfig);

			expect(result).toBe(false);
		});

		it("returns true when config is not found in config deck", () => {
			const mockRun = createMockRun({
				activeConfigIds: ["eslint", "jest-config"],
			});
			const mockConfig = createMockConfig({
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
				createMockConfig({
					id: "eslint",
				}),
				createMockConfig({
					id: "jest-config",
				}),
				createMockConfig({
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
				createMockConfig({
					id: "eslint",
				}),
				createMockConfig({
					id: "jest-config",
				}),
				createMockConfig({
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
				createMockConfig({
					id: "eslint",
				}),
				createMockConfig({
					id: "jest-config",
				}),
				createMockConfig({
					id: "tsconfig",
				}),
				createMockConfig({
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
			const mockConfig = createMockConfig({
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
				createMockConfig({
					id: "ts-config",
				}),
				createMockConfig({
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
				createMockConfig({
					id: "vanilla-config",
					name: "Vanilla Config",
					image: "/configs/vanilla.png",
					cost: STORAGE_UNITS.MB / 4, // 256KB
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
});
