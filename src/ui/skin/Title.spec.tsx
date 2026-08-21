import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { Title } from "./Title.ui";

describe("Title", () => {
	it("renders a level-2 heading by default", () => {
		render(<Title>Pipeline</Title>);

		expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(
			"Pipeline"
		);
	});

	it("renders the level it is asked for", () => {
		render(<Title as="h3">Pipeline</Title>);

		expect(screen.getByRole("heading", { level: 3 })).toBeInTheDocument();
	});

	it("sizes each level differently", () => {
		render(
			<>
				<Title as="h1">one</Title>
				<Title as="h2">two</Title>
				<Title as="h3">three</Title>
			</>
		);

		expect(screen.getByText("one")).toHaveClass("text-base");
		expect(screen.getByText("two")).toHaveClass("text-sm");
		expect(screen.getByText("three")).toHaveClass("text-xs");
	});
});
