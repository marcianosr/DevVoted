import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ConfigdexPanel } from "./ConfigdexPanel.ui";

describe(ConfigdexPanel, () => {
	it("shows a grand total and per-rarity group headers", () => {
		render(<ConfigdexPanel />);
		expect(screen.getByText(/\d+\/\d+ collected/)).toBeInTheDocument();
		expect(screen.getByText(/legendary · \d+\/\d+/i)).toBeInTheDocument();
	});

	it("renders a known config with its effect", () => {
		render(<ConfigdexPanel />);
		expect(screen.getByText("Copilot")).toBeInTheDocument();
		expect(screen.getByText("All coverage ×2.")).toBeInTheDocument();
	});
});
