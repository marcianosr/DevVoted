import { beforeEach, describe, expect, it, vi } from "vitest";

import * as Sentry from "@sentry/tanstackstart-react";
import {
	identifyUser,
	reportApiFailure,
	reportHandledFailure,
	reportRecoverableReactError,
} from "~/shared/utils/errorReporting";
import { GYM_LEADERS } from "~/test/kanto";

vi.mock("@sentry/tanstackstart-react", () => ({
	captureException: vi.fn(),
	setUser: vi.fn(),
}));

const [brock, misty] = GYM_LEADERS;

beforeEach(() => {
	vi.clearAllMocks();
});

describe("reportApiFailure", () => {
	it("fingerprints on the operation, so one broken service is one issue however its message varies", () => {
		reportApiFailure(new Error("Poll 12 not found"), "getPollById");
		reportApiFailure(new Error("Poll 13 not found"), "getPollById");

		const fingerprints = vi
			.mocked(Sentry.captureException)
			.mock.calls.map(([, hint]) =>
				hint && "fingerprint" in hint ? hint.fingerprint : undefined
			);

		expect(fingerprints).toEqual([
			["api-operation", "getPollById"],
			["api-operation", "getPollById"],
		]);
	});

	it("reports at error level, so the default alert rules see it", () => {
		const thrown = new Error("boom");

		reportApiFailure(thrown, "startRun");

		expect(Sentry.captureException).toHaveBeenCalledWith(
			thrown,
			expect.objectContaining({ level: "error" })
		);
	});

	it("tags the operation, so it can be searched and grouped in Sentry", () => {
		reportApiFailure(new Error("boom"), "startRun");

		expect(Sentry.captureException).toHaveBeenCalledWith(
			expect.anything(),
			expect.objectContaining({ tags: { operation: "startRun" } })
		);
	});
});

describe("reportHandledFailure", () => {
	it("stays at warning level: the caller already recovered", () => {
		reportHandledFailure(new Error("no session"), "fetchUser.getUser");

		expect(Sentry.captureException).toHaveBeenCalledWith(
			expect.anything(),
			expect.objectContaining({ level: "warning" })
		);
	});

	it("keeps handled failures in their own fingerprint space", () => {
		reportHandledFailure(new Error("no session"), "fetchUser.getUser");

		expect(Sentry.captureException).toHaveBeenCalledWith(
			expect.anything(),
			expect.objectContaining({
				fingerprint: ["handled", "fetchUser.getUser"],
			})
		);
	});

	it("omits extra entirely when no context is given", () => {
		reportHandledFailure(new Error("no session"), "fetchUser.getUser");

		expect(Sentry.captureException).toHaveBeenCalledWith(
			expect.anything(),
			expect.not.objectContaining({ extra: expect.anything() })
		);
	});

	it("passes context through as extra when given", () => {
		reportHandledFailure(new Error("denied"), "readSession", {
			requestedUserId: brock.name,
		});

		expect(Sentry.captureException).toHaveBeenCalledWith(
			expect.anything(),
			expect.objectContaining({ extra: { requestedUserId: brock.name } })
		);
	});
});

describe("reportRecoverableReactError", () => {
	const HYDRATION_MISMATCH = new Error("Minified React error #418");
	const COMPONENT_STACK = "\n    at RunLayout\n    at Outlet";

	it("hands React's component stack to Sentry, so a minified hydration mismatch names its component", () => {
		reportRecoverableReactError(HYDRATION_MISMATCH, {
			componentStack: COMPONENT_STACK,
		});

		expect(Sentry.captureException).toHaveBeenCalledWith(
			HYDRATION_MISMATCH,
			expect.objectContaining({
				contexts: { react: { componentStack: COMPONENT_STACK } },
			})
		);
	});

	it("reports at error level under its own operation, so it alerts and searches apart from API failures", () => {
		reportRecoverableReactError(HYDRATION_MISMATCH, {});

		expect(Sentry.captureException).toHaveBeenCalledWith(
			HYDRATION_MISMATCH,
			expect.objectContaining({
				level: "error",
				tags: { operation: "react.recoverable" },
			})
		);
	});

	it("still prints to the console, so a developer with DevTools open sees what React recovered from", () => {
		const consoleError = vi
			.spyOn(console, "error")
			.mockImplementation(() => undefined);

		reportRecoverableReactError(HYDRATION_MISMATCH, {});

		expect(consoleError).toHaveBeenCalledWith(HYDRATION_MISMATCH);
		consoleError.mockRestore();
	});
});

describe("identifyUser", () => {
	it("sends the id alone, so a session cookie never rides along with a stack trace", () => {
		identifyUser(misty.name);

		expect(Sentry.setUser).toHaveBeenCalledWith({ id: misty.name });
	});
});
