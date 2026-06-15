import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ContentSection } from "./ContentSection.component";

describe("ContentSection", () => {
	it("renders children", () => {
		render(<ContentSection>Banjo-Kazooie quiz</ContentSection>);
		expect(screen.getByText("Banjo-Kazooie quiz")).toBeInTheDocument();
	});

	it("sets data-category-theme when categoryCode is provided", () => {
		const { container } = render(
			<ContentSection categoryCode="react">Content</ContentSection>
		);
		expect(
			container.querySelector("[data-category-theme='react']")
		).toBeInTheDocument();
	});

	it("omits data-category-theme when categoryCode is undefined", () => {
		const { container } = render(<ContentSection>Content</ContentSection>);
		const section = container.querySelector("section");
		expect(section?.getAttribute("data-category-theme")).toBeNull();
	});
});
