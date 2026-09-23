import { beforeEach, describe, expect, it, vi } from "vitest";

import { handleApiOperation } from "~/shared/utils/errorHandling";
import { reportApiFailure } from "~/shared/utils/errorReporting";
import { KANTO_LANDMARKS } from "~/test/kanto";

vi.mock("~/shared/utils/errorReporting", () => ({
	reportApiFailure: vi.fn(),
}));

const [silphCo] = KANTO_LANDMARKS;

beforeEach(() => {
	vi.clearAllMocks();
});

describe("handleApiOperation", () => {
	it("wraps a resolved value as a success response", async () => {
		const result = await handleApiOperation(
			async () => ({ name: silphCo }),
			"getLandmark"
		);

		expect(result).toEqual({ success: true, data: { name: silphCo } });
	});

	it("turns a thrown Error into a failure response carrying its message", async () => {
		const result = await handleApiOperation(async () => {
			throw new Error("Poll not found");
		}, "getPollById");

		expect(result).toEqual({ success: false, error: "Poll not found" });
	});

	it("falls back to a generic message when a non-Error is thrown", async () => {
		const result = await handleApiOperation(async () => {
			throw "just a string";
		}, "getPollById");

		expect(result).toEqual({ success: false, error: "Something went wrong" });
	});

	it("reports the failure under its operation name", async () => {
		const thrown = new Error("boom");

		await handleApiOperation(async () => {
			throw thrown;
		}, "startRun");

		expect(reportApiFailure).toHaveBeenCalledWith(thrown, "startRun");
	});

	it("reports nothing when the operation succeeds", async () => {
		await handleApiOperation(async () => silphCo, "getLandmark");

		expect(reportApiFailure).not.toHaveBeenCalled();
	});
});
