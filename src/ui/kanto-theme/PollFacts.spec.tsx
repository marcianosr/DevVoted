import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { createKantoPollFactsProps } from "~/test/kantoPoll.factory";

import { PollFacts } from "./PollFacts.ui";

const textIs = (whole: string) => (_: string, element: Element | null) =>
	element?.textContent === whole &&
	!Array.from(element.children).some((child) => child.textContent === whole);

describe("PollFacts", () => {
	it("names the band and states the room's first-attempt rate", () => {
		render(<PollFacts {...createKantoPollFactsProps()} />);

		expect(screen.getByText("brutal")).toBeInTheDocument();
		expect(
			screen.getByText(textIs("got it right first time"))
		).toBeInTheDocument();
	});

	it("badges the percentage in the band's own tone, not the screen's", () => {
		render(<PollFacts {...createKantoPollFactsProps()} />);

		const figure = screen.getByText("31%");

		expect(figure).toHaveAttribute("data-screen-theme", "cinnabar");
		expect(screen.getByText("brutal")).toHaveAttribute(
			"data-screen-theme",
			"cinnabar"
		);
	});

	it("says what this account did to the poll last time", () => {
		render(<PollFacts {...createKantoPollFactsProps()} />);

		expect(screen.getByText("seen before")).toBeInTheDocument();
		expect(
			screen.getByText(
				textIs("answered twice · you missed it both times, last on 4 Aug")
			)
		).toBeInTheDocument();
	});

	it("drops the history row for a poll this account has never answered", () => {
		render(
			<PollFacts {...createKantoPollFactsProps({ history: undefined })} />
		);

		expect(screen.queryByText("seen before")).not.toBeInTheDocument();
		expect(screen.getByText("brutal")).toBeInTheDocument();
	});

	it("puts the option count on the difficulty row rather than its own", () => {
		render(
			<PollFacts
				{...createKantoPollFactsProps()}
				trailing="7 options · single answer"
			/>
		);

		const trailing = screen.getByText("7 options · single answer");
		expect(trailing.closest("div")).toContainElement(
			screen.getByText("brutal")
		);
	});
});
