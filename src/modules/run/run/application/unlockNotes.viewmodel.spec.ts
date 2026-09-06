import { describe, expect, it } from "vitest";

import {
	justFiredLines,
	unlockLinesFor,
	unlockNotesFor,
} from "~/modules/run/run/application/unlockNotes.viewmodel";
import { createMockRunView } from "~/test/runView.factory";

describe(unlockLinesFor, () => {
	it("maps a grant to its config and authored provenance", () => {
		const lines = unlockLinesFor([
			{ configId: "telemetry", viaMetric: "community-peeks" },
		]);
		expect(lines).toHaveLength(1);
		expect(lines[0].config.label).toBe("Telemetry");
		expect(lines[0].detail).toBe("Earned: peeked the community split 5 times");
	});

	it("drops an unknown config id instead of throwing", () => {
		expect(
			unlockLinesFor([{ configId: "missingno", viaMetric: null }])
		).toEqual([]);
	});
});

describe(justFiredLines, () => {
	it("keeps only the grants the last dispatch fired", () => {
		const view = createMockRunView({
			unlockedConfigIds: ["telemetry"],
			unlockedThisRun: [
				{ configId: "html", viaMetric: "polls-answered" },
				{ configId: "telemetry", viaMetric: "community-peeks" },
			],
		});
		const lines = justFiredLines(view);
		expect(lines).toHaveLength(1);
		expect(lines[0].config.id).toBe("telemetry");
	});

	it("stays empty when the dispatch granted nothing", () => {
		const view = createMockRunView({
			unlockedThisRun: [{ configId: "html", viaMetric: "polls-answered" }],
		});
		expect(justFiredLines(view)).toEqual([]);
	});
});

describe(unlockNotesFor, () => {
	it("announces the just-fired grant with label and provenance", () => {
		const view = createMockRunView({
			unlockedConfigIds: ["html"],
			unlockedThisRun: [{ configId: "html", viaMetric: "polls-answered" }],
		});
		expect(unlockNotesFor(view)).toEqual([
			{
				label: ".html",
				detail: "Earned: answered 25 polls",
				slots: 1,
				version: 1,
				maxVersion: 5,
			},
		]);
	});
});
