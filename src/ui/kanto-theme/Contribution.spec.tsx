import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";

import { Contribution } from "./Contribution.ui";

const readingOf = (container: HTMLElement) =>
	container.firstElementChild?.textContent;

const badgesOf = (container: HTMLElement) =>
	[...container.querySelectorAll(".badge-theme")].map(
		(badge) => badge.textContent
	);

describe("Contribution", () => {
	it("states only the polls answered for a player who has published nothing", () => {
		const { container } = render(<Contribution answered={412} />);

		expect(readingOf(container)).toBe("412polls answered");
	});

	it("badges every count and leaves the words beside them bare", () => {
		const { container } = render(
			<Contribution
				answered={412}
				authored={{ role: "Poll editor", published: 12 }}
			/>
		);

		expect(badgesOf(container)).toEqual(["12", "412"]);
	});

	it("leads an author with the role and the polls published, then the polls answered", () => {
		const { container } = render(
			<Contribution
				answered={412}
				authored={{ role: "Poll editor", published: 12 }}
			/>
		);

		expect(readingOf(container)).toBe(
			"Poll editor·12polls published·412polls answered"
		);
	});

	it("drops the role for an author who holds none", () => {
		const { container } = render(
			<Contribution answered={50} authored={{ published: 3 }} />
		);

		expect(readingOf(container)).toBe("3polls published·50polls answered");
	});

	it("speaks of one poll in the singular", () => {
		const { container } = render(
			<Contribution answered={1} authored={{ published: 1 }} />
		);

		expect(readingOf(container)).toBe("1poll published·1poll answered");
	});

	it("reads in lowercase, as written", () => {
		const { container } = render(<Contribution answered={3} />);

		expect(container.firstElementChild).not.toHaveClass("uppercase");
	});
});
