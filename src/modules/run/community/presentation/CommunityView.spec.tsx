import { describe, expect, it, vi } from "vitest";

import { NOTHING_TO_COMPARE_YET } from "~/shared/lib/copy";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import type {
	RunCommunityPoll,
	RunCommunityView,
} from "~/modules/run/community/application/community.service";
import {
	CommunityView,
	defaultOpenIndex,
	pollResultsFor,
	standoutEntriesFor,
} from "~/modules/run/community/presentation/CommunityView.component";
import { gateSwatchAt } from "~/modules/run/gate/application/swatchTrack.viewmodel";

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

const revealed = (poll: ReturnType<typeof pollResultsFor>[number]) =>
	poll.state === "revealed" ? poll : undefined;

describe("pollResultsFor", () => {
	it("deals five rows: revealed, sealed and not yet dealt", () => {
		const rows = pollResultsFor([answered(10, 0), sealed(11, 1)]);

		expect(rows).toHaveLength(5);
		expect(rows[0].state).toBe("revealed");
		expect(rows[1]).toEqual({
			state: "sealed",
			index: 1,
			question: "Question 11?",
		});
		expect(rows[2]).toEqual({
			state: "sealed",
			index: 2,
			question: "Not dealt yet",
		});
	});

	it("deals nothing at all before the day's first poll", () => {
		expect(pollResultsFor([])).toEqual([]);
	});

	it("rounds the right-share to a whole percent", () => {
		expect(revealed(pollResultsFor([answered(10, 0)])[0])?.rightShare).toBe(33);
	});

	it("letters the options in poll order and carries their votes", () => {
		const row = revealed(pollResultsFor([answered(10, 0)])[0]);

		expect(row?.options.map((option) => option.letter)).toEqual(["A", "B"]);
		expect(row?.options.map((option) => option.votes)).toEqual([1, 2]);
	});

	it("names the category and keeps the question", () => {
		const row = revealed(pollResultsFor([answered(10, 0)])[0]);

		expect(row?.category).toBe("TypeScript");
		expect(row?.question).toBe("Question 10?");
	});

	it("opens the last poll that still has something to show", () => {
		const rows = pollResultsFor([
			answered(10, 0),
			answered(11, 1),
			sealed(12, 2),
		]);

		expect(revealed(rows[0])?.open).toBe(false);
		expect(revealed(rows[1])?.open).toBe(true);
	});
});

describe("defaultOpenIndex", () => {
	it("opens on the last poll that still has something to show", () => {
		expect(
			defaultOpenIndex([answered(10, 0), answered(11, 1), sealed(12, 2)])
		).toBe(1);
	});

	it("opens on nothing when every consumed poll is sealed", () => {
		expect(defaultOpenIndex([sealed(12, 0)])).toBeUndefined();
	});
});

describe("standoutEntriesFor", () => {
	it("bridges the voter onto a climber chip with its border", () => {
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
				climber: {
					name: "Blue",
					photoUrl: undefined,
					borderUrl: "/borders/x.png",
					you: true,
				},
				value: "gate 7 · poll 1",
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

	const board = (over: Partial<RunCommunityView> = {}) => (
		<CommunityView
			view={{ ...view, ...over }}
			swatch={gateSwatchAt(1)}
			back={{ label: "Back", onBack: () => {} }}
		/>
	);

	it("renders every poll of the window and opens only the latest", () => {
		render(board());

		expect(screen.getByText("Question 10?")).toBeInTheDocument();
		expect(screen.getByText("Question 11?")).toBeInTheDocument();

		const open = document.querySelectorAll("details[open]");
		expect(open).toHaveLength(1);
		expect(open[0]).toHaveTextContent("Question 11?");
	});

	it("shows the whole board: standouts, the day's count and the viewer's chip", () => {
		render(board());

		expect(screen.getByText("gate 10 · poll 2")).toBeInTheDocument();
		expect(screen.getByText("3 players answered")).toBeInTheDocument();
		// Twice over: the header stat and the climb badge both state the standing.
		expect(screen.getAllByText("top 18%")).toHaveLength(2);
	});

	it("states the climb summary rather than a map it cannot draw yet", () => {
		render(board());

		expect(screen.getByText("1 on the ladder")).toBeInTheDocument();
	});

	it("refuses the way back while today's polls are spent", async () => {
		const user = userEvent.setup();
		const onBack = vi.fn();
		render(
			<CommunityView
				view={view}
				swatch={gateSwatchAt(1)}
				back={{ label: "Back", onBack, disabled: true, hint: "Spent" }}
			/>
		);

		const back = screen.getByRole("button", { name: "Back" });
		expect(back).toBeDisabled();
		await user.click(back);
		expect(onBack).not.toHaveBeenCalled();
	});

	it("says there is nothing to compare before the day's first poll", () => {
		render(board({ polls: [], standouts: [], climb: null }));

		expect(screen.getByText(NOTHING_TO_COMPARE_YET)).toBeInTheDocument();
	});
});
