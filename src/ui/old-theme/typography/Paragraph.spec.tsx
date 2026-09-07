import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { Paragraph } from "./Paragraph.component";

describe("Paragraph", () => {
	it("renders its children as zinc-100 body text", () => {
		render(<Paragraph>Body copy</Paragraph>);
		expect(screen.getByText("Body copy")).toHaveClass("text-zinc-100");
	});

	it("renders the gradient tone as an inline accent", () => {
		render(
			<Paragraph as="span" tone="gradient">
				+120KB
			</Paragraph>
		);
		expect(screen.getByText("+120KB")).toHaveClass("text-gradient-green");
	});
});
