import { describe, expect, it } from "vitest";

import { missPeelFor } from "~/modules/run/run/domain/gateClose.model";
import { audited, started } from "~/modules/run/run/domain/run.factory";

describe("what a miss on this gate takes", () => {
	it("peels more on every retry of the same gate", () => {
		const gate = audited(started(["js"]), 7);
		const firstTry = missPeelFor(gate);
		const thirdTry = missPeelFor({ ...gate, gateAttempts: 2 });

		expect(thirdTry).toBeGreaterThan(firstTry);
	});
});
