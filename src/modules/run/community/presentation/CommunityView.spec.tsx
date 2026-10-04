import { describe, expect, it, vi } from "vitest";
import { EMPTY_DAY_TURNOUT } from "~/modules/run/community/domain/dayRecords.model";

import { NOTHING_TO_COMPARE_YET } from "~/shared/lib/copy";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import type {
	RunCommunityPoll,
	RunCommunityView,
} from "~/modules/run/community/application/community.service";
import {
	defaultOpenIndex,
	pollResultsFor,
	pollTallyFor,
} from "~/modules/run/community/application/communityScreen.viewmodel";
import { CommunityView } from "~/modules/run/community/presentation/CommunityView.component";
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

describe("pollTallyFor", () => {
	it("counts the viewer's right answers among the polls already revealed", () => {
		expect(
			pollTallyFor([
				answered(10, 0),
				answered(11, 1, { outcome: "wrong" }),
				answered(12, 2, { outcome: "partial" }),
				sealed(13, 3),
			])
		).toBe("1 of 3");
	});

	it("states no tally before any poll is revealed", () => {
		expect(pollTallyFor([sealed(10, 0)])).toBeUndefined();
	});
});

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
			question: "Poll 3 · not dealt yet",
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

describe("CommunityView", () => {
	const view: RunCommunityView = {
		date: "2026-05-13",
		totalPlayers: 3,
		players: [],
		leaders: [
			{
				measure: "streak",
				seats: [
					{
						category: "git",
						leader: {
							userId: "owen-id",
							handle: "@owen",
							best: 13,
							you: false,
						},
					},
				],
			},
		],
		polls: [answered(10, 0), answered(11, 1)],
		climb: {
			climbers: [climber("red", 1, 2, true)],
			fallen: [],
			bestPosition: null,
			viewer: { id: "red", hasLiveRun: true },
			turnout: EMPTY_DAY_TURNOUT,
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

	it("shows the whole board: the seats and the day's count", () => {
		render(board());

		expect(screen.getByText("13 in a row")).toBeInTheDocument();
		expect(screen.getByText("3 players")).toBeInTheDocument();
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
						viewer: { id: "red", hasLiveRun: true },
						turnout: EMPTY_DAY_TURNOUT,
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
					viewer: { id: "red", hasLiveRun: true },
					turnout: EMPTY_DAY_TURNOUT,
				},
			})
		);

		await user.click(screen.getByRole("button", { name: "red" }));

		expect(screen.getByText(".ts")).toBeInTheDocument();
		expect(screen.getByRole("img", { name: /^40% of / })).toBeInTheDocument();
		expect(screen.getByText("1 / 4")).toBeInTheDocument();
	});

	it("opens a fallen run's card from its face in today's records, so it can be looted there", async () => {
		const user = userEvent.setup();
		render(
			board({
				climb: {
					climbers: [climber("red", 1, 2, true)],
					fallen: [
						{
							...climber("misty", 3, 1),
							runId: 7,
							build: { configs: [{ id: "ts", label: ".ts", slots: 1 }] },
							coveragePercent: 40,
							streak: 3,
							startedAtGate: 0,
							lootKb: 64,
							lootedById: null,
							lootedByName: null,
						},
					],
					bestPosition: null,
					viewer: { id: "red", hasLiveRun: true },
					turnout: {
						...EMPTY_DAY_TURNOUT,
						outcomes: {
							...EMPTY_DAY_TURNOUT.outcomes,
							danger: [{ id: "misty", displayName: "misty", you: false }],
						},
					},
				},
			})
		);
		const records = screen
			.getByRole("heading", { name: "Today’s records" })
			.closest("section");
		if (records === null) throw new Error("no records panel drawn");

		await user.click(within(records).getByRole("button", { name: "misty" }));

		expect(screen.getByRole("dialog", { name: "misty" })).toBeInTheDocument();
	});

	it("refuses the way back while today's polls are spent", async () => {
		const user = userEvent.setup();
		const onBack = vi.fn();
		render(
			<CommunityView
				view={view}
				swatch={gateSwatchAt(1)}
				back={{ label: "Back", onBack, disabled: true }}
			/>
		);

		const back = screen.getByRole("button", { name: "Back" });
		expect(back).toBeDisabled();
		await user.click(back);
		expect(onBack).not.toHaveBeenCalled();
	});

	it("titles the board Community, whatever gate the run stands on", () => {
		render(board());

		expect(
			screen.getByRole("heading", { level: 1, name: "Community" })
		).toBeInTheDocument();
	});

	it("asks what the other players are doing under the title", () => {
		render(board());

		expect(
			screen.getByText("What are other players doing?")
		).toBeInTheDocument();
	});

	it("says there is nothing to compare before the day's first poll", () => {
		render(board({ polls: [], leaders: [], climb: null }));

		expect(screen.getByText(NOTHING_TO_COMPARE_YET)).toBeInTheDocument();
	});
});
