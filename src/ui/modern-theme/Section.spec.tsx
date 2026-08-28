import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { Section } from "./Section.ui";

describe("Section", () => {
	it("heads its list with the title and the figure beside it", () => {
		render(
			<Section
				title="Your pipeline"
				value="4 of 12 spots"
				items={[{ id: "js", content: <span>.js</span> }]}
			/>
		);

		expect(screen.getByText("Your pipeline")).toBeInTheDocument();
		expect(screen.getByText("4 of 12 spots")).toBeInTheDocument();
		expect(screen.getByRole("listitem")).toHaveTextContent(".js");
	});

	it("offers no control that would shut it", () => {
		const { container } = render(
			<Section title="New configs" items={[{ id: "a", content: "ESLint" }]} />
		);

		expect(container.querySelector("details")).toBeNull();
		expect(container.querySelector("summary")).toBeNull();
	});

	it("puts the note above the list, where it describes what follows", () => {
		render(
			<Section
				title="Your pipeline"
				note={<span>the track</span>}
				items={[{ id: "js", content: <span>.js</span> }]}
			/>
		);

		const note = screen.getByText("the track");
		const item = screen.getByText(".js");

		expect(note.compareDocumentPosition(item)).toBe(
			Node.DOCUMENT_POSITION_FOLLOWING
		);
	});

	it("renders children under the list, for the actions that close a section", () => {
		render(
			<Section title="New configs" items={[{ id: "a", content: "ESLint" }]}>
				<button type="button">rebuild</button>
			</Section>
		);

		expect(screen.getByRole("button", { name: "rebuild" })).toBeInTheDocument();
	});
});
