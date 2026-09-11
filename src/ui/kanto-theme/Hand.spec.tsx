import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import {
	NEW_RUN_HAND_NOTE,
	SUGGESTED_LABEL,
	baseSlots,
	handCardsLeft,
	kantoHandCards,
	kantoHandProps,
} from "~/test/kantoPoll.factory";

import { Hand } from "./Hand.ui";

const props = kantoHandProps();

const rowOf = (name: string) =>
	screen
		.getByRole("button", { name: `About ${name}` })
		.closest<HTMLElement>(".rounded-lg");

describe("Hand", () => {
	it("names itself the deal and counts what is still installable", () => {
		render(<Hand {...props} />);

		expect(screen.getByText("Dealt")).toBeInTheDocument();
		expect(screen.getByText("5 left in the hand")).toBeInTheDocument();
	});

	it("deals every card the run opened with", () => {
		render(<Hand {...props} />);

		for (const card of kantoHandCards()) {
			expect(rowOf(card.name ?? "")).not.toBeNull();
		}
	});

	it("takes a card with a verb rather than a price", async () => {
		const onPress = vi.fn();
		render(
			<Hand
				{...props}
				cards={[{ name: ".js", slots: 1, badges: [], install: { onPress } }]}
				left={1}
			/>
		);

		await userEvent.click(screen.getByRole("button", { name: "Install .js" }));

		expect(onPress).toHaveBeenCalledOnce();
	});

	it("marks the advice on the cards recommendedPicks names, and no others", () => {
		render(<Hand {...props} />);

		expect(screen.getAllByText(SUGGESTED_LABEL)).toHaveLength(2);
		expect(rowOf(".js")).toContainElement(
			screen.getAllByText(SUGGESTED_LABEL)[0]
		);
	});

	it("keeps a taken card in place, dimmed and no longer installable", () => {
		render(<Hand {...kantoHandProps(["js"])} />);

		expect(rowOf(".js")).toHaveClass("opacity-60");
		expect(
			screen.queryByRole("button", { name: "Install .js" })
		).not.toBeInTheDocument();
		expect(screen.getByText("4 left in the hand")).toBeInTheDocument();
	});

	it("drops the advice from a card once it is taken", () => {
		render(<Hand {...kantoHandProps(["js"])} />);

		expect(rowOf(".js")).not.toContainElement(
			screen.getAllByText(SUGGESTED_LABEL)[0]
		);
	});

	it("dims a card too wide for the room left and refuses its press", () => {
		render(<Hand {...kantoHandProps(["js", "code-coverage", "unit-tests"])} />);

		expect(rowOf("Cold Start")).toHaveClass("opacity-60");
		expect(
			screen.getByRole("button", { name: "Install Cold Start" })
		).toBeDisabled();
	});

	it("counts a card it has no room for as still in the hand", () => {
		const installed = ["js", "code-coverage", "unit-tests"];
		render(<Hand {...kantoHandProps(installed)} />);

		expect(handCardsLeft(kantoHandCards(installed))).toBe(2);
		expect(screen.getByText("2 left in the hand")).toBeInTheDocument();
	});

	it("deals no advice when nothing is recommended", () => {
		render(<Hand {...kantoHandProps([], baseSlots, false)} />);

		expect(screen.queryByText(SUGGESTED_LABEL)).not.toBeInTheDocument();
	});

	it("states what the hand costs, under the cards it deals", () => {
		render(<Hand {...props} />);

		expect(screen.getByText(NEW_RUN_HAND_NOTE)).toBeInTheDocument();
	});

	it("drops the note when there is nothing to explain", () => {
		render(<Hand {...props} note={undefined} />);

		expect(screen.queryByText(NEW_RUN_HAND_NOTE)).not.toBeInTheDocument();
	});

	it("stretches its cards across the column", () => {
		render(<Hand {...props} />);

		expect(rowOf(".js")).toHaveClass("w-full");
	});

	it("asks its parent which panel to open, holding no state itself", async () => {
		const onToggleInfo = vi.fn();
		render(<Hand {...props} onToggleInfo={onToggleInfo} />);

		await userEvent.click(screen.getByRole("button", { name: "About .js" }));

		expect(onToggleInfo).toHaveBeenCalledWith(".js");
	});

	it("redacts a locked card without leaking its width", () => {
		render(<Hand {...props} cards={[{ locked: true }]} left={0} />);

		expect(screen.getByText("Locked config")).toBeInTheDocument();
		expect(screen.getByText("0 left in the hand")).toBeInTheDocument();
	});
});
