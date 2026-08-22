import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { PollScreen, type PollScreenProps } from "./PollScreen.ui";

const props: PollScreenProps = {
	gate: {
		title: "Gate 4 · Lavender",
		detail: "60% required · 1 audit · out of Rock Tunnel",
		count: "4 of 13",
	},
	trail: [
		{ id: "poll-1", label: "poll 1", state: "answered", verdict: "pass" },
		{ id: "poll-2", label: "poll 2", state: "current" },
	],
	trailLabel: "Gate 4 progress",
	score: "1 correct · 0 wrong",
	record: [{ term: "Category", detail: "typescript" }],
	question: ["Which one returns the last two?"],
	options: [
		{
			id: "at",
			name: "answer",
			label: "arr.at(-2)",
			checked: false,
			onChange: () => {},
		},
	],
};

describe("PollScreen", () => {
	it("stacks the gate header above the poll's own trail", () => {
		render(<PollScreen {...props} />);

		expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(
			"Gate 4 · Lavender"
		);
		expect(
			screen.getByRole("navigation", { name: "Gate 4 progress" })
		).toBeInTheDocument();
	});

	it("parks run state in a rail beside the question", () => {
		render(<PollScreen {...props} rail={<p>Pipeline</p>} />);

		expect(screen.getByRole("complementary")).toContainElement(
			screen.getByText("Pipeline")
		);
	});

	it("leaves the rail out when there is no run state to show", () => {
		render(<PollScreen {...props} />);

		expect(screen.queryByRole("complementary")).not.toBeInTheDocument();
	});

	it("shows the question and its options in the main column", () => {
		render(<PollScreen {...props} />);

		expect(
			screen.getByText("Which one returns the last two?")
		).toBeInTheDocument();
		expect(
			screen.getByRole("radio", { name: "arr.at(-2)" })
		).toBeInTheDocument();
	});
});
