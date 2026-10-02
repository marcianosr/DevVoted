import { describe, expect, it } from "vitest";

import { gateCloseViewOf } from "~/modules/run/run/application/gateClose.viewmodel";
import {
	clearGate,
	failGate,
	started,
} from "~/modules/run/run/domain/run.factory";
import { gateLadderFor } from "~/modules/run/gate/domain/gate.model";
import { scheduleOf } from "~/modules/run/run/domain/run.model";
import { runReducer } from "~/modules/run/run/domain/runAction.model";

describe("gateCloseViewOf", () => {
	it("reads nothing before the first gate closes", () => {
		expect(gateCloseViewOf(started(["js"]))).toBeNull();
	});

	it("hands the debrief the record the reducer wrote, KB included", () => {
		const cleared = clearGate(started(["js"]));
		const close = gateCloseViewOf(cleared);

		expect(close).toMatchObject({
			gate: 0,
			closing: "cleared",
			heldBy: null,
			band: "perfect",
			cleared: true,
			held: 100,
			correct: 5,
			kb: cleared.gateRewardKb,
		});
		expect(close?.ladder).toEqual(cleared.lastClose?.ladder);
	});

	it("names the gate that closed, one behind the count it advanced", () => {
		const first = clearGate(started([]));
		const second = clearGate(runReducer(first, { type: "finish-reward" }));

		expect(gateCloseViewOf(second)?.gate).toBe(1);
		expect(gateCloseViewOf(second)?.held).toBe(100);
	});

	it("carries why the gate held", () => {
		const held = failGate({ ...started(["js"]), gatesCleared: 4 });

		expect(gateCloseViewOf(held)).toMatchObject({
			closing: "held",
			heldBy: "band",
			cleared: false,
			kb: 0,
		});
	});

	it("fills a record written before the close carried its ladder", () => {
		const cleared = clearGate(started(["js"]));
		const legacy = {
			...cleared,
			lastClose: { gate: 0, band: "perfect" as const, cleared: true },
			closes: [{ gate: 0, band: "perfect" as const, cleared: true, kb: 40 }],
		};

		expect(gateCloseViewOf(legacy)).toMatchObject({
			gate: 0,
			closing: "cleared",
			held: 100,
			ladder: gateLadderFor(cleared.build.configs, 0, scheduleOf(cleared)),
			kb: 40,
		});
	});

	it("still reads a snapshot that kept only the last close", () => {
		const cleared = clearGate(started(["js"]));
		const { closes: _dropped, ...legacy } = {
			...cleared,
			lastClose: { gate: 0, band: "perfect" as const, cleared: true },
		};

		expect(gateCloseViewOf(legacy)?.kb).toBe(cleared.gateRewardKb);
	});
});
