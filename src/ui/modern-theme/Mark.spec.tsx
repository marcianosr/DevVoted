import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { Mark } from "./Mark.ui";

describe("Mark", () => {
	it("announces a passing config", () => {
		render(<Mark variant="pass" />);

		expect(screen.getByRole("img", { name: "passing" })).toHaveTextContent("✓");
	});

	it("announces a failing config", () => {
		render(<Mark variant="fail" />);

		expect(screen.getByRole("img", { name: "failing" })).toHaveTextContent("✕");
	});

	it("fills a verdict disc rather than colouring a bare glyph", () => {
		render(
			<>
				<Mark variant="warn" />
				<Mark variant="fail" />
			</>
		);

		expect(screen.getByRole("img", { name: "warning" })).toHaveClass(
			"bg-saffron",
			"rounded-full"
		);
		expect(screen.getByRole("img", { name: "failing" })).toHaveClass(
			"bg-cinnabar"
		);
	});

	it("outlines an idle config instead of filling it, having no verdict to state", () => {
		const idle = render(<Mark variant="idle" />).getByRole("img", {
			name: "idle",
		});

		expect(idle).toHaveClass("border", "text-zinc-600");
		expect(idle).not.toHaveClass("bg-viridian");
	});
});
