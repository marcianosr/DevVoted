import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ConfigdexPanel } from "~/modules/collection/dex/presentation/ConfigdexPanel.ui";

describe(ConfigdexPanel, () => {
	it("shows a grand total and per-rarity group headers", () => {
		render(<ConfigdexPanel />);
		expect(screen.getByText(/\d+\/\d+ collected/)).toBeInTheDocument();
		expect(screen.getByText(/legendary · \d+\/\d+/i)).toBeInTheDocument();
	});

	it("lists a config as a bare chip, with its effect in the chip's tooltip", () => {
		render(<ConfigdexPanel />);
		expect(screen.getByText("AGENTS.md")).toBeInTheDocument();
		// The effect is no longer printed under the label — the collection reads as
		// a grid of chips, and the prose lives one hover away.
		const tooltips = screen.getAllByRole("tooltip");
		expect(
			tooltips.some((node) =>
				node.textContent?.includes("All coverage earns ×2")
			)
		).toBe(true);
	});
});
