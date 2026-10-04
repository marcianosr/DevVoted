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
				authored={{ role: "Poll editor", published: 12, answers: 1842 }}
			/>
		);

		expect(badgesOf(container)).toEqual(["12", "1,842", "412"]);
	});

	it("leads an author with the role, the polls published and the answers they drew, then the polls answered", () => {
		const { container } = render(
			<Contribution
				answered={412}
				authored={{ role: "Poll editor", published: 12, answers: 1842 }}
			/>
		);

		expect(readingOf(container)).toBe(
			"Poll editor·12polls published·1,842answers·412polls answered"
		);
	});

	it("drops the role for an author who holds none", () => {
		const { container } = render(
			<Contribution answered={50} authored={{ published: 3, answers: 40 }} />
		);

		expect(readingOf(container)).toBe(
			"3polls published·40answers·50polls answered"
		);
	});

	it("speaks of one poll and one answer in the singular", () => {
		const { container } = render(
			<Contribution answered={1} authored={{ published: 1, answers: 1 }} />
		);

		expect(readingOf(container)).toBe("1poll published·1answer·1poll answered");
	});
});
