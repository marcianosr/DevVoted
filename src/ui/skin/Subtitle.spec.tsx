import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { Subtitle } from "./Subtitle.ui";

describe("Subtitle", () => {
	it("renders muted inline text by default", () => {
		render(<Subtitle>4 firing</Subtitle>);

		const line = screen.getByText("4 firing");
		expect(line.tagName).toBe("SPAN");
		expect(line).toHaveClass("text-pewter");
	});

	it("lifts out of muted when asked", () => {
		render(<Subtitle tone="default">4 firing</Subtitle>);

		expect(screen.getByText("4 firing")).toHaveClass("text-zinc-300");
	});
});
