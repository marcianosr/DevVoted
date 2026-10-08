import { describe, expect, it } from "vitest";

import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { kantoIncidentsQuiet } from "~/test/kantoIncidents.factory";
import {
	COMMUNITY_CORRECT_TITLE,
	COMMUNITY_MAP_TITLE,
	COMMUNITY_POLLS_TALLY,
	COMMUNITY_STREAK_TITLE,
	COMMUNITY_PREP_LABEL,
	COMMUNITY_SHOP_LABEL,
	kantoCommunity,
	kantoCommunityBeforePolls,
	kantoCommunityFirstClimb,
} from "~/test/kantoCommunity.factory";

import { COPY, CommunityScreen } from "./CommunityScreen.ui";

const props = kantoCommunity();
const TURNOUT_TITLE = props.turnout.title;
const POLLS_TITLE = props.polls.title;

const SEATED_CATEGORIES = ["JavaScript", "CSS", "TypeScript", "Git"];
const LEADER_FACE = { name: /'s profile$/ };

const sectionOf = (title: string): HTMLElement => {
	const section = screen
		.getByRole("heading", { name: title })
		.closest("section");
	if (section === null) throw new Error(`no section drawn for ${title}`);
	return section;
};

const boardOf = async (title: string): Promise<HTMLElement> => {
	await userEvent.click(screen.getByRole("radio", { name: title }));
	return sectionOf(COPY.leaders);
};

describe("CommunityScreen", () => {
	it("states a quiet day in the incidents heading rather than drawing an empty body", () => {
		render(
			<CommunityScreen {...props} incidents={{ ...kantoIncidentsQuiet() }} />
		);
		const incidents = sectionOf("Incidents");

		expect(
			within(incidents).getByText(kantoIncidentsQuiet().empty)
		).toBeInTheDocument();
		expect(incidents.children).toHaveLength(1);
	});

	it("carries the day's incidents, so no press stands between them and the board", () => {
		render(<CommunityScreen {...kantoCommunity()} />);

		expect(
			screen.getByRole("heading", { name: "Incidents" })
		).toBeInTheDocument();
		expect(screen.getByText(/filed today/)).toBeInTheDocument();
	});

	it("wears the colour of the gate the viewer just cleared", () => {
		const { container } = render(<CommunityScreen {...props} />);

		expect(container.firstElementChild).toHaveAttribute(
			"data-gate-theme",
			"gate-lavender"
		);
	});

	it("names the day by its seed", () => {
		render(<CommunityScreen {...props} />);

		expect(
			screen.getByRole("heading", {
				name: "Seed #482 · five polls for Wednesday",
			})
		).toBeInTheDocument();
	});

	it("sends the viewer on to Celadon, the gate that actually follows Lavender", () => {
		render(<CommunityScreen {...props} />);

		expect(
			screen.getByRole("button", { name: COMMUNITY_PREP_LABEL })
		).toBeInTheDocument();
		expect(screen.queryByText(/Prep for Vermilion/)).toBeNull();
	});

	it("offers the way back to the shop", () => {
		render(<CommunityScreen {...props} />);

		expect(
			screen.getByRole("button", { name: COMMUNITY_SHOP_LABEL })
		).toBeInTheDocument();
	});

	it("reads the day's figures as icons and badges, not as a prose line", () => {
		render(<CommunityScreen {...props} />);

		expect(screen.getByLabelText("climbers reviewing")).toBeInTheDocument();
		expect(screen.getByLabelText("gates cleared today")).toBeInTheDocument();
		expect(screen.getByLabelText("runs closed")).toBeInTheDocument();
		expect(screen.queryByText(/climbers reviewing ·/)).toBeNull();
	});

	it("counts the room it cannot draw rather than drawing a thousand chips", () => {
		render(<CommunityScreen {...props} />);

		expect(
			within(sectionOf(TURNOUT_TITLE)).getByText("+601")
		).toBeInTheDocument();
	});

	it("draws as many faces as a row asks for before folding the rest behind its plus", () => {
		const crowd = Array.from({ length: 12 }, (_, index) => ({
			name: `Trainer ${index}`,
			userId: `trainer-${index}`,
		}));
		render(
			<CommunityScreen
				{...props}
				turnout={{
					...props.turnout,
					bands: [
						{
							label: "answered today",
							count: "12",
							shown: 10,
							climbers: crowd,
						},
					],
					records: [],
				}}
			/>
		);

		expect(
			within(sectionOf(TURNOUT_TITLE)).getByRole("button", {
				name: "show 2 more players",
			})
		).toHaveTextContent("+2");
	});

	it("lets a crowded row's faces wrap across the row's width instead of running off a narrow screen", () => {
		const crowd = Array.from({ length: 12 }, (_, index) => ({
			name: `Trainer ${index}`,
			userId: `trainer-${index}`,
		}));
		render(
			<CommunityScreen
				{...props}
				turnout={{
					...props.turnout,
					bands: [
						{
							label: "answered today",
							count: "12",
							shown: 10,
							climbers: crowd,
						},
					],
					records: [],
				}}
			/>
		);

		const stack = within(sectionOf(TURNOUT_TITLE)).getByRole("button", {
			name: "show 2 more players",
		}).parentElement;
		expect(stack).toHaveClass("flex-wrap");
		expect(stack?.parentElement).toHaveClass("basis-full");
	});

	it("lists the day's records in the same rows as the outcomes, each with its figure", () => {
		render(<CommunityScreen {...props} />);
		const turnout = within(sectionOf(TURNOUT_TITLE));

		expect(turnout.queryByText("today's records")).toBeNull();
		expect(turnout.getByText("comeback")).toBeInTheDocument();
		expect(turnout.getByText("14 slots")).toBeInTheDocument();
	});

	it("puts the map before the polls, and the polls before the records", () => {
		render(<CommunityScreen {...props} />);
		const order = [COMMUNITY_MAP_TITLE, POLLS_TITLE, TURNOUT_TITLE].map(
			(title) => screen.getByRole("heading", { name: title })
		);

		expect(
			order[0].compareDocumentPosition(order[1]) &
				Node.DOCUMENT_POSITION_FOLLOWING
		).toBeTruthy();
		expect(
			order[1].compareDocumentPosition(order[2]) &
				Node.DOCUMENT_POSITION_FOLLOWING
		).toBeTruthy();
	});

	it("draws the whole ladder, with the viewer standing on their own gate", () => {
		const { container } = render(<CommunityScreen {...props} />);

		expect(screen.queryByText("tap an avatar")).not.toBeInTheDocument();
		expect(container.querySelectorAll("[data-current]")).toHaveLength(1);
	});

	it("says how to get on the map when the viewer has no run to stand on", () => {
		render(
			<CommunityScreen
				{...props}
				map={{
					title: "Where everyone is",
					empty: "start a run to place yourself",
				}}
			/>
		);

		expect(
			screen.getByText("start a run to place yourself")
		).toBeInTheDocument();
	});

	it("seats one row per category on each board, held or not", async () => {
		render(<CommunityScreen {...props} />);

		for (const title of [COMMUNITY_STREAK_TITLE, COMMUNITY_CORRECT_TITLE]) {
			const board = await boardOf(title);

			expect(within(board).getAllByRole("link", LEADER_FACE)).toHaveLength(9);
			expect(within(board).getAllByText("unranked")).toHaveLength(3);
		}
	});

	it("picks one board at a time with a filter inside the leaders panel", async () => {
		render(<CommunityScreen {...props} />);
		const filter = within(sectionOf(COPY.leaders)).getByRole("radiogroup");

		expect(
			within(filter).getByRole("radio", { name: COMMUNITY_STREAK_TITLE })
		).toHaveAttribute("aria-checked", "true");

		const board = await boardOf(COMMUNITY_CORRECT_TITLE);

		expect(
			within(filter).getByRole("radio", { name: COMMUNITY_CORRECT_TITLE })
		).toHaveAttribute("aria-checked", "true");
		expect(within(board).queryByText("21 in a row")).toBeNull();
	});

	it("names the category every seat is held for", () => {
		render(<CommunityScreen {...props} />);
		const leaders = sectionOf(COPY.leaders);

		for (const category of SEATED_CATEGORIES) {
			expect(within(leaders).getByText(category)).toBeInTheDocument();
		}
	});

	it("counts a run on one board and a volume on the other", async () => {
		render(<CommunityScreen {...props} />);

		expect(
			within(await boardOf(COMMUNITY_STREAK_TITLE)).getByText("21 in a row")
		).toBeInTheDocument();
		expect(
			within(await boardOf(COMMUNITY_CORRECT_TITLE)).getByText("58 correct")
		).toBeInTheDocument();
	});

	it("counts how many of the revealed polls the viewer got right beside the heading", () => {
		render(<CommunityScreen {...props} />);

		expect(
			within(sectionOf(POLLS_TITLE)).getByText(COMMUNITY_POLLS_TALLY)
		).toBeInTheDocument();
	});

	it("draws all five polls", () => {
		const { container } = render(<CommunityScreen {...props} />);

		expect(container.querySelectorAll("details")).toHaveLength(5);
	});

	it("stands one poll open and the rest shut", () => {
		const { container } = render(<CommunityScreen {...props} />);
		const open = [...container.querySelectorAll("details")].filter((poll) =>
			poll.hasAttribute("open")
		);

		expect(open).toHaveLength(1);
	});
});

describe("CommunityScreen, before the day's polls", () => {
	it("seals every poll", () => {
		const { container } = render(
			<CommunityScreen {...kantoCommunityBeforePolls()} />
		);

		expect(container.querySelectorAll("details")).toHaveLength(0);
	});

	it("withholds the categories, since the polls may be dealt again", () => {
		render(<CommunityScreen {...kantoCommunityBeforePolls()} />);
		const polls = sectionOf(POLLS_TITLE);

		expect(within(polls).queryByText("CSS")).toBeNull();
		expect(within(polls).queryByText("TypeScript")).toBeNull();
		expect(within(polls).queryByText("???")).toBeNull();
	});

	it("still shows the room, because turnout gives nothing away", () => {
		render(<CommunityScreen {...kantoCommunityBeforePolls()} />);

		expect(
			within(sectionOf(TURNOUT_TITLE)).getByText("604")
		).toBeInTheDocument();
	});
});

describe("CommunityScreen, a first climb", () => {
	it("still draws twelve seats on both boards when nobody leads a category yet", async () => {
		render(<CommunityScreen {...kantoCommunityFirstClimb()} />);

		for (const title of [COMMUNITY_STREAK_TITLE, COMMUNITY_CORRECT_TITLE]) {
			const board = await boardOf(title);

			expect(within(board).queryAllByRole("link", LEADER_FACE)).toHaveLength(0);
			expect(within(board).getAllByText("unranked")).toHaveLength(12);
		}
	});

	it("says what claims an open seat, in each board's own figure", async () => {
		render(<CommunityScreen {...kantoCommunityFirstClimb()} />);

		expect(
			within(await boardOf(COMMUNITY_STREAK_TITLE)).getAllByText(
				"3 in a row claims it"
			)
		).toHaveLength(12);
		expect(
			within(await boardOf(COMMUNITY_CORRECT_TITLE)).getAllByText(
				"4 correct claims it"
			)
		).toHaveLength(12);
	});
});
