import { describe, expect, it } from "vitest";

import { runActionSchema } from "~/modules/run/run/application/run.validation";

describe("runActionSchema", () => {
	it("accepts every engine action shape", () => {
		const actions = [
			{ type: "slot", configId: "js" },
			{ type: "unslot", configId: "js" },
			{ type: "pick-stack", stackId: "ship-it" },
			{ type: "start" },
			{ type: "answer", optionIds: ["64"] },
			{ type: "lint-poll" },
			{ type: "strip", configId: "eslint" },
			{ type: "resume-climb" },
			{ type: "draft", configId: "agents-md" },
			{ type: "upgrade", configId: "js" },
			{ type: "rebuild-draft" },
			{ type: "finish-reward" },
			{ type: "sell", configId: "agents-md" },
			{ type: "drop", configId: "agents-md" },
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

	it("rejects a stack pick without a stackId", () => {
		const result = runActionSchema.safeParse({ type: "pick-stack" });
		expect(result.success).toBe(false);
	});
});
