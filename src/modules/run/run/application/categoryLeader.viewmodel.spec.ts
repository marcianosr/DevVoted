import { describe, expect, it } from "vitest";

import {
	type CategorySeat,
	MIN_LEADER,
} from "~/modules/run/run/domain/categoryLeader.model";
import {
	categoryBoardFor,
	categoryLeaderRowFor,
} from "~/modules/run/run/application/categoryLeader.viewmodel";

const GIT_SEAT: CategorySeat = {
	category: "git",
	leader: {
		userId: "leader-id",
		handle: "@blue",
		borderUrl: "/borders/x.png",
		best: 13,
		you: true,
	},
};

const seatHeldAt = (best: number): CategorySeat => ({
	...GIT_SEAT,
	leader: { userId: "leader-id", handle: "@blue", best, you: false },
});

describe("categoryLeaderRowFor", () => {
	it("bridges a held seat onto the row the board draws", () => {
		expect(categoryLeaderRowFor("streak", GIT_SEAT)).toEqual({
			category: "Git",
			leader: {
				userId: "leader-id",
				handle: "@blue",
				borderUrl: "/borders/x.png",
				figure: "13 in a row",
				you: true,
			},
		});
	});

	it("counts a run for the streak board and a volume for the correct board", () => {
		expect(categoryLeaderRowFor("streak", GIT_SEAT).leader?.figure).toBe(
			"13 in a row"
		);
		expect(categoryLeaderRowFor("correct", GIT_SEAT).leader?.figure).toBe(
			"13 correct"
		);
	});

	it("hands the board the player's id so the face and name reach their in-game page", () => {
		const row = categoryLeaderRowFor("streak", GIT_SEAT);

		expect(row.leader?.userId).toBe("leader-id");
		expect(row.leader).not.toHaveProperty("githubLogin");
	});

	it("says what claims a seat nobody holds, in the board's own figure", () => {
		expect(categoryLeaderRowFor("streak", { category: "vue" })).toEqual({
			category: "Vue",
			claim: "3 in a row claims it",
		});
		expect(categoryLeaderRowFor("correct", { category: "vue" })).toEqual({
			category: "Vue",
			claim: "4 correct claims it",
		});
	});

	it("builds the claim out of the figure that beats it, so the two cannot drift", () => {
		const atTheFloor = seatHeldAt(MIN_LEADER.correct);

		expect(categoryLeaderRowFor("correct", { category: "vue" }).claim).toBe(
			`${categoryLeaderRowFor("correct", atTheFloor).leader?.figure} claims it`
		);
	});
});

describe("categoryBoardFor", () => {
	it("names each board and the scope its figure encodes", () => {
		const streak = categoryBoardFor({ measure: "streak", seats: [GIT_SEAT] });
		const correct = categoryBoardFor({ measure: "correct", seats: [GIT_SEAT] });

		expect(streak.title).toBe("streak");
		expect(streak.summary).toBe("All-time longest run streak");
		expect(correct.title).toBe("correct");
		expect(correct.summary).toBe("All-time longest run of correct answers");
	});

	it("draws every seat it was handed, held or open", () => {
		const board = categoryBoardFor({
			measure: "correct",
			seats: [GIT_SEAT, { category: "vue" }],
		});

		expect(board.seats).toHaveLength(2);
		expect(board.seats[0]?.leader?.figure).toBe("13 correct");
		expect(board.seats[1]?.claim).toBe("4 correct claims it");
	});
});
