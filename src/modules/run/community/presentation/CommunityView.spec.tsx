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
	leadersFor,
	seatsFooterFor,
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

describe("leadersFor", () => {
	const gitSeat = {
		category: "git" as const,
		leader: {
			handle: "@blue",
			githubLogin: "blue",
			borderUrl: "/borders/x.png",
			streak: 13,
			you: true,
		},
	};

	it("bridges a held seat onto the row the board draws", () => {
		expect(leadersFor([gitSeat]).seats).toEqual([
			{
				category: "Git",
				leader: {
					handle: "@blue",
					githubLogin: "blue",
					borderUrl: "/borders/x.png",
					figure: "13 in a row",
					you: true,
				},
			},
		]);
	});

	it("says what claims a seat nobody holds", () => {
		expect(leadersFor([{ category: "vue" }]).seats).toEqual([
			{ category: "Vue", claim: "3 in a row claims it" },
		]);
	});

	it("counts the seats that are held", () => {
		expect(leadersFor([gitSeat, { category: "vue" }]).seated).toBe(
			"1 of 2 seated"
		);
	});
});

describe("seatsFooterFor", () => {
	it("states how a seat moves, never that missing loses it", () => {
		expect(seatsFooterFor([{ category: "vue" }])).toBe(
			"A seat changes hands when somebody beats it. 1 seat still open."
		);
	});

	it("counts the open seats in the plural", () => {
		expect(
			seatsFooterFor([{ category: "vue" }, { category: "ruby" }])
		).toContain("2 seats still open");
	});

	it("says nothing about open seats when every one is taken", () => {
		const footer = seatsFooterFor([
			{
				category: "git",
				leader: { handle: "@blue", streak: 13, you: false },
			},
		]);

		expect(footer).toBe("A seat changes hands when somebody beats it.");
	});
});

describe("CommunityView", () => {
	const view: RunCommunityView = {
		date: "2026-05-13",
		totalPlayers: 3,
		topPercent: 18,
		leaders: [
			{
				category: "git",
				leader: { handle: "@owen", streak: 13, you: false },
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

	it("shows the whole board: the seats, the day's count and the viewer's chip", () => {
		render(board());

		expect(screen.getByText("13 in a row")).toBeInTheDocument();
		expect(screen.getByText("3 players answered")).toBeInTheDocument();
		expect(screen.getAllByText("top 18%")).toHaveLength(2);
	});

	it("places every climber under their gate, and rings today's rivals", () => {
		const { container } = render(
			<CommunityView
				view={{
					...view,
					climb: {
						climbers: [
							climber("red", 1, 2, true),
							climber("misty", 3, 1),
							climber("brock", 3, 4),
						],
						fallen: [],
						bestPosition: null,
					},
				}}
				swatch={gateSwatchAt(1)}
				rivals={["misty"]}
				back={{ label: "Back", onBack: () => {} }}
			/>
		);

		expect(screen.getByTitle("you")).toBeInTheDocument();
		expect(screen.getByTitle("misty")).toBeInTheDocument();
		expect(container.querySelectorAll(".ring-vermillion")).toHaveLength(1);
	});

	it("draws no track for a viewer with no run to stand on", () => {
		const { container } = render(board({ climb: null }));

		expect(
			screen.getByText("start a run to place yourself")
		).toBeInTheDocument();
		expect(container.querySelector("[data-current]")).toBeNull();
	});

	it("opens a climber's card when their chip is pressed", async () => {
		const user = userEvent.setup();
		render(
			board({
				climb: {
					climbers: [
						{
							...climber("red", 1, 2, true),
							build: { configs: [{ id: "ts", label: ".ts", slots: 1 }] },
							coveragePercent: 40,
							streak: 3,
						},
					],
					fallen: [],
					bestPosition: null,
				},
			})
		);

		await user.click(screen.getByRole("button", { name: "red" }));

		expect(screen.getByText(".ts")).toBeInTheDocument();
		expect(screen.getByText("40%")).toBeInTheDocument();
		expect(screen.getByText("1 of 4 weight")).toBeInTheDocument();
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
		render(board({ polls: [], leaders: [], climb: null }));

		expect(screen.getByText(NOTHING_TO_COMPARE_YET)).toBeInTheDocument();
	});
});
