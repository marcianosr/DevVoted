import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { ConfigEffect, ConfigMeta } from "./ConfigFacts.ui";

const DESCRIPTION = "Pay to see how the community answered this poll.";

describe("ConfigEffect", () => {
	it("states the effect", () => {
		render(<ConfigEffect description={DESCRIPTION} />);

		expect(screen.getByText(DESCRIPTION)).toBeInTheDocument();
	});

	it("sets the description small and unbolded against the pinned body weight", () => {
		render(<ConfigEffect description={DESCRIPTION} />);

		const prose = screen.getByText(DESCRIPTION).closest("p");

		expect(prose).toHaveClass("text-xs", "font-normal");
		expect(prose).not.toHaveClass("text-sm");
	});

	it("badges the figures inside the effect line", () => {
		render(
			<ConfigEffect description="All coverage earns ×3, fading ×0.5 each gate clear." />
		);

		expect(screen.getByText("×3")).toHaveClass("badge-theme");
		expect(screen.getByText("×0.5")).toHaveClass("badge-theme");
	});

	it("tones the state line's figures as terms rather than gains", () => {
		render(
			<ConfigEffect
				description={DESCRIPTION}
				note="At ×2 now — deleted two clears on."
			/>
		);

		expect(screen.getByText("×2")).toHaveAttribute(
			"data-screen-theme",
			"saffron"
		);
	});

	it("shows no state line when there is nothing to report", () => {
		render(<ConfigEffect description={DESCRIPTION} />);

		expect(screen.queryByText(/now/)).not.toBeInTheDocument();
	});
});

describe("ConfigMeta", () => {
	it("prices what selling it back would return", () => {
		render(<ConfigMeta sellPrice="32 KB" />);

		expect(screen.getByText("uninstalls for")).toBeInTheDocument();
		expect(screen.getByText("32 KB")).toBeInTheDocument();
	});

	it("tags the version held", () => {
		render(<ConfigMeta sellPrice="32 KB" version={2} />);

		expect(screen.getByText("v2")).toBeInTheDocument();
	});

	it("omits the version entirely for a config that has none", () => {
		render(<ConfigMeta sellPrice="32 KB" />);

		expect(screen.queryByText(/^v\d/)).not.toBeInTheDocument();
	});

	it("leaves the weight to the header rather than stating it twice", () => {
		render(<ConfigMeta sellPrice="32 KB" version={2} />);

		expect(screen.queryByText("weight")).not.toBeInTheDocument();
	});

	it("quotes no price where there is no sale to make", () => {
		render(<ConfigMeta version={2} />);

		expect(screen.queryByText("uninstalls for")).not.toBeInTheDocument();
	});
});
