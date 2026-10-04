import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { Contribution } from "./Contribution.ui";

describe("Contribution", () => {
	it("states only the polls answered for a player who has published nothing", () => {
		render(<Contribution answered={412} />);

		expect(screen.getByText("412 polls answered")).toBeInTheDocument();
	});

	it("leads an author with the role, the polls published and the answers they drew, then the polls answered", () => {
		render(
			<Contribution
				answered={412}
				authored={{ role: "Poll editor", published: 12, answers: 1842 }}
			/>
		);

		expect(
			screen.getByText(
				"Poll editor · 12 polls published · 1,842 answers · 412 polls answered"
			)
		).toBeInTheDocument();
	});

	it("drops the role for an author who holds none", () => {
		render(
			<Contribution answered={50} authored={{ published: 3, answers: 40 }} />
		);

		expect(
			screen.getByText("3 polls published · 40 answers · 50 polls answered")
		).toBeInTheDocument();
	});

	it("speaks of one poll and one answer in the singular", () => {
		render(
			<Contribution answered={1} authored={{ published: 1, answers: 1 }} />
		);

		expect(
			screen.getByText("1 poll published · 1 answer · 1 poll answered")
		).toBeInTheDocument();
	});
});
