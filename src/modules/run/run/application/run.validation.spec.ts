import { describe, expect, it } from "vitest";

import { runActionSchema } from "~/modules/run/run/application/run.validation";

describe("runActionSchema", () => {
	it("accepts every engine action shape", () => {
		const actions = [
			{ type: "install", configId: "js" },
			{ type: "uninstall", configId: "js" },
			{ type: "start" },
			{ type: "answer", optionIds: ["64"] },
			{ type: "lint-poll" },
			{ type: "strip", configIds: ["eslint"] },
			{ type: "resume-climb" },
			{ type: "draft", configId: "agents-md" },
			{ type: "upgrade", configId: "js" },
			{ type: "rebuild-draft" },
			{ type: "finish-reward" },
			{ type: "sell", configId: "agents-md" },
			{ type: "drop", configId: "agents-md" },
			{ type: "commit-band", band: "healthy" },
			{ type: "fire-audit" },
		];
		actions.forEach((action) => {
			expect(runActionSchema.safeParse(action).success).toBe(true);
		});
	});

	it("rejects unknown action types", () => {
		const result = runActionSchema.safeParse({ type: "grant-victory" });
		expect(result.success).toBe(false);
	});

	it("rejects client-supplied state fields (anti-cheat)", () => {
		const smuggled = runActionSchema.safeParse({
			type: "answer",
			optionIds: ["64"],
			storage: 1024,
		});
		expect(smuggled.success).toBe(false);

		const onBareAction = runActionSchema.safeParse({
			type: "finish-reward",
			gatesCleared: 5,
		});
		expect(onBareAction.success).toBe(false);
	});

	it("rejects an answer without options", () => {
		const result = runActionSchema.safeParse({ type: "answer", optionIds: [] });
		expect(result.success).toBe(false);
	});

	it("rejects config actions without a configId", () => {
		const result = runActionSchema.safeParse({ type: "draft" });
		expect(result.success).toBe(false);
	});

	it("rejects the retired stack pick (ADR-052)", () => {
		const result = runActionSchema.safeParse({
			type: "pick-stack",
			stackId: "ship-it",
		});
		expect(result.success).toBe(false);
	});
});

describe("the band a promise names", () => {
	it("takes a band off the wire as a plain string", () => {
		expect(
			runActionSchema.safeParse({ type: "commit-band", band: "perfect" })
				.success
		).toBe(true);
	});

	it("leaves the engine to refuse a band nobody can promise", () => {
		// The schema guards the shape; `commitBand` owns which bands are legal,
		// so an unknown one is a refused action rather than a rejected request.
		expect(
			runActionSchema.safeParse({ type: "commit-band", band: "danger" }).success
		).toBe(true);
	});

	it("rejects a promise carrying no band at all", () => {
		expect(runActionSchema.safeParse({ type: "commit-band" }).success).toBe(
			false
		);
	});
});
