import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import type {
	RunCommunityPoll,
	RunCommunityView,
} from "~/modules/run/community/application/community.service";
import {
	CommunityView,
	defaultChipId,
	ladderFor,
	pollChipsFor,
	pollDetailFor,
	standoutEntriesFor,
} from "~/modules/run/community/presentation/CommunityView.component";

const answered = (
	pollId: number,
	index: number,
	over: Partial<RunCommunityPoll> = {}
): RunCommunityPoll => ({
	pollId,
	index,
	question: `Question ${pollId}?`,
	category: "ts",
	outcome: "correct",
	detail: {
		answerType: "single",
		answeredCount: 3,
		gotItRightCount: 1,
		youGotItRight: true,
		options: [
			{
				label: "string",
				isRight: true,
				count: 1,
				percent: 33,
				yours: false,
				voters: [],
			},
			{
				label: "number",
				isRight: false,
				count: 2,
				percent: 67,
				yours: true,
				voters: [],
			},
		],
	},
	...over,
});

const sealed = (pollId: number, index: number): RunCommunityPoll => ({
	pollId,
	index,
	question: `Question ${pollId}?`,
	category: null,
	outcome: "missed",
	detail: null,
});

const climber = (
	id: string,
	gate: number,
	pollsIntoGate: number,
	you = false
) => ({
	id,
	displayName: id,
	photoUrl: null,
	borderUrl: null,
	gate,
	pollsIntoGate,
	you,
});

describe("pollChipsFor", () => {
	it("deals five chips: open, sealed and unreached", () => {
		const chips = pollChipsFor([answered(10, 0), sealed(11, 1)]);

		expect(chips).toHaveLength(5);
		expect(chips[0]).toEqual({ id: "10", label: "1", disabled: false });
		expect(chips[1]).toEqual({ id: "11", label: "2", disabled: true });
		expect(chips[2]).toEqual({ id: "ahead-2", label: "3", disabled: true });
	});
});

describe("defaultChipId", () => {
	it("opens on the last poll that still has something to show", () => {
		expect(
			defaultChipId([answered(10, 0), answered(11, 1), sealed(12, 2)])
		).toBe("11");
	});

	it("opens on nothing when every consumed poll is sealed", () => {
		expect(defaultChipId([sealed(12, 0)])).toBeUndefined();
	});
});

describe("pollDetailFor", () => {
	it("rounds the right-share into the got-it line", () => {
		expect(pollDetailFor(answered(10, 0))?.rightShare).toBe("33% got it");
	});

	it("letters the options in poll order", () => {
		expect(
			pollDetailFor(answered(10, 0))?.rows.map((row) => row.letter)
		).toEqual(["A", "B"]);
	});

	it("names the category and keeps the question", () => {
		const detail = pollDetailFor(answered(10, 0));
		expect(detail?.category).toBe("TypeScript");
		expect(detail?.question).toBe("Question 10?");
	});

	it("shows nothing for a sealed poll", () => {
		expect(pollDetailFor(sealed(12, 0))).toBeUndefined();
	});
});

describe("ladderFor", () => {
	const climb = {
		climbers: [
			climber("red", 1, 2, true),
			climber("blue", 1, 4),
			climber("green", 3, 0),
		],
		fallen: [
			{
				runId: 11,
				id: "koga",
				displayName: "Koga",
				photoUrl: null,
				borderUrl: null,
				gate: 2,
				pollsIntoGate: 1,
			},
		],
		bestPosition: 16,
	};

	it("stacks climbers under their gate, deepest first", () => {
		const gates = ladderFor(climb);

		expect(gates[1].climbers.map((entry) => entry.id)).toEqual(["blue", "red"]);
		expect(gates[3].climbers.map((entry) => entry.id)).toEqual(["green"]);
	});

	it("marks the viewer's gate as current", () => {
		const gates = ladderFor(climb);

		expect(gates[1].current).toBe(true);
		expect(gates.filter((gate) => gate.current)).toHaveLength(1);
	});

	it("keys the fallen by run and parks them at their gate", () => {
		const gates = ladderFor(climb);

		expect(gates[2].fallen).toEqual([
			{
				id: "koga",
				name: "Koga",
				photoUrl: undefined,
				borderUrl: undefined,
				you: false,
				runKey: "11",
			},
		]);
	});

	it("charts up to the best position and leaves the rest uncharted", () => {
		const gates = ladderFor(climb);

		expect(gates[3].uncharted).toBe(false);
		expect(gates[4].uncharted).toBe(true);
		expect(gates[3].best).toBe(true);
	});

	it("charts only the viewer's own reach on a first climb", () => {
		const gates = ladderFor({ ...climb, bestPosition: null });

		expect(gates[1].uncharted).toBe(false);
		expect(gates[2].uncharted).toBe(true);
		expect(gates.every((gate) => !gate.best)).toBe(true);
	});
});

describe("standoutEntriesFor", () => {
	it("bridges the voter onto an avatar with its border", () => {
		const entries = standoutEntriesFor([
			{
				voter: {
					id: "blue",
					displayName: "Blue",
					photoUrl: null,
					borderUrl: "/borders/x.png",
					you: true,
				},
				title: "deepest",
				value: { unit: "text", text: "gate 7 · poll 1" },
			},
		]);

		expect(entries).toEqual([
			{
				title: "deepest",
				avatar: {
					name: "Blue",
					photoUrl: undefined,
					borderUrl: "/borders/x.png",
					you: true,
				},
				detail: "gate 7 · poll 1",
				swatch: undefined,
			},
		]);
	});
});

describe("CommunityView", () => {
	const view: RunCommunityView = {
		date: "2026-05-13",
		totalPlayers: 3,
		topPercent: 18,
		standouts: [
			{
				voter: {
					id: "owen",
					displayName: "Owen",
					photoUrl: null,
					borderUrl: null,
					you: false,
				},
				title: "deepest",
				value: { unit: "text", text: "gate 10 · poll 2" },
			},
		],
		polls: [answered(10, 0), answered(11, 1)],
		climb: {
			climbers: [climber("red", 1, 2, true)],
			fallen: [],
			bestPosition: null,
		},
	};

	it("opens on the latest open poll and switches on a chip press", async () => {
		const user = userEvent.setup();
		render(
			<CommunityView view={view} back={{ label: "Back", onBack: () => {} }} />
		);

		expect(screen.getByText("Question 11?")).toBeInTheDocument();

		await user.click(screen.getByRole("tab", { name: "1" }));
		expect(screen.getByText("Question 10?")).toBeInTheDocument();
	});

	it("shows the whole board: standouts, climb and the day's count", () => {
		render(
			<CommunityView view={view} back={{ label: "Back", onBack: () => {} }} />
		);

		expect(screen.getByText("gate 10 · poll 2")).toBeInTheDocument();
		expect(screen.getByText("3 players answered")).toBeInTheDocument();
		expect(screen.getByTitle("you")).toBeInTheDocument();
	});
});
