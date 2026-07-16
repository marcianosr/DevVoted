import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { StatBadge } from "./StatBadge.ui";

describe(StatBadge, () => {
	it("renders the label and value", () => {
		render(<StatBadge label="Storage" value="440KB" />);
		expect(screen.getByText("Storage")).toBeInTheDocument();
		expect(screen.getByText("440KB")).toBeInTheDocument();
	});

	it("colors the value in the active category theme", () => {
		render(<StatBadge label="Coverage" value="6%" category="css" />);
		expect(screen.getByText("6%")).toHaveClass("text-theme");
	});
});
