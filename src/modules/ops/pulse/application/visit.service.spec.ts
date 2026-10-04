import { beforeEach, describe, expect, it, vi } from "vitest";

import { recordVisitService } from "~/modules/ops/pulse/application/visit.service";
import { upsertVisit } from "~/modules/ops/pulse/infrastructure/visit.repository";
import {
	isSameOrigin,
	visitorContextOf,
} from "~/modules/ops/pulse/infrastructure/visitor.repository";
import { findAuthenticatedUserId } from "~/shared/utils/authorization";
import { TEST_DATES } from "~/test/kanto";

vi.mock("~/modules/ops/pulse/infrastructure/visit.repository", () => ({
	upsertVisit: vi.fn(),
}));
vi.mock("~/modules/ops/pulse/infrastructure/visitor.repository", () => ({
	readRequestFacts: vi.fn(() => ({})),
	visitorContextOf: vi.fn(),
	isSameOrigin: vi.fn(),
}));
vi.mock("~/shared/utils/authorization", () => ({
	findAuthenticatedUserId: vi.fn(),
}));
vi.mock("~/shared/utils/errorReporting", () => ({
	reportHandledFailure: vi.fn(),
}));

const CONTEXT = {
	visitorHash: "deadbeefdeadbeefdeadbeefdeadbeef",
	device: "mobile" as const,
	country: "NL",
	referrerHost: "news.ycombinator.com",
};

const POLL_SCREEN = "/_authed/run/poll";

const record = (routeId: string = POLL_SCREEN) =>
	recordVisitService({ routeId, date: TEST_DATES.birthday });

beforeEach(() => {
	vi.clearAllMocks();
	vi.mocked(isSameOrigin).mockReturnValue(true);
	vi.mocked(visitorContextOf).mockReturnValue(CONTEXT);
	vi.mocked(findAuthenticatedUserId).mockResolvedValue(null);
});

describe("recordVisitService", () => {
	it("writes one visit carrying the screen and the request's own context", async () => {
		await record();

		expect(upsertVisit).toHaveBeenCalledWith({
			date: TEST_DATES.birthday,
			routeId: POLL_SCREEN,
			userId: null,
			...CONTEXT,
		});
	});

	it("records a signed-out visitor with a null user id rather than skipping them", async () => {
		await record("/login");

		expect(upsertVisit).toHaveBeenCalledWith(
			expect.objectContaining({ userId: null, routeId: "/login" })
		);
	});

	it("labels the row with the session's own user id, never the caller's claim", async () => {
		vi.mocked(findAuthenticatedUserId).mockResolvedValue(
			"red-from-pallet-town"
		);

		await record();

		expect(upsertVisit).toHaveBeenCalledWith(
			expect.objectContaining({ userId: "red-from-pallet-town" })
		);
	});

	it("writes nothing for a route id that is not in the generated tree", async () => {
		await record("/_authed/runs/482");

		expect(upsertVisit).not.toHaveBeenCalled();
	});

	it("writes nothing for a cross-site request", async () => {
		vi.mocked(isSameOrigin).mockReturnValue(false);

		await record();

		expect(upsertVisit).not.toHaveBeenCalled();
	});

	it("writes nothing when the hash secret is unset", async () => {
		vi.mocked(visitorContextOf).mockReturnValue(null);

		await record();

		expect(upsertVisit).not.toHaveBeenCalled();
	});

	it("still counts a crawler, marked as one, so bot traffic can be excluded later", async () => {
		vi.mocked(visitorContextOf).mockReturnValue({
			...CONTEXT,
			device: "bot",
		});

		await record();

		expect(upsertVisit).toHaveBeenCalledWith(
			expect.objectContaining({ device: "bot" })
		);
	});

	it("resolves rather than rejecting when the write fails", async () => {
		vi.mocked(upsertVisit).mockRejectedValue(new Error("connection lost"));

		await expect(record()).resolves.toBeUndefined();
	});
});
