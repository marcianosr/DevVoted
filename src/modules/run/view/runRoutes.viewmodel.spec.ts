import { describe, expect, it } from "vitest";

import { RUN_ROUTES, routesForStatus, syncTarget } from "./runRoutes.viewmodel";

describe("routesForStatus", () => {
	it("sends a day without a run to the start screen", () => {
		expect(routesForStatus(null)).toEqual([RUN_ROUTES.start]);
	});

	it("maps each single-screen status to exactly its route", () => {
		expect(routesForStatus({ status: "configuring" })).toEqual([
			RUN_ROUTES.configure,
		]);
		expect(routesForStatus({ status: "answering" })).toEqual([
			RUN_ROUTES.answer,
		]);
		expect(routesForStatus({ status: "awaiting-strip" })).toEqual([
			RUN_ROUTES.strip,
		]);
	});

	it("allows both reward and shop while rewarding, with reward canonical", () => {
		expect(routesForStatus({ status: "rewarding" })).toEqual([
			RUN_ROUTES.reward,
			RUN_ROUTES.shop,
		]);
	});

	it("routes both won and dead runs to the run-over screen", () => {
		expect(routesForStatus({ status: "won" })).toEqual([RUN_ROUTES.over]);
		expect(routesForStatus({ status: "dead" })).toEqual([RUN_ROUTES.over]);
	});
});

describe("syncTarget", () => {
	it("holds position while the run is still loading, even off-route", () => {
		expect(syncTarget("/run/shop", { status: "answering" }, true)).toBeNull();
		expect(syncTarget("/run/shop", null, true)).toBeNull();
	});

	it("stays put on the allowed screen for the current status", () => {
		expect(
			syncTarget("/run/answer", { status: "answering" }, false)
		).toBeNull();
		expect(syncTarget("/run", null, false)).toBeNull();
		expect(syncTarget("/run/over", { status: "dead" }, false)).toBeNull();
	});

	it("stays put on either reward page while rewarding", () => {
		expect(
			syncTarget("/run/reward", { status: "rewarding" }, false)
		).toBeNull();
		expect(syncTarget("/run/shop", { status: "rewarding" }, false)).toBeNull();
	});

	it("redirects a stale screen to the canonical route for the status", () => {
		expect(syncTarget("/run/answer", { status: "rewarding" }, false)).toBe(
			RUN_ROUTES.reward
		);
		expect(syncTarget("/run/shop", { status: "answering" }, false)).toBe(
			RUN_ROUTES.answer
		);
	});

	it("sends a day without a run back to the start screen", () => {
		expect(syncTarget("/run/configure", null, false)).toBe(RUN_ROUTES.start);
	});

	it("pulls the start screen forward into a live run", () => {
		expect(syncTarget("/run", { status: "configuring" }, false)).toBe(
			RUN_ROUTES.configure
		);
	});

	it("stands down on paths that are not run screens", () => {
		expect(
			syncTarget("/run/community", { status: "rewarding" }, false)
		).toBeNull();
		expect(syncTarget("/dex", { status: "answering" }, false)).toBeNull();
	});
});
