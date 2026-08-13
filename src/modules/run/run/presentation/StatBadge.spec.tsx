import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { StatBadge } from "~/modules/run/run/presentation/StatBadge.ui";

describe(StatBadge, () => {
	it("renders the label and value", () => {
		render(<StatBadge label="Storage" value="440KB" />);
		expect(screen.getByText("Storage")).toBeInTheDocument();
		expect(screen.getByText("440KB")).toBeInTheDocument();
	});

	it("colors the value in the inherited theme by default", () => {
		render(<StatBadge label="Coverage" value="6%" />);
		expect(screen.getByText("6%")).toHaveClass("text-theme");
	});

	it("shows a pending change as muted old value with the new value in celadon", () => {
		render(<StatBadge label="coverage ×" value="×2" from="×1" />);
		expect(screen.getByText("×1")).toHaveClass("text-pewter");
		expect(screen.getByText("→ ×2")).toHaveClass("text-celadon");
	});
});
