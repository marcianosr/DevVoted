import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";

import {
	COMMUNITY_CLIMB_TITLE,
	COMMUNITY_DEX_LABEL,
	COMMUNITY_MAP_PLACEHOLDER,
	COMMUNITY_PREP_LABEL,
	COMMUNITY_SHOP_LABEL,
	kantoCommunity,
	kantoCommunityBeforePolls,
	kantoCommunityFirstClimb,
} from "~/test/kantoCommunity.factory";

import { CommunityScreen } from "./CommunityScreen.ui";

const props = kantoCommunity();

const STANDOUT_TITLES = [
	"Most active",
	"Most knowledgeable",
	"Fastest",
	"Biggest bank",
];
const CLIMBER_NAMED = /\w/;

const sectionOf = (title: string): HTMLElement => {
	const section = screen
		.getByRole("heading", { name: title })
		.closest("section");
	if (section === null) throw new Error(`no section drawn for ${title}`);
	return section;
};

describe("CommunityScreen", () => {
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

		expect(screen.getByText(COMMUNITY_MAP_PLACEHOLDER)).toBeInTheDocument();
	});

	it("lines one standout up per climber, never claiming a share of climbers ever", () => {
		render(<CommunityScreen {...props} />);
		const standouts = sectionOf("Standing out");

		expect(within(standouts).getAllByTitle(CLIMBER_NAMED)).toHaveLength(4);
		expect(screen.queryByText(/of climbers, ever/)).toBeNull();
	});

	it("names the standouts the roster actually awards", () => {
		render(<CommunityScreen {...props} />);
		const standouts = sectionOf("Standing out");

		for (const award of STANDOUT_TITLES) {
			expect(within(standouts).getByText(award)).toBeInTheDocument();
		}
	});

	it("opens the Dex from the standouts board", () => {
		render(<CommunityScreen {...props} />);

		expect(
			screen.getByRole("button", { name: COMMUNITY_DEX_LABEL })
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
	it("draws no standout rows when nobody has been ranked", () => {
		render(<CommunityScreen {...kantoCommunityFirstClimb()} />);

		expect(
			within(sectionOf("Standing out")).queryAllByTitle(CLIMBER_NAMED)
		).toHaveLength(0);
	});
});
