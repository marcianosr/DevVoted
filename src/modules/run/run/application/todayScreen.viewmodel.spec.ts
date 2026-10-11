import { describe, expect, it } from "vitest";

import {
	createMockGateStake,
	createMockRunView,
	createMockShopControls,
} from "~/test/runView.factory";
import {
	communityLineFor,
	hubBuildFor,
	hubHeadlineFor,
	hubPressFor,
	hubSwatchFor,
	incomingIncidentsFor,
	pollsBadgeFor,
	runSoFarFor,
	shopAsideFor,
	startRefusalFor,
} from "~/modules/run/run/application/todayScreen.viewmodel";
import type { CommunityVoter } from "~/modules/run/community/domain/voter.model";
import { CONFIGS } from "~/modules/run/config/domain/configRoster.model";
import { SLICE_WINDOW } from "~/modules/run/run/domain/rules.model";
import type { AnsweredPoll } from "~/modules/run/run/domain/runPoll.model";
import { CATEGORY_CODES } from "~/shared/lib/categories";

const answered = (index: number): AnsweredPoll => ({
	id: `poll-${index + 1}`,
	question: "Which town does the journey start in?",
	category: CATEGORY_CODES[0],
	outcome: "correct",
	picked: ["Pallet Town"],
});

const OPEN = { isOpen: true, remaining: "0m", remainingMs: 0 };
const SHUT = {
	isOpen: false,
	remaining: "7h 23m",
	remainingMs: 7 * 3_600_000 + 23 * 60_000 + 59_000,
};
const UNKNOWN = null;
const DAY_SPENT = 0;
const RUN_NUMBER = 14;

const waitingView = (gatesCleared = 3) =>
	createMockRunView({
		gatesCleared,
		status: "rewarding",
		pollsExhausted: true,
		pollsLeftToday: 0,
	});

describe(hubHeadlineFor, () => {
	it("names the gate ahead and counts its polls while they are ready", () => {
		const headline = hubHeadlineFor(
			createMockRunView({
				gatesCleared: 3,
				status: "rewarding",
				answeredThisGate: [],
			}),
			SHUT,
			UNKNOWN,
			RUN_NUMBER
		);

		expect(headline).toMatchObject({
			title: "Vermilion",
			clock: null,
			subtext: "5 polls ready · prep first",
			mark: { kind: "polls", count: 5 },
		});
	});

	it("carries the run readout as its eyebrow while a run is live", () => {
		const headline = hubHeadlineFor(
			createMockRunView({ gatesCleared: 3 }),
			SHUT,
			UNKNOWN,
			RUN_NUMBER
		);

		expect(headline.readout).toEqual({ runNumber: 14, gate: 3, gates: 12 });
	});

	it("reads the poll's position once the gate is being answered", () => {
		const headline = hubHeadlineFor(
			createMockRunView({ status: "answering", answeredThisGate: [] }),
			SHUT,
			UNKNOWN,
			RUN_NUMBER
		);

		expect(headline.subtext).toBe("Poll 1 out of 5");
	});

	it("warns that a part-answered day's leftovers do not carry to tomorrow", () => {
		const headline = hubHeadlineFor(
			createMockRunView({
				status: "answering",
				answeredThisGate: [answered(0), answered(1)],
				pollsLeftToday: 3,
			}),
			SHUT,
			UNKNOWN,
			RUN_NUMBER
		);

		expect(headline.subtext).toBe(
			"Poll 3 out of 5 · 3 of today’s 5 left · they do not carry to tomorrow"
		);
		expect(headline.mark).toEqual({ kind: "polls", count: 3 });
	});

	it("states when the gate opens over a ticking clock once the day is spent", () => {
		const headline = hubHeadlineFor(waitingView(), SHUT, UNKNOWN, RUN_NUMBER);

		expect(headline).toMatchObject({
			title: "Vermilion opens in",
			clock: { main: "7h 23m", seconds: "59s" },
			subtext: "Today’s polls are done. Back tomorrow!",
			mark: { kind: "lock" },
		});
	});

	it("says when new polls come once the day is spent with no run open", () => {
		const headline = hubHeadlineFor(null, SHUT, DAY_SPENT, RUN_NUMBER);

		expect(headline).toMatchObject({
			readout: null,
			title: "New polls in",
			clock: { main: "7h 23m", seconds: "59s" },
			mark: { kind: "lock" },
		});
	});

	it("titles the first gate for a fresh start and says how long the day has", () => {
		const headline = hubHeadlineFor(null, SHUT, UNKNOWN, RUN_NUMBER);

		expect(headline).toMatchObject({
			readout: null,
			title: "Pallet",
			clock: null,
			subtext: "5 polls ready · New polls in 7h 23m",
			mark: { kind: "polls", count: SLICE_WINDOW },
		});
	});

	it("titles the first gate again once the last run is over, readout gone", () => {
		const headline = hubHeadlineFor(
			createMockRunView({ isOver: true, gatesCleared: 3 }),
			SHUT,
			UNKNOWN,
			RUN_NUMBER
		);

		expect(headline.title).toBe("Pallet");
		expect(headline.readout).toBeNull();
	});

	it("counts what the day has left on a fresh start after a part-spent day", () => {
		const headline = hubHeadlineFor(
			createMockRunView({ isOver: true }),
			SHUT,
			2,
			RUN_NUMBER
		);

		expect(headline.subtext).toBe("2 polls ready · New polls in 7h 23m");
		expect(headline.mark).toEqual({ kind: "polls", count: 2 });
	});

	it("unlocks the moment the clock runs out, without a reload", () => {
		const headline = hubHeadlineFor(waitingView(), OPEN, UNKNOWN, RUN_NUMBER);

		expect(headline.mark.kind).toBe("polls");
		expect(headline.clock).toBeNull();
	});
});

describe(hubPressFor, () => {
	it("leads to the shop with the balance to spend while the day waits", () => {
		const press = hubPressFor(
			createMockRunView({
				status: "rewarding",
				pollsExhausted: true,
				storage: 106,
			}),
			SHUT,
			UNKNOWN
		);

		expect(press).toEqual({
			kind: "shop",
			label: "To shop",
			note: "spend 106 KB",
			mark: "shop",
		});
	});

	it("still enters a skipped shop, and says it was skipped", () => {
		const press = hubPressFor(
			createMockRunView({
				status: "rewarding",
				pollsExhausted: true,
				shopControls: createMockShopControls({ shopSkipped: true }),
			}),
			SHUT,
			UNKNOWN
		);

		expect(press.kind).toBe("shop");
		expect(press.note).toBe("skipped");
	});

	it("refuses the climb, never the shop, when the shop is shut on a spent day", () => {
		const press = hubPressFor(
			createMockRunView({
				gatesCleared: 3,
				status: "answering",
				pollsExhausted: true,
			}),
			SHUT,
			UNKNOWN
		);

		expect(press).toEqual({
			kind: "locked",
			label: "Continue to Vermilion",
			mark: "polls",
		});
	});

	it("refuses a fresh start once the day is spent with no run open", () => {
		const press = hubPressFor(null, SHUT, DAY_SPENT);

		expect(press).toEqual({
			kind: "locked",
			label: "Start today’s climb",
			mark: "polls",
		});
	});

	it("refuses a fresh start once a finished run spent the day", () => {
		const press = hubPressFor(
			createMockRunView({ isOver: true, pollsExhausted: false }),
			SHUT,
			DAY_SPENT
		);

		expect(press.kind).toBe("locked");
	});

	it("offers a fresh start when no run is open", () => {
		const press = hubPressFor(null, SHUT, UNKNOWN);

		expect(press).toEqual({
			kind: "start",
			label: "Start today’s climb",
			mark: "polls",
			pollsLeft: SLICE_WINDOW,
		});
	});

	it("offers a fresh start once the last run is over", () => {
		const press = hubPressFor(
			createMockRunView({ isOver: true }),
			SHUT,
			UNKNOWN
		);

		expect(press.kind).toBe("start");
	});

	it("counts what the day has left on a fresh start after a part-spent day", () => {
		const press = hubPressFor(createMockRunView({ isOver: true }), SHUT, 2);

		expect(press.pollsLeft).toBe(2);
	});

	it("offers a fresh start on a spent day once the clock rolls over", () => {
		expect(hubPressFor(null, OPEN, DAY_SPENT).kind).toBe("start");
	});

	it("continues to the gate ahead with the polls it has left", () => {
		const press = hubPressFor(
			createMockRunView({
				gatesCleared: 3,
				pollsPerGate: 5,
				answeredThisGate: [answered(0), answered(1)],
				pollsLeftToday: 96,
			}),
			SHUT,
			UNKNOWN
		);

		expect(press).toEqual({
			kind: "resume",
			label: "Continue to Vermilion",
			mark: "polls",
			pollsLeft: 3,
		});
	});

	it("keeps the shop a secondary press while polls are ready, even as the gate pays out", () => {
		const press = hubPressFor(
			createMockRunView({ status: "rewarding", pollsExhausted: false }),
			SHUT,
			UNKNOWN
		);

		expect(press.kind).toBe("resume");
	});

	it("states no count rather than a nought once the gate is answered out", () => {
		const press = hubPressFor(
			createMockRunView({
				pollsPerGate: 5,
				answeredThisGate: Array.from({ length: 6 }, answered),
			}),
			SHUT,
			UNKNOWN
		);

		expect(press.pollsLeft).toBeUndefined();
	});

	it("reopens the moment the clock runs out, without a reload", () => {
		const press = hubPressFor(
			createMockRunView({ pollsExhausted: true, pollsLeftToday: 0 }),
			OPEN,
			UNKNOWN
		);

		expect(press.kind).toBe("resume");
	});
});

describe(hubSwatchFor, () => {
	it("wears the gate the live run stands before", () => {
		expect(hubSwatchFor(createMockRunView({ gatesCleared: 3 })).gateName).toBe(
			"Vermilion"
		);
	});

	it("wears the first gate before a run is open", () => {
		expect(hubSwatchFor(null).gateName).toBe("Pallet");
	});

	it("wears the first gate once the last run is over, not where it died", () => {
		expect(
			hubSwatchFor(createMockRunView({ isOver: true, gatesCleared: 3 }))
				.gateName
		).toBe("Pallet");
	});
});

describe(runSoFarFor, () => {
	const closes = [
		{ gate: 0, band: "perfect", cleared: true, kb: 32 },
		{ gate: 1, band: "healthy", cleared: true, kb: 19 },
		{ gate: 2, band: "ok", cleared: true, kb: 13 },
	] as const;

	it("lists every closed gate with its grade and what it earned", () => {
		const soFar = runSoFarFor(
			createMockRunView({ gatesCleared: 3, closes }),
			SHUT
		);

		expect(
			soFar?.rows.map((row) => [row.swatch.gateName, row.band.label, row.kb])
		).toEqual([
			["Pallet", "PERFECT", "+32 KB"],
			["Pewter", "HEALTHY", "+19 KB"],
			["Cerulean", "OK", "+13 KB"],
		]);
		expect(soFar?.earned).toBe("+64 KB");
	});

	it("shows a held gate once, by the close that finally cleared it", () => {
		const soFar = runSoFarFor(
			createMockRunView({
				gatesCleared: 1,
				closes: [
					{ gate: 0, band: "shaky", cleared: false, kb: 0 },
					{ gate: 0, band: "ok", cleared: true, kb: 12 },
				],
			}),
			SHUT
		);

		expect(soFar?.rows).toHaveLength(1);
		expect(soFar?.rows[0]?.band.label).toBe("OK");
	});

	it("quotes the next gate from the coverage held and a clean clear while polls are open", () => {
		const soFar = runSoFarFor(
			createMockRunView({
				gatesCleared: 3,
				pollsAnswered: 1,
				fullClearKb: 40,
				gateStake: createMockGateStake({ coverageHeld: 40 }),
			}),
			SHUT
		);

		expect(soFar?.next).toMatchObject({
			note: "next",
			quote: { started: true, share: "40%", kb: "+40 KB" },
		});
		expect(soFar?.next?.swatch.gateName).toBe("Vermilion");
	});

	it("reads the next gate as not started until its first poll is answered", () => {
		const soFar = runSoFarFor(
			createMockRunView({
				pollsAnswered: 0,
				gateStake: createMockGateStake({ coverageHeld: 0.9 }),
			}),
			SHUT
		);

		expect(soFar?.next?.quote?.started).toBe(false);
	});

	it("reads the next gate as not started while the cleared gate's answers wait for the shop", () => {
		const soFar = runSoFarFor(
			createMockRunView({
				gatesCleared: 1,
				answeredThisGate: [0, 1, 2, 3, 4].map(answered),
				pollsAnswered: 0,
			}),
			SHUT
		);

		expect(soFar?.next?.quote?.started).toBe(false);
	});

	it("says the next gate opens tomorrow and quotes nothing while the day waits", () => {
		const soFar = runSoFarFor(waitingView(), SHUT);

		expect(soFar?.next).toMatchObject({ note: "opens tomorrow", quote: null });
	});

	it("quotes the next gate again the moment the clock runs out", () => {
		const soFar = runSoFarFor(waitingView(), OPEN);

		expect(soFar?.next?.quote).not.toBeNull();
	});

	it("drops the next gate once the run is over", () => {
		expect(
			runSoFarFor(createMockRunView({ isOver: true }), SHUT)?.next
		).toBeNull();
	});
});

describe(hubBuildFor, () => {
	it("lists each installed config with its weight, version and what it does", () => {
		const view = createMockRunView({
			installed: [
				{
					config: { ...CONFIGS.codeCoverage, level: 2 },
					slots: 2,
					canMinify: false,
					minifySavingSlots: 0,
				},
			],
			slotsUsed: 4,
			slots: 6,
			slotsFree: 2,
		});
		const build = hubBuildFor({
			...view,
			buildSpace: { ...view.buildSpace, freeWeight: 2 },
		});

		expect(build).toEqual({
			rows: [
				{
					id: "code-coverage",
					name: "Code Coverage",
					description: CONFIGS.codeCoverage.description,
					slots: 2,
					version: 2,
				},
			],
			weight: "4 / 6",
			held: 6,
			free: 2,
		});
	});

	it("states the weight free under the current space, not the room up to the top rung", () => {
		const view = createMockRunView({ slotsUsed: 3, slots: 4, slotsFree: 29 });
		const build = hubBuildFor({
			...view,
			buildSpace: { ...view.buildSpace, space: 4, weight: 3, freeWeight: 1 },
		});

		expect(build?.free).toBe(1);
	});

	it("has no build before a run is open", () => {
		expect(hubBuildFor(null)).toBeNull();
	});
});

describe(incomingIncidentsFor, () => {
	it("names a rival's incident waiting at the next gate", () => {
		const view = createMockRunView({
			gatesCleared: 3,
			audits: [
				{
					id: "not-found",
					code: 404,
					name: "Not Found",
					description: "",
					suppressed: false,
					sentBy: { id: "erika", name: "erika" },
				},
			],
		});

		expect(incomingIncidentsFor(view)).toEqual([
			{
				id: "not-found",
				code: 404,
				name: "Not Found",
				cue: "waits at Vermilion · it replaces one audit",
				sender: "@erika",
			},
		]);
	});

	it("leaves out the gate's own drawn audits", () => {
		const view = createMockRunView({
			audits: [
				{
					id: "not-found",
					code: 404,
					name: "Not Found",
					description: "",
					suppressed: false,
				},
			],
		});

		expect(incomingIncidentsFor(view)).toEqual([]);
	});
});

const voter = (index: number): CommunityVoter => ({
	id: `player-${index}`,
	displayName: `Player ${index}`,
	photoUrl: index === 0 ? "https://example.test/giovanni.png" : null,
	borderUrl: null,
	you: index === 1,
});

describe(communityLineFor, () => {
	it("counts the room and shows its faces", () => {
		const room = communityLineFor(3, [0, 1, 2].map(voter));

		expect(room).toMatchObject({ count: 3, detail: "today", overflow: 0 });
		expect(room?.faces.map((face) => face.name)).toEqual([
			"Player 0",
			"Player 1",
			"Player 2",
		]);
	});

	it("carries a face's photo and marks yours, but gives it no link", () => {
		const room = communityLineFor(2, [0, 1].map(voter));

		expect(room?.faces[0]).toEqual({
			name: "Player 0",
			photoUrl: "https://example.test/giovanni.png",
			borderUrl: undefined,
			you: false,
		});
		expect(room?.faces[1]?.you).toBe(true);
		expect(room?.faces[0]?.userId).toBeUndefined();
	});

	it("shows ten faces and folds the rest of the room into a count", () => {
		const room = communityLineFor(
			14,
			Array.from({ length: 14 }, (_, index) => voter(index))
		);

		expect(room?.faces).toHaveLength(10);
		expect(room?.overflow).toBe(4);
	});

	it("states nothing until the room has been counted", () => {
		expect(communityLineFor(undefined)).toBeNull();
	});
});

describe(shopAsideFor, () => {
	it("steps aside while the shop is the press", () => {
		expect(shopAsideFor(waitingView(), SHUT, UNKNOWN)).toBeNull();
	});

	it("stays open beside the press until the gate starts", () => {
		const shop = shopAsideFor(
			createMockRunView({ status: "rewarding" }),
			SHUT,
			UNKNOWN
		);

		expect(shop).toEqual({
			label: "Shop",
			open: true,
			detail: "open until you start",
		});
	});

	it("says a skipped shop was skipped, and still opens it", () => {
		const shop = shopAsideFor(
			createMockRunView({
				status: "rewarding",
				shopControls: createMockShopControls({ shopSkipped: true }),
			}),
			SHUT,
			UNKNOWN
		);

		expect(shop).toMatchObject({ open: true, detail: "skipped" });
	});

	it("shuts the shop mid-gate and names itself plus the reason, for the label", () => {
		const shop = shopAsideFor(
			createMockRunView({ status: "answering" }),
			SHUT,
			UNKNOWN
		);

		expect(shop?.open).toBe(false);
		expect(shop?.hint).toBe("Shop · the shop opens when you clear a gate");
	});

	it("shuts the shop before a run is open", () => {
		expect(shopAsideFor(null, SHUT, UNKNOWN)?.open).toBe(false);
	});

	it("steps back in as the secondary press the moment the clock runs out", () => {
		expect(shopAsideFor(waitingView(), OPEN, UNKNOWN)?.open).toBe(true);
	});
});

describe(pollsBadgeFor, () => {
	it("counts the whole day before a run is open", () => {
		expect(pollsBadgeFor(null, SHUT, UNKNOWN)).toBe(SLICE_WINDOW);
	});

	it("counts the whole day again once the run is over", () => {
		expect(
			pollsBadgeFor(createMockRunView({ isOver: true }), SHUT, UNKNOWN)
		).toBe(SLICE_WINDOW);
	});

	it("counts down what the gate has left, not the whole run's pool", () => {
		const view = createMockRunView({
			answeredThisGate: [answered(0), answered(1)],
			pollsLeftToday: 96,
		});

		expect(pollsBadgeFor(view, SHUT, UNKNOWN)).toBe(3);
	});

	it("counts one on the gate's last poll", () => {
		const view = createMockRunView({
			answeredThisGate: [answered(0), answered(1), answered(2), answered(3)],
		});

		expect(pollsBadgeFor(view, SHUT, UNKNOWN)).toBe(1);
	});

	it("states nothing rather than a nought once the gate is answered out", () => {
		const view = createMockRunView({
			answeredThisGate: [
				answered(0),
				answered(1),
				answered(2),
				answered(3),
				answered(4),
			],
		});

		expect(pollsBadgeFor(view, SHUT, UNKNOWN)).toBeUndefined();
	});

	it("states nothing once the day has no polls left", () => {
		const view = createMockRunView({ pollsExhausted: true });

		expect(pollsBadgeFor(view, SHUT, UNKNOWN)).toBeUndefined();
	});

	it("states nothing when no run is open and the day is spent", () => {
		expect(pollsBadgeFor(null, SHUT, DAY_SPENT)).toBeUndefined();
	});

	it("goes back to counting the moment the day rolls over", () => {
		const view = createMockRunView({ pollsExhausted: true });

		expect(pollsBadgeFor(view, OPEN, UNKNOWN)).toBe(SLICE_WINDOW);
	});
});

describe(startRefusalFor, () => {
	it("refuses a new run with when polls return once the day is spent", () => {
		expect(
			startRefusalFor(createMockRunView({ isOver: true }), SHUT, DAY_SPENT)
		).toBe("New polls in 7h 23m");
	});

	it("lets a new run start while the day has polls left", () => {
		expect(
			startRefusalFor(createMockRunView({ isOver: true }), SHUT, 3)
		).toBeUndefined();
	});

	it("lets a new run start while the day's count is still loading", () => {
		expect(
			startRefusalFor(createMockRunView({ isOver: true }), SHUT, UNKNOWN)
		).toBeUndefined();
	});
});
