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

	it("prepends the cleared gate's swatch to its own name", () => {
		const { container } = render(<CommunityScreen {...props} />);
		const chip = screen.getByText(COMMUNITY_CLIMB_TITLE).closest("span");

		expect(chip?.querySelector("[data-swatch-theme='lavender']")).toBeTruthy();
		expect(container).toBeTruthy();
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

	it("awards four standouts, none of them claiming a share of climbers ever", () => {
		render(<CommunityScreen {...props} />);
		const standouts = sectionOf("Standing out");

		expect(
			within(standouts).getAllByRole("heading", { level: 3 })
		).toHaveLength(4);
		expect(screen.queryByText(/of climbers, ever/)).toBeNull();
	});

	it("names the standouts the roster actually awards", () => {
		render(<CommunityScreen {...props} />);
		const standouts = sectionOf("Standing out");

		for (const award of [
			"Most active",
			"Most knowledgeable",
			"Fastest",
			"Biggest bank",
		]) {
			expect(
				within(standouts).getByRole("heading", { name: award })
			).toBeInTheDocument();
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

	it("prepends a swatch to the gate a conversation line names", () => {
		render(<CommunityScreen {...props} />);
		const talk = sectionOf("Conversation");

		expect(within(talk).getAllByText("Marsh")).not.toHaveLength(0);
		expect(within(talk).getAllByText("Soul")).not.toHaveLength(0);
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
	it("draws no standout cards when nobody has been ranked", () => {
		render(<CommunityScreen {...kantoCommunityFirstClimb()} />);

		expect(
			within(sectionOf("Standing out")).queryAllByRole("heading", { level: 3 })
		).toHaveLength(0);
	});

	it("draws an empty conversation rather than inventing one", () => {
		render(<CommunityScreen {...kantoCommunityFirstClimb()} />);

		expect(
			within(sectionOf("Conversation")).queryAllByRole("heading", { level: 3 })
		).toHaveLength(0);
	});
});
