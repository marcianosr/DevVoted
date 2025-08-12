import { describe, expect, it } from "vitest";
import {
	addConfigsToRun,
	canAddConfigToRun,
	getRandomConfigs,
	getStorageInfo,
	removeConfigsFromRun,
} from "~/domains/configs/services/configStorage.service";
import { createMockRun } from "~/domains/runs/models/run";
import { createConfig } from "~/domains/configs/factories/config";
import { STORAGE_UNITS } from "~/lib/storage";

describe("configStorage", () => {
	describe("canAddConfigToRun", () => {
		it("returns false when config is already found in storage deck", () => {
			const mockRun = createMockRun({
				activeConfigIds: ["eslint", "jest-config"],
			});
			const mockConfig = createConfig({
				id: "jest-config",
			});

			const result = canAddConfigToRun(mockRun, mockConfig);

			expect(result).toBe(false);
		});

		it("returns true when config is not found in storage deck", () => {
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
		it("prevents adding the same config if already in storage deck", () => {
			const mockRun = createMockRun({
				activeConfigIds: ["eslint", "jest-config"],
			});
			const mockConfig = [
				createConfig({
					id: "eslint",
				}),
				createConfig({
					id: "webpack-config",
				}),
			];

			const result = addConfigsToRun(
				mockRun,
				mockConfig.map((c) => c.id)
			);

			expect(result.activeConfigIds).toEqual([
				"eslint",
				"jest-config",
				"webpack-config",
			]);
		});

		it("adds config to storage deck if not already present", () => {
			const mockRun = createMockRun({
				activeConfigIds: ["eslint", "jest-config"],
			});
			const mockConfig = [
				createConfig({
					id: "tsconfig",
				}),
			];

			const result = addConfigsToRun(
				mockRun,
				mockConfig.map((c) => c.id)
			);

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
			const mockConfig = [
				createConfig({
					id: "tsconfig",
				}),
				createConfig({
					id: "webpack-config",
				}),
			];

			const result = addConfigsToRun(
				mockRun,
				mockConfig.map((c) => c.id)
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
			const result = getStorageInfo(
				createMockRun({
					storageLimit: STORAGE_UNITS.MB, // 1MB
					activeConfigIds: ["vanilla-config"],
				})
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
						effect: expect.any(Function),
						rarity: "common",
					},
				],
				storageUsed: STORAGE_UNITS.MB / 4, // 256KB
				storageAvailable: STORAGE_UNITS.MB - STORAGE_UNITS.MB / 4, // 1MB - 256KB
				storageLimit: STORAGE_UNITS.MB, // 1MB
				usagePercentage: 25,
			});
		});
	});

	describe("getRandomConfigs", () => {
		it("generates random configs but doesn't return configs the player already has", () => {
			const configs = [
				createConfig({
					id: "jest-config",
				}),
				createConfig({
					id: "ts-config",
				}),
				createConfig({
					id: "webpack-config",
				}),
			];
			const result = getRandomConfigs({
				run: createMockRun({
					activeConfigIds: ["eslint", "ts-config"],
				}),
				configs,
				count: 2,
			});

			expect(result).toEqual([
				{
					id: "jest-config",
					cost: 102400,
					description: "A test configuration",
					effect: expect.any(Function),
					name: "Test Config",
					level: 1,
					rarity: "common",
				},
				{
					id: "webpack-config",
					cost: 102400,
					description: "A test configuration",
					effect: expect.any(Function),
					name: "Test Config",
					rarity: "common",
					level: 1,
				},
			]);
		});
	});
});
