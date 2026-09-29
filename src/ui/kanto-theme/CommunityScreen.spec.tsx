import { describe, expect, it } from "vitest";

import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import {
	COMMUNITY_CORRECT_TITLE,
	COMMUNITY_STREAK_TITLE,
	COMMUNITY_PREP_LABEL,
	COMMUNITY_SHOP_LABEL,
	kantoCommunity,
	kantoCommunityBeforePolls,
	kantoCommunityFirstClimb,
} from "~/test/kantoCommunity.factory";

import { COPY, CommunityScreen } from "./CommunityScreen.ui";

const props = kantoCommunity();

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
	await userEvent.click(screen.getByRole("tab", { name: title }));
	return sectionOf(title);
};

describe("CommunityScreen", () => {
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
			"lavender"
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

	it("sends the viewer on to Rainbow, the gate that actually follows Lavender", () => {
		render(<CommunityScreen {...props} />);

		expect(
			screen.getByRole("button", { name: COMMUNITY_PREP_LABEL })
		).toBeInTheDocument();
		expect(screen.queryByText(/Vermilion/)).toBeNull();
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
			within(sectionOf("Who showed up")).getByText("+1,035")
		).toBeInTheDocument();
	});

	it("draws the whole ladder, with the viewer standing on their own gate", () => {
		const { container } = render(<CommunityScreen {...props} />);

		expect(screen.getByText(COPY.mapHint)).toBeInTheDocument();
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
		expect(screen.queryByText(COPY.mapHint)).toBeNull();
	});

	it("seats one row per category on each board, held or not", async () => {
		render(<CommunityScreen {...props} />);

		for (const title of [COMMUNITY_STREAK_TITLE, COMMUNITY_CORRECT_TITLE]) {
			const board = await boardOf(title);

			expect(within(board).getAllByRole("link", LEADER_FACE)).toHaveLength(9);
			expect(within(board).getAllByText("unranked")).toHaveLength(3);
		}
	});

	it("shows one board at a time and switches on the press of its tab", async () => {
		render(<CommunityScreen {...props} />);

		expect(sectionOf(COMMUNITY_STREAK_TITLE)).toBeInTheDocument();
		expect(
			screen.queryByRole("heading", { name: COMMUNITY_CORRECT_TITLE })
		).toBeNull();

		await boardOf(COMMUNITY_CORRECT_TITLE);

		expect(
			screen.queryByRole("heading", { name: COMMUNITY_STREAK_TITLE })
		).toBeNull();
	});

	it("names the category every seat is held for", () => {
		render(<CommunityScreen {...props} />);
		const leaders = sectionOf(COMMUNITY_STREAK_TITLE);

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

	it("states how a seat moves under each board's seats", async () => {
		render(<CommunityScreen {...props} />);

		for (const title of [COMMUNITY_STREAK_TITLE, COMMUNITY_CORRECT_TITLE]) {
			expect(
				within(await boardOf(title)).getByText(
					/A seat changes hands when somebody beats it/
				)
			).toBeInTheDocument();
		}
	});

	it("counts the seats that are held on each board", async () => {
		render(<CommunityScreen {...props} />);

		for (const title of [COMMUNITY_STREAK_TITLE, COMMUNITY_CORRECT_TITLE]) {
			expect(
				within(await boardOf(title)).getByText("9 of 12 seated")
			).toBeInTheDocument();
		}
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
		const polls = sectionOf("The five polls");

		expect(within(polls).queryByText("CSS")).toBeNull();
		expect(within(polls).queryByText("TypeScript")).toBeNull();
		expect(within(polls).queryByText("???")).toBeNull();
	});

	it("still shows the room, because turnout gives nothing away", () => {
		render(<CommunityScreen {...kantoCommunityBeforePolls()} />);

		expect(
			within(sectionOf("Who showed up")).getByText("1,041")
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
