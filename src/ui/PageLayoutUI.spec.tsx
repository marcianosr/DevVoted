import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { PageLayoutUI } from "./PageLayoutUI.component";

describe("PageLayoutUI", () => {
	it("renders children", () => {
		render(
			<PageLayoutUI footer={<div>Footer</div>}>Page content</PageLayoutUI>
		);
		expect(screen.getByText("Page content")).toBeInTheDocument();
	});

	it("renders the footer slot", () => {
		render(<PageLayoutUI footer={<div>My Footer</div>}>Content</PageLayoutUI>);
		expect(screen.getByText("My Footer")).toBeInTheDocument();
	});

	it("wraps content in a main element", () => {
		const { container } = render(
			<PageLayoutUI footer={<div />}>Content</PageLayoutUI>
		);
		expect(container.querySelector("main")).toBeInTheDocument();
	});
});
