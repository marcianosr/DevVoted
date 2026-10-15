import { beforeEach, describe, expect, it, vi } from "vitest";
import { EMPTY_DAY_TURNOUT } from "~/modules/run/community/domain/dayRecords.model";

import { NOTHING_TO_COMPARE_YET } from "~/shared/lib/copy";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import type {
	RunCommunityPoll,
	RunCommunityView,
} from "~/modules/run/community/application/community.service";
import { pollSpotlightFor } from "~/modules/run/community/application/communityScreen.viewmodel";
import { CommunityView } from "~/modules/run/community/presentation/CommunityView.component";
import { gateSwatchAt } from "~/modules/run/gate/application/swatchTrack.viewmodel";
import { getPlayerCard } from "~/modules/run/community/application/playerCard.serverfn";
import { withQueryClient } from "~/test/queryClient.harness";

vi.mock("~/modules/run/community/application/playerCard.serverfn", () => ({
	getPlayerCard: vi.fn(),
}));

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
				voters: [],
			},
			{
				label: "number",
				isRight: false,
				count: 2,
				percent: 67,
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

const rightOf = (
	pollId: number,
	index: number,
	gotItRightCount: number,
	answerType: "single" | "multiple" = "single"
): RunCommunityPoll => {
	const poll = answered(pollId, index);
	if (poll.detail === null) return poll;

	return {
		...poll,
		detail: {
			...poll.detail,
			answerType,
			answeredCount: 10,
			gotItRightCount,
			options: [
				{
					label: "string",
					isRight: true,
					count: gotItRightCount,
					percent: gotItRightCount * 10,
					voters: [
						{ id: "misty", displayName: "Misty", you: false },
						{ id: "red", displayName: "Red", you: true },
					],
				},
			],
		},
	};
};

describe("pollSpotlightFor", () => {
	it("spotlights the poll the fewest got right, then the one the most did", () => {
		const { spotlights } = pollSpotlightFor([
			rightOf(10, 0, 5),
			rightOf(11, 1, 2),
			rightOf(12, 2, 9),
		]);

		expect(
			spotlights.map(({ kind, question, rightShare }) => ({
				kind,
				question,
				rightShare,
			}))
		).toEqual([
			{ kind: "hardest", question: "Question 11?", rightShare: 20 },
			{ kind: "easiest", question: "Question 12?", rightShare: 90 },
		]);
	});

	it("spotlights only the hardest when a single poll is revealed", () => {
		expect(
			pollSpotlightFor([rightOf(10, 0, 4)]).spotlights.map(({ kind }) => kind)
		).toEqual(["hardest"]);
	});

	it("states the hint and no review before any poll is revealed", () => {
		expect(pollSpotlightFor([sealed(10, 0)], () => {})).toEqual({
			title: "Today’s polls",
			spotlights: [],
			empty: NOTHING_TO_COMPARE_YET,
		});
	});

	it("leads the faces of who got it with yours", () => {
		const [hardest] = pollSpotlightFor([rightOf(10, 0, 4)]).spotlights;

		expect(hardest.gotIt.map(({ name }) => name)).toEqual(["Red", "Misty"]);
	});

	it("names no faces on a multiple poll, where one right pick is not getting it", () => {
		const [hardest] = pollSpotlightFor([
			rightOf(10, 0, 4, "multiple"),
		]).spotlights;

		expect(hardest.gotIt).toEqual([]);
	});

	it("counts every revealed answer on the review button", () => {
		expect(
			pollSpotlightFor([rightOf(10, 0, 4), rightOf(11, 1, 6)], () => {}).review
				?.label
		).toBe("Review all 2 answers");
	});
});

describe("CommunityView", () => {
	beforeEach(() => {
		vi.mocked(getPlayerCard).mockResolvedValue({
			success: true,
			data: {
				userId: "red",
				displayName: "red",
				titles: [],
				theme: "gate-pallet",
				pollsAnswered: 10,
				swatchGates: [0],
			},
		});
	});

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

	const board = (over: Partial<RunCommunityView> = {}) =>
		withQueryClient(
			<CommunityView
				view={{ ...view, ...over }}
				swatch={gateSwatchAt(1)}
				back={{ label: "Back", onBack: () => {} }}
			/>
		);

	it("spotlights the hardest and the easiest revealed poll", () => {
		render(board({ polls: [rightOf(10, 0, 2), rightOf(11, 1, 9)] }));

		expect(screen.getByText("Question 10?")).toBeInTheDocument();
		expect(screen.getByText("Question 11?")).toBeInTheDocument();
	});

	it("shows the whole board: the seats and the day's count", () => {
		render(board());

		expect(screen.getByText("13 in a row")).toBeInTheDocument();
		expect(screen.getByText("3 players")).toBeInTheDocument();
	});

	it("heads the board with the day's count and no gate of the viewer's own", () => {
		render(board());

		expect(
			screen.queryByText(/^gate \d+ · /, { selector: "span" })
		).not.toBeInTheDocument();
	});

	it("places every climber under their gate, and rings today's rivals", () => {
		const { container } = render(
			withQueryClient(
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
			)
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
		expect(await screen.findByText("polls answered")).toBeInTheDocument();
		expect(screen.getByRole("img", { name: /^40% of / })).toBeInTheDocument();
		expect(screen.getByText("1 / 4")).toBeInTheDocument();
	});

	it("opens a fallen run's card from its face in who cleared what, so it can be looted there", async () => {
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
							lootedByPhotoUrl: null,
							lootedByBorderUrl: null,
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
		const outcomes = screen
			.getByRole("heading", { name: "Who cleared what" })
			.closest("section");
		if (outcomes === null) throw new Error("no outcomes panel drawn");

		await user.click(within(outcomes).getByRole("button", { name: "misty" }));

		expect(screen.getByRole("dialog", { name: "misty" })).toBeInTheDocument();
	});

	it("refuses the way back while today's polls are spent", async () => {
		const user = userEvent.setup();
		const onBack = vi.fn();
		render(
			withQueryClient(
				<CommunityView
					view={view}
					swatch={gateSwatchAt(1)}
					back={{ label: "Back", onBack, disabled: true }}
				/>
			)
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

		expect(screen.getAllByText(NOTHING_TO_COMPARE_YET).length).toBeGreaterThan(
			0
		);
	});
});
