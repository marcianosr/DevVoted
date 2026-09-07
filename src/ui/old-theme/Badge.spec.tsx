import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { Badge } from "./Badge.component";

describe("Badge", () => {
	it("renders its content", () => {
		render(<Badge>fixed</Badge>);
		expect(screen.getByText("fixed")).toBeInTheDocument();
	});

	it("colors by tone", () => {
		render(<Badge tone="price">60KB</Badge>);
		expect(screen.getByText("60KB")).toHaveClass("bg-saffron");
	});
});
