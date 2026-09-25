import { describe, expect, it } from "vitest";

import { COPY } from "./CommunityScreen.ui";
import { render, screen, within } from "@testing-library/react";

import {
	COMMUNITY_CLIMB_TITLE,
	COMMUNITY_LEADERS_TITLE,
	COMMUNITY_PREP_LABEL,
	COMMUNITY_SHOP_LABEL,
	kantoCommunity,
	kantoCommunityBeforePolls,
	kantoCommunityFirstClimb,
} from "~/test/kantoCommunity.factory";

import { CommunityScreen } from "./CommunityScreen.ui";

const props = kantoCommunity();

const SEATED_CATEGORIES = ["JavaScript", "CSS", "TypeScript", "Git"];
const CLIMBER_NAMED = /\w/;

const sectionOf = (title: string): HTMLElement => {
	const section = screen
		.getByRole("heading", { name: title })
		.closest("section");
	if (section === null) throw new Error(`no section drawn for ${title}`);
	return section;
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

	it("heads the climb panel with the gate the viewer just cleared", () => {
		render(<CommunityScreen {...props} />);

		expect(
			screen.getByRole("heading", { name: COMMUNITY_CLIMB_TITLE })
		).toBeInTheDocument();
	});

	it("counts the room it cannot draw rather than drawing a thousand chips", () => {
		render(<CommunityScreen {...props} />);

		expect(
			within(sectionOf("Who showed up")).getByText("+1,035")
		).toBeInTheDocument();
	});

	it("parks the climb map behind a placeholder until its component lands", () => {
		render(<CommunityScreen {...props} />);

		expect(screen.getByText(COPY.mapPlaceholder)).toBeInTheDocument();
	});

	it("seats one row per category, whether or not anybody holds it", () => {
		render(<CommunityScreen {...props} />);
		const leaders = sectionOf(COMMUNITY_LEADERS_TITLE);

		expect(within(leaders).getAllByTitle(CLIMBER_NAMED)).toHaveLength(9);
		expect(within(leaders).getAllByText("unranked")).toHaveLength(3);
	});

	it("names the category every seat is held for", () => {
		render(<CommunityScreen {...props} />);
		const leaders = sectionOf(COMMUNITY_LEADERS_TITLE);

		for (const category of SEATED_CATEGORIES) {
			expect(within(leaders).getByText(category)).toBeInTheDocument();
		}
	});

	it("states how a seat moves, under the seats", () => {
		render(<CommunityScreen {...props} />);

		expect(
			within(sectionOf(COMMUNITY_LEADERS_TITLE)).getByText(
				/A seat changes hands when somebody beats it/
			)
		).toBeInTheDocument();
	});

	it("counts the seats that are held", () => {
		render(<CommunityScreen {...props} />);

		expect(
			within(sectionOf(COMMUNITY_LEADERS_TITLE)).getByText("9 of 12 seated")
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
	it("still draws twelve seats when nobody leads a category yet", () => {
		render(<CommunityScreen {...kantoCommunityFirstClimb()} />);
		const leaders = sectionOf(COMMUNITY_LEADERS_TITLE);

		expect(within(leaders).queryAllByTitle(CLIMBER_NAMED)).toHaveLength(0);
		expect(within(leaders).getAllByText("unranked")).toHaveLength(12);
	});

	it("says what claims an open seat", () => {
		render(<CommunityScreen {...kantoCommunityFirstClimb()} />);

		expect(
			within(sectionOf(COMMUNITY_LEADERS_TITLE)).getAllByText(
				"3 in a row claims it"
			)
		).toHaveLength(12);
	});
});
