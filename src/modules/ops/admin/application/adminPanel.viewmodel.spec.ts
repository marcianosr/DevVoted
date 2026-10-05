import { describe, expect, it } from "vitest";

import type { AdminDashboard } from "~/modules/ops/admin/application/admin.service";
import { TEST_DATES } from "~/test/kanto";
import {
	adminPanelDataFor,
	reminderFailureFor,
} from "~/modules/ops/admin/application/adminPanel.viewmodel";

const BROCK = {
	id: "brock",
	displayName: "Brock",
	email: "brock@pewter.gym",
	pollsSubmitted: 12,
	runId: 7,
};
const MISTY = { ...BROCK, id: "misty", displayName: "Misty", runId: null };

const DASHBOARD: AdminDashboard = {
	recentResponses: [
		{
			responseId: 9,
			pollId: 1,
			question: "Which method returns the last element of an array?",
			createdAt: null,
			displayName: null,
			email: null,
		},
	],
	users: [BROCK, MISTY],
	visits: [
		{
			id: 3,
			visitDate: "2026-05-13",
			visitorHash: "a1b2c3",
			routeId: "/run",
			hits: 4,
			device: "mobile",
			country: "NL",
			referrerHost: null,
			firstSeenAt: new Date("2026-05-13T08:00:00Z"),
			lastSeenAt: new Date("2026-05-13T09:30:00Z"),
			displayName: "Brock",
			photoUrl: "https://pewter.gym/brock.png",
		},
		{
			id: 2,
			visitDate: "2026-05-13",
			visitorHash: "d4e5f6",
			routeId: "/",
			hits: 1,
			device: "desktop",
			country: null,
			referrerHost: "github.com",
			firstSeenAt: new Date("2026-05-13T07:00:00Z"),
			lastSeenAt: new Date("2026-05-13T07:00:00Z"),
			displayName: null,
			photoUrl: null,
		},
	],
	stats: { totalUsers: 2, activeRuns: 1 },
	today: TEST_DATES.birthday,
	visitDays: [
		{ visitDate: "2026-05-13", signedIn: 3, anonymous: 5 },
		{ visitDate: "2026-05-11", signedIn: 1, anonymous: 0 },
	],
	visitTops: {
		devices: [{ value: "mobile", visitors: 6 }],
		countries: [{ value: null, visitors: 2 }],
		referrers: [{ value: "github.com", visitors: 1 }],
	},
	routeHits: [
		{ routeId: "/run", visitDate: "2026-05-13", hits: 4 },
		{ routeId: "/run", visitDate: "2026-05-12", hits: 10 },
		{ routeId: "/profile", visitDate: "2026-05-13", hits: 6 },
		{ routeId: "/admin", visitDate: "2026-05-10", hits: 7 },
	],
	signups: [
		{
			id: "ash",
			displayName: "Ash",
			createdDate: "2026-05-13",
			visitDates: ["2026-05-13"],
		},
		{
			id: "gary",
			displayName: "Gary",
			createdDate: "2026-05-10",
			visitDates: ["2026-05-10", "2026-05-11"],
		},
		{
			id: "oak",
			displayName: "Oak",
			createdDate: "2026-05-01",
			visitDates: ["2026-05-01", "2026-05-06"],
		},
		{
			id: "erika",
			displayName: "Erika",
			createdDate: "2026-05-02",
			visitDates: ["2026-05-02"],
		},
	],
	pollPool: [
		{ categoryCode: "js", published: 40, drafts: 2, neverDealt: 12 },
		{ categoryCode: "css", published: 9, drafts: 0, neverDealt: 1 },
	],
	dormant: [
		{
			id: "misty",
			displayName: "Misty",
			email: "misty@cerulean.gym",
			pollsSubmitted: 3,
			lastSeenAt: new Date("2026-05-09T12:00:00"),
		},
		{
			id: "koga",
			displayName: "Koga",
			email: "koga@fuchsia.gym",
			pollsSubmitted: 0,
			lastSeenAt: null,
		},
	],
};

describe("adminPanelDataFor", () => {
	it("splits the players by whether a run is active", () => {
		const { users } = adminPanelDataFor(DASHBOARD);

		expect(users.inRun.map((user) => user.id)).toEqual(["brock"]);
		expect(users.idle.map((user) => user.id)).toEqual(["misty"]);
	});

	it("states a response with no player as anonymous and with no stamp as a dash", () => {
		const [response] = adminPanelDataFor(DASHBOARD).recentResponses;

		expect(response).toMatchObject({ name: "Anonymous", at: "—", email: null });
	});
});

describe("adminPanelDataFor visits", () => {
	it("keeps the visits in the order they were last seen", () => {
		const { visits } = adminPanelDataFor(DASHBOARD);

		expect(visits.map((visit) => visit.id)).toEqual([3, 2]);
	});

	it("names a signed-in visitor and shows their avatar", () => {
		const [visit] = adminPanelDataFor(DASHBOARD).visits;

		expect(visit).toMatchObject({
			name: "Brock",
			avatarUrl: "https://pewter.gym/brock.png",
			route: "/run",
			hits: 4,
			device: "mobile",
			country: "NL",
			referrer: "—",
		});
		expect(visit.lastSeen).toMatch(/^05\/13\/2026 \d\d:30:00$/);
	});

	it("states a visitor with no account as anonymous with their hash and no avatar", () => {
		const [, visit] = adminPanelDataFor(DASHBOARD).visits;

		expect(visit).toMatchObject({
			name: "Anonymous",
			avatarUrl: null,
			visitor: "d4e5f6",
			country: "—",
			referrer: "github.com",
		});
	});
});

describe("adminPanelDataFor visit breakdown", () => {
	it("states every day of the window newest first, a quiet day as zero", () => {
		const { days } = adminPanelDataFor(DASHBOARD).visitBreakdown;

		expect(days).toHaveLength(7);
		expect(days[0]).toEqual({
			date: "2026-05-13",
			signedIn: 3,
			anonymous: 5,
			total: 8,
		});
		expect(days[1]).toEqual({
			date: "2026-05-12",
			signedIn: 0,
			anonymous: 0,
			total: 0,
		});
		expect(days[6]?.date).toBe("2026-05-07");
	});

	it("labels a missing country as a dash", () => {
		const { countries } = adminPanelDataFor(DASHBOARD).visitBreakdown;

		expect(countries).toEqual([{ label: "—", visitors: 2 }]);
	});
});

describe("adminPanelDataFor route traffic", () => {
	it("sets today's hits beside the daily average over the window, busiest today first", () => {
		const { routeTraffic } = adminPanelDataFor(DASHBOARD);

		expect(routeTraffic).toEqual([
			{ route: "/profile", today: 6, average: "0.9" },
			{ route: "/run", today: 4, average: "2.0" },
			{ route: "/admin", today: 0, average: "1.0" },
		]);
	});
});

describe("adminPanelDataFor signups", () => {
	it("counts the accounts made on each day of the window", () => {
		const { days } = adminPanelDataFor(DASHBOARD).signups;

		expect(days[0]).toEqual({ date: "2026-05-13", count: 1 });
		expect(days[3]).toEqual({ date: "2026-05-10", count: 1 });
		expect(days).toHaveLength(7);
	});

	it("measures the next-day return only over accounts old enough to have one", () => {
		expect(adminPanelDataFor(DASHBOARD).signups.nextDay).toBe("1 of 3 · 33%");
	});

	it("measures the first-week return only over accounts a week old", () => {
		expect(adminPanelDataFor(DASHBOARD).signups.firstWeek).toBe("1 of 2 · 50%");
	});

	it("states a dash when no account is old enough to measure", () => {
		const fresh = adminPanelDataFor({
			...DASHBOARD,
			signups: [DASHBOARD.signups[0]!],
		});

		expect(fresh.signups.nextDay).toBe("—");
	});
});

describe("adminPanelDataFor poll pool", () => {
	it("puts the category closest to running dry first", () => {
		const { pollPool } = adminPanelDataFor(DASHBOARD);

		expect(pollPool.map((row) => row.category)).toEqual(["css", "js"]);
		expect(pollPool[0]).toEqual({
			category: "css",
			published: 9,
			drafts: 0,
			neverDealt: 1,
		});
	});
});

describe("adminPanelDataFor dormant players", () => {
	it("states how long ago each player was last seen, a player never seen as never", () => {
		const { dormant } = adminPanelDataFor(DASHBOARD);

		expect(dormant).toEqual([
			{
				id: "misty",
				displayName: "Misty",
				email: "misty@cerulean.gym",
				pollsSubmitted: 3,
				lastSeen: "4 days ago",
			},
			{
				id: "koga",
				displayName: "Koga",
				email: "koga@fuchsia.gym",
				pollsSubmitted: 0,
				lastSeen: "never",
			},
		]);
	});
});

describe("reminderFailureFor", () => {
	it("names the address the reminder never reached", () => {
		expect(reminderFailureFor("brock@pewter.gym")).toBe(
			"Failed to send email to brock@pewter.gym"
		);
	});
});
