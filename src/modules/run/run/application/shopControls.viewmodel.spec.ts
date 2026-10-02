import { describe, expect, it } from "vitest";

import { shopControlsFor } from "~/modules/run/run/application/shopControls.viewmodel";
import { runReducer } from "~/modules/run/run/domain/runAction.model";
import { clearGate, started } from "~/modules/run/run/domain/run.factory";

describe("shopControlsFor", () => {
	const shopping = () => clearGate(started(["js"]));

	it("tells the shop screen the visit was skipped", () => {
		const skipped = runReducer(shopping(), { type: "skip-shop" });

		expect(shopControlsFor(skipped).shopSkipped).toBe(true);
	});

	it("reads an untouched visit as not skipped", () => {
		expect(shopControlsFor(shopping()).shopSkipped).toBe(false);
	});
});
