import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { COPY, PollSpotlight, type SpotlightPoll } from "./PollSpotlight.ui";

const HARDEST: SpotlightPoll = {
	kind: "hardest",
	question: "What risk is at stake?",
	rightShare: 29,
	gotIt: [{ name: "Giovanni" }, { name: "Sabrina" }],
};

const EASIEST: SpotlightPoll = {
	kind: "easiest",
	question: "Match each range to its meaning",
	rightShare: 86,
	gotIt: [],
};

describe("PollSpotlight", () => {
	it("captions the hardest and the easiest poll with their right share", () => {
		render(
			<PollSpotlight title="Today’s polls" spotlights={[HARDEST, EASIEST]} />
		);

		expect(screen.getByText(COPY.hardest)).toBeInTheDocument();
		expect(screen.getByText(COPY.easiest)).toBeInTheDocument();
		expect(screen.getByText("29%")).toBeInTheDocument();
		expect(screen.getByText("86%")).toBeInTheDocument();
	});

	it("shows who got it only on a poll that names them", () => {
		render(
			<PollSpotlight title="Today’s polls" spotlights={[HARDEST, EASIEST]} />
		);

		expect(screen.getAllByText(COPY.gotIt)).toHaveLength(3);
	});

	it("states the hint and no cards before any poll is revealed", () => {
		render(
			<PollSpotlight
				title="Today’s polls"
				spotlights={[]}
				empty="Answer first."
			/>
		);

		expect(screen.getByText("Answer first.")).toBeInTheDocument();
		expect(screen.queryByRole("article")).not.toBeInTheDocument();
	});

	it("reviews every answer from its button", async () => {
		const onReview = vi.fn();
		render(
			<PollSpotlight
				title="Today’s polls"
				spotlights={[HARDEST]}
				review={{ label: "Review all 5 answers", onReview }}
			/>
		);

		await userEvent.click(
			screen.getByRole("button", { name: "Review all 5 answers" })
		);

		expect(onReview).toHaveBeenCalledOnce();
	});
});
