import { describe, expect, it } from "vitest";

import { toggleOptionSelection } from "./optionSelection";

describe(toggleOptionSelection.name, () => {
	it("replaces the whole selection for single-answer polls", () => {
		expect(toggleOptionSelection(["1"], "2", "single")).toEqual(["2"]);
	});

	it("selects the only option for single-answer polls when nothing was picked", () => {
		expect(toggleOptionSelection([], "3", "single")).toEqual(["3"]);
	});

	it("adds an option for multiple-answer polls, keeping existing picks", () => {
		expect(toggleOptionSelection(["1"], "2", "multiple")).toEqual(["1", "2"]);
	});

	it("removes an already-selected option for multiple-answer polls", () => {
		expect(toggleOptionSelection(["1", "2"], "1", "multiple")).toEqual(["2"]);
	});

	it("does not mutate the input array", () => {
		const original = ["1", "2"];
		toggleOptionSelection(original, "3", "multiple");
		expect(original).toEqual(["1", "2"]);
	});
});
