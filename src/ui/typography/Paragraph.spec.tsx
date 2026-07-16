import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { Paragraph } from "./Paragraph.component";

describe("Paragraph", () => {
	it("renders its children as zinc-100 body text", () => {
		render(<Paragraph>Body copy</Paragraph>);
		expect(screen.getByText("Body copy")).toHaveClass("text-zinc-100");
	});
});
