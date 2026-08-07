import { describe, expect, it } from "vitest";

import {
	COMMUNITY_ROUTE,
	RUN_ROUTES,
	routesForStatus,
	syncTarget,
} from "./runRoutes.viewmodel";

const climbing = (status: Parameters<typeof routesForStatus>[0] & object) => ({
	...status,
	awaitingTomorrow: false,
});

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
	});

	// One server status, three page turns: the payout, the answers, the shop.
	it("allows reward, review and shop while rewarding, with reward canonical", () => {
		expect(routesForStatus({ status: "rewarding" })).toEqual([
			RUN_ROUTES.reward,
			RUN_ROUTES.review,
			RUN_ROUTES.shop,
		]);
	});

	// The failed gate closes on its answers too: strip → review, with the resume
	// waiting on the review page. Strip stays canonical — landing on the status
	// must always put the repair first.
	it("allows strip and review while awaiting a strip, with strip canonical", () => {
		expect(routesForStatus({ status: "awaiting-strip" })).toEqual([
			RUN_ROUTES.strip,
			RUN_ROUTES.review,
		]);
	});

	it("routes both won and dead runs to the run-over screen", () => {
		expect(routesForStatus({ status: "won" })).toEqual([RUN_ROUTES.over]);
		expect(routesForStatus({ status: "dead" })).toEqual([RUN_ROUTES.over]);
	});
});

describe("syncTarget", () => {
	it("holds position while the run is still loading, even off-route", () => {
		expect(
			syncTarget("/run/shop", climbing({ status: "answering" }), true)
		).toBeNull();
		expect(syncTarget("/run/shop", null, true)).toBeNull();
	});

	it("stays put on the allowed screen for the current status", () => {
		expect(
			syncTarget("/run/answer", climbing({ status: "answering" }), false)
		).toBeNull();
		expect(syncTarget("/run", null, false)).toBeNull();
		expect(
			syncTarget("/run/over", climbing({ status: "dead" }), false)
		).toBeNull();
	});

	it("stays put on any of the three reward pages while rewarding", () => {
		expect(
			syncTarget("/run/reward", climbing({ status: "rewarding" }), false)
		).toBeNull();
		expect(
			syncTarget("/run/review", climbing({ status: "rewarding" }), false)
		).toBeNull();
		expect(
			syncTarget("/run/shop", climbing({ status: "rewarding" }), false)
		).toBeNull();
	});

	// The review is only ever this gate's answers, so it has no meaning once the
	// status has moved on — the sync sends the player back to the live screen.
	it("redirects the review page away once the gate is no longer being paid out", () => {
		expect(
			syncTarget("/run/review", climbing({ status: "answering" }), false)
		).toBe(RUN_ROUTES.answer);
	});

	it("redirects a stale screen to the canonical route for the status", () => {
		expect(
			syncTarget("/run/answer", climbing({ status: "rewarding" }), false)
		).toBe(RUN_ROUTES.reward);
		expect(
			syncTarget("/run/shop", climbing({ status: "answering" }), false)
		).toBe(RUN_ROUTES.answer);
	});

	it("sends a day without a run back to the start screen", () => {
		expect(syncTarget("/run/configure", null, false)).toBe(RUN_ROUTES.start);
	});

	it("pulls the start screen forward into a live run", () => {
		expect(syncTarget("/run", climbing({ status: "configuring" }), false)).toBe(
			RUN_ROUTES.configure
		);
	});

	it("stands down on paths that are not run screens", () => {
		expect(
			syncTarget("/run/community", climbing({ status: "rewarding" }), false)
		).toBeNull();
		expect(
			syncTarget("/dex", climbing({ status: "answering" }), false)
		).toBeNull();
	});

	// The daily lock (ADR-014): today's polls are spent, the run waits for
	// tomorrow's segment. There is nothing to show on any run screen, so the
	// player lands on the community board instead of a blank answer page.
	describe("while the run awaits tomorrow's polls", () => {
		const locked = { status: "answering", awaitingTomorrow: true } as const;

		it("sends the answer screen to the community board", () => {
			expect(syncTarget("/run/answer", locked, false)).toBe(COMMUNITY_ROUTE);
		});

		it("sends every other run screen to the community board too", () => {
			expect(syncTarget("/run", locked, false)).toBe(COMMUNITY_ROUTE);
			expect(syncTarget("/run/shop", locked, false)).toBe(COMMUNITY_ROUTE);
		});

		it("stays put once on the community board", () => {
			expect(syncTarget("/run/community", locked, false)).toBeNull();
		});

		it("holds position while the run is still loading", () => {
			expect(syncTarget("/run/answer", locked, true)).toBeNull();
		});
	});
});
