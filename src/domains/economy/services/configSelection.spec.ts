import { describe, expect, it } from "vitest";

import { Config } from "~/domains/economy/models/config.model";
import {
	previewNextShopOfferings,
	selectRandomConfigs,
} from "~/domains/economy/services/configSelection";

const baseConfig = (overrides: Partial<Config>): Config => ({
	id: "x",
	name: "x",
	cost: 1024,
	effect: [],
	description: "",
	rarity: "common",
	priority: 100,
	...overrides,
});

describe("configSelection", () => {
	describe("selectRandomConfigs", () => {
		it("excludes configs tagged with variantOf from the offering pool", () => {
			const pool: Config[] = [
				baseConfig({
					id: "shell",
					variants: [{ id: "v1", label: "A", description: "" }],
				}),
				baseConfig({ id: "v1", variantOf: "shell" }),
				baseConfig({ id: "v2", variantOf: "shell" }),
				baseConfig({ id: "normal" }),
			];

			const picks = selectRandomConfigs(pool, [], 50);
			const pickedIds = picks.map((c) => c.id);

			expect(pickedIds).not.toContain("v1");
			expect(pickedIds).not.toContain("v2");
		});

		it("includes shell configs in the pool", () => {
			const pool: Config[] = [
				baseConfig({
					id: "shell",
					variants: [{ id: "v1", label: "A", description: "" }],
				}),
				baseConfig({ id: "v1", variantOf: "shell" }),
			];

			const picks = selectRandomConfigs(pool, [], 5);

			expect(picks.some((c) => c.id === "shell")).toBe(true);
		});

		it("treats a shell as owned when any of its variants is in activeConfigIds", () => {
			const pool: Config[] = [
				baseConfig({
					id: "shell",
					variants: [{ id: "v1", label: "A", description: "" }],
				}),
				baseConfig({ id: "v1", variantOf: "shell" }),
				baseConfig({ id: "v2", variantOf: "shell" }),
				baseConfig({ id: "normal" }),
			];

			const picks = selectRandomConfigs(pool, ["v1"], 50);
			const pickedIds = picks.map((c) => c.id);

			expect(pickedIds).not.toContain("shell");
		});

		it("excludes directly-owned configs from the pool", () => {
			const pool: Config[] = [
				baseConfig({ id: "a" }),
				baseConfig({ id: "b" }),
				baseConfig({ id: "c" }),
			];

			const picks = selectRandomConfigs(pool, ["a"], 50);
			const pickedIds = picks.map((c) => c.id);

			expect(pickedIds).not.toContain("a");
		});
	});

	describe("previewNextShopOfferings", () => {
		it("never previews variant configs", () => {
			const pool: Config[] = [
				baseConfig({
					id: "shell",
					variants: [{ id: "v", label: "A", description: "" }],
				}),
				baseConfig({ id: "v", variantOf: "shell" }),
				baseConfig({ id: "regular" }),
			];

			const previews = previewNextShopOfferings([], {}, pool);
			const previewIds = previews.map((c) => c.id);

			expect(previewIds).not.toContain("v");
		});
	});
});
