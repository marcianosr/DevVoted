import { describe, expect, it } from "vitest";

import { bandOf } from "~/modules/run/build/domain/coverageRatio.model";
import type { Config } from "~/modules/run/config/domain/config.model";
import { CONFIGS } from "~/modules/run/config/domain/configRoster.model";
import { runReducer } from "~/modules/run/run/domain/runAction.model";
import type { RunState } from "~/modules/run/run/domain/run.model";
import { started } from "~/modules/run/run/domain/run.factory";
import {
	bandOwed,
	commitBand,
	slaUpliftKb,
} from "~/modules/run/run/domain/sla.model";

const holding = (
	configs: readonly Config[] = [CONFIGS.sla],
	extra: Partial<RunState> = {}
): RunState => {
	const base = started([]);
	return {
		...base,
		status: "rewarding",
		build: { ...base.build, configs },
		...extra,
	};
};

describe(commitBand, () => {
	it("records the band the player promised", () => {
		expect(commitBand(holding(), "healthy").slaBand).toBe("healthy");
	});

	it("refuses a promise while SLA is not in the build", () => {
		const bare = holding([CONFIGS.js]);
		expect(commitBand(bare, "healthy")).toBe(bare);
	});

	it("refuses a promise once the gate is under way", () => {
		const answering = holding([CONFIGS.sla], { status: "answering" });
		expect(commitBand(answering, "healthy")).toBe(answering);
	});

	it("refuses a band no player could promise to close in", () => {
		const prep = holding();
		expect(commitBand(prep, "shaky")).toBe(prep);
		expect(commitBand(prep, "danger")).toBe(prep);
	});

	it("opens before gate 0, where the first promise is made", () => {
		expect(
			commitBand(holding([CONFIGS.sla], { status: "configuring" }), "ok")
				.slaBand
		).toBe("ok");
	});
});

describe(slaUpliftKb, () => {
	const build: readonly Config[] = [CONFIGS.sla];

	it("pays the promised band's rate on a gate that lands there", () => {
		expect(slaUpliftKb(build, "healthy", bandOf("healthy"), 200)).toBe(50);
	});

	it("pays the promise, not the landing, when the gate beats it", () => {
		expect(slaUpliftKb(build, "ok", bandOf("perfect"), 200)).toBe(20);
	});

	it("pays nothing on a gate that falls short of its own promise", () => {
		expect(slaUpliftKb(build, "perfect", bandOf("healthy"), 200)).toBe(0);
	});

	it("pays nothing where no promise was made", () => {
		expect(slaUpliftKb(build, undefined, bandOf("perfect"), 200)).toBe(0);
	});

	it("pays nothing once SLA has left the build", () => {
		expect(slaUpliftKb([CONFIGS.js], "ok", bandOf("perfect"), 200)).toBe(0);
	});

	it("climbs with the band promised, so caution is worth less than nerve", () => {
		const at = (band: "ok" | "healthy" | "perfect") =>
			slaUpliftKb(build, band, bandOf("perfect"), 200);

		expect(at("ok")).toBeLessThan(at("healthy"));
		expect(at("healthy")).toBeLessThan(at("perfect"));
	});
});

describe("the commit-band action", () => {
	it("reaches the engine through the reducer", () => {
		expect(
			runReducer(holding(), { type: "commit-band", band: "perfect" }).slaBand
		).toBe("perfect");
	});

	it("hands back the same state it was given when it refuses", () => {
		const bare = holding([CONFIGS.js]);
		expect(runReducer(bare, { type: "commit-band", band: "ok" })).toBe(bare);
	});
});

describe(bandOwed, () => {
	it("owes a promise while SLA is installed and none is made", () => {
		expect(bandOwed(holding())).toBe(true);
	});

	it("owes nothing once the band is promised", () => {
		expect(bandOwed(commitBand(holding(), "healthy"))).toBe(false);
	});

	it("owes nothing from a build without SLA", () => {
		expect(bandOwed(holding([CONFIGS.js]))).toBe(false);
	});

	it("owes nothing once the gate is under way", () => {
		expect(bandOwed(holding([CONFIGS.sla], { status: "answering" }))).toBe(
			false
		);
	});
});
