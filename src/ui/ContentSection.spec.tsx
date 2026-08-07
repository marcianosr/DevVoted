import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ContentSection } from "./ContentSection.component";

describe("ContentSection", () => {
	it("renders children", () => {
		render(<ContentSection>Banjo-Kazooie quiz</ContentSection>);
		expect(screen.getByText("Banjo-Kazooie quiz")).toBeInTheDocument();
	});

	it("forwards the width to the underlying Screen", () => {
		const { container } = render(
			<ContentSection width="narrow">Content</ContentSection>
		);
		expect(container.querySelector("section")?.className).toContain(
			"sm:max-w-2xl"
		);
	});
});
