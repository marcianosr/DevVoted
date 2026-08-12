import { describe, expect, it } from "vitest";

import {
	COMMUNITY_ROUTE,
	RUN_ROUTES,
	routesForStatus,
	syncTarget,
} from "~/modules/run/run/application/runRoutes.viewmodel";

const climbing = (status: Parameters<typeof routesForStatus>[0] & object) => ({
	...status,
	awaitingTomorrow: false,
});

describe("routesForStatus", () => {
	it("sends a day without a run to the start screen", () => {
		expect(routesForStatus(null)).toEqual([RUN_ROUTES.start]);
	});

	it("maps the single-screen status to exactly its route", () => {
		expect(routesForStatus({ status: "configuring", gatesCleared: 0 })).toEqual(
			[RUN_ROUTES.configure]
		);
	});

	// Configure already shows the gate name and its stake before the climb
	// even starts, so gate 0 skips straight to the poll — no repeat page.
	it("answers gate 0 straight from configure, skipping prep", () => {
		expect(routesForStatus({ status: "answering", gatesCleared: 0 })).toEqual([
			RUN_ROUTES.answer,
		]);
	});

	// One server status, two page turns from gate 1 onward: the pre-gate
	// stake, then the poll.
	it("allows prep and answer past the first gate, with prep canonical", () => {
		expect(routesForStatus({ status: "answering", gatesCleared: 1 })).toEqual([
			RUN_ROUTES.prep,
			RUN_ROUTES.answer,
		]);
	});

	// One server status, four page turns: the payout, the answers, the shop,
	// and the prep hub the shop feeds into (ADR-032) — the gate starts there.
	it("allows reward, review, shop and prep while rewarding, with reward canonical", () => {
		expect(routesForStatus({ status: "rewarding", gatesCleared: 1 })).toEqual([
			RUN_ROUTES.reward,
			RUN_ROUTES.review,
			RUN_ROUTES.shop,
			RUN_ROUTES.prep,
		]);
	});

	// The failed gate closes on its answers too: strip → review, with the resume
	// waiting on the review page. Strip stays canonical — landing on the status
	// must always put the repair first.
	it("allows strip and review while awaiting a strip, with strip canonical", () => {
		expect(
			routesForStatus({ status: "awaiting-strip", gatesCleared: 1 })
		).toEqual([RUN_ROUTES.strip, RUN_ROUTES.review]);
	});

	it("routes both won and dead runs to the run-over screen", () => {
		expect(routesForStatus({ status: "won", gatesCleared: 12 })).toEqual([
			RUN_ROUTES.over,
		]);
		expect(routesForStatus({ status: "dead", gatesCleared: 3 })).toEqual([
			RUN_ROUTES.over,
		]);
	});
});

describe("syncTarget", () => {
	it("holds position while the run is still loading, even off-route", () => {
		expect(
			syncTarget(
				"/run/shop",
				climbing({ status: "answering", gatesCleared: 1 }),
				true
			)
		).toBeNull();
		expect(syncTarget("/run/shop", null, true)).toBeNull();
	});

	it("stays put on the allowed screen for the current status", () => {
		expect(
			syncTarget(
				"/run/prep",
				climbing({ status: "answering", gatesCleared: 1 }),
				false
			)
		).toBeNull();
		expect(
			syncTarget(
				"/run/answer",
				climbing({ status: "answering", gatesCleared: 1 }),
				false
			)
		).toBeNull();
		expect(syncTarget("/run", null, false)).toBeNull();
		expect(
			syncTarget(
				"/run/over",
				climbing({ status: "dead", gatesCleared: 1 }),
				false
			)
		).toBeNull();
	});

	it("stays put on any of the reward pages while rewarding", () => {
		expect(
			syncTarget(
				"/run/prep",
				climbing({ status: "rewarding", gatesCleared: 1 }),
				false
			)
		).toBeNull();
		expect(
			syncTarget(
				"/run/reward",
				climbing({ status: "rewarding", gatesCleared: 0 }),
				false
			)
		).toBeNull();
		expect(
			syncTarget(
				"/run/review",
				climbing({ status: "rewarding", gatesCleared: 0 }),
				false
			)
		).toBeNull();
		expect(
			syncTarget(
				"/run/shop",
				climbing({ status: "rewarding", gatesCleared: 0 }),
				false
			)
		).toBeNull();
	});

	// The review is only ever this gate's answers, so it has no meaning once the
	// status has moved on — the sync sends the player back to the live screen.
	it("redirects the review page away once the gate is no longer being paid out", () => {
		expect(
			syncTarget(
				"/run/review",
				climbing({ status: "answering", gatesCleared: 1 }),
				false
			)
		).toBe(RUN_ROUTES.prep);
	});

	it("redirects a stale screen to the canonical route for the status", () => {
		expect(
			syncTarget(
				"/run/answer",
				climbing({ status: "rewarding", gatesCleared: 0 }),
				false
			)
		).toBe(RUN_ROUTES.reward);
		expect(
			syncTarget(
				"/run/shop",
				climbing({ status: "answering", gatesCleared: 1 }),
				false
			)
		).toBe(RUN_ROUTES.prep);
	});

	// The community board's "back to your run" always lands on plain `/run`,
	// so this is the real trigger that shows prep before every gate past the
	// first one.
	it("sends a bare /run into a gate in progress to the prep screen", () => {
		expect(
			syncTarget(
				"/run",
				climbing({ status: "answering", gatesCleared: 1 }),
				false
			)
		).toBe(RUN_ROUTES.prep);
	});

	// Gate 0 has no prep route at all (Configure already covers it), so a deep
	// link there goes straight to the poll, not through a redirect to prep.
	it("sends a stale screen on gate 0 straight to the poll, never to prep", () => {
		expect(
			syncTarget(
				"/run/shop",
				climbing({ status: "answering", gatesCleared: 0 }),
				false
			)
		).toBe(RUN_ROUTES.answer);
		expect(
			syncTarget(
				"/run/prep",
				climbing({ status: "answering", gatesCleared: 0 }),
				false
			)
		).toBe(RUN_ROUTES.answer);
	});

	it("sends a day without a run back to the start screen", () => {
		expect(syncTarget("/run/configure", null, false)).toBe(RUN_ROUTES.start);
	});

	it("pulls the start screen forward into a live run", () => {
		expect(
			syncTarget(
				"/run",
				climbing({ status: "configuring", gatesCleared: 0 }),
				false
			)
		).toBe(RUN_ROUTES.configure);
	});

	it("stands down on paths that are not run screens", () => {
		expect(
			syncTarget(
				"/run/community",
				climbing({ status: "rewarding", gatesCleared: 0 }),
				false
			)
		).toBeNull();
		expect(
			syncTarget(
				"/dex",
				climbing({ status: "answering", gatesCleared: 1 }),
				false
			)
		).toBeNull();
	});

	// The daily lock (ADR-014): today's polls are spent, the run waits for
	// tomorrow's segment. There is nothing to show on any run screen, so the
	// player lands on the community board instead of a blank answer page.
	describe("while the run awaits tomorrow's polls", () => {
		const locked = {
			status: "answering",
			gatesCleared: 1,
			awaitingTomorrow: true,
		} as const;

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
