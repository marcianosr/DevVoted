import { describe, expect, it } from "vitest";

import type { AdminDashboard } from "~/modules/ops/admin/application/admin.service";
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
	activePolls: [
		{
			id: 1,
			question: "Which method returns the last element of an array?",
			categoryCode: "js",
			openingTime: new Date("2026-05-13T08:00:00Z"),
			closingTime: new Date("2026-05-13T20:00:00Z"),
		},
	],
	pastPolls: [
		{
			pollId: 2,
			question: "What does :has() select?",
			categoryCode: "css",
			occurrences: 2,
			lastDate: "2026-05-12",
			allDates: ["2026-05-12", "2026-05-01"],
		},
	],
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
	stats: { totalUsers: 2, activeRuns: 1 },
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

	it("joins the dates a past poll was dealt on", () => {
		const [poll] = adminPanelDataFor(DASHBOARD).pastPolls;

		expect(poll.allDates).toBe("2026-05-12, 2026-05-01");
		expect(poll.lastShown).toBe("2026-05-12");
	});

	it("stamps a poll's window as a date and a time", () => {
		const [poll] = adminPanelDataFor(DASHBOARD).activePolls;

		expect(poll.opens).toMatch(/^05\/13\/2026 \d\d:00:00$/);
	});
});

describe("reminderFailureFor", () => {
	it("names the address the reminder never reached", () => {
		expect(reminderFailureFor("brock@pewter.gym")).toBe(
			"Failed to send email to brock@pewter.gym"
		);
	});
});
