import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { ConfigInfo } from "./ConfigInfo.ui";

const props = {
	name: "Telemetry",
	description: "Pay to see how the community answered this poll.",
	slots: 2,
	sellPrice: "32 KB",
	version: 2,
	maxVersion: 2,
} as const;

describe("ConfigInfo", () => {
	it("names the config and its effect", () => {
		render(<ConfigInfo {...props} />);

		expect(screen.getByText("Telemetry")).toBeInTheDocument();
		expect(screen.getByText(props.description)).toBeInTheDocument();
	});

	it("sets the description small and unbolded against the pinned body weight", () => {
		render(<ConfigInfo {...props} />);

		const prose = screen.getByText(props.description).closest("p");

		expect(prose).toHaveClass("text-xs", "font-normal");
		expect(prose).not.toHaveClass("text-sm");
	});

	it("tags the version without counting the rungs beside it", () => {
		render(<ConfigInfo {...props} />);

		expect(screen.getByText("v2")).toBeInTheDocument();
		expect(screen.queryByText(/^of \d/)).not.toBeInTheDocument();
	});

	it("spells the ladder in words rather than drawing it twice", () => {
		render(<ConfigInfo {...props} />);

		expect(
			screen.queryByRole("img", { name: /version/ })
		).not.toBeInTheDocument();
	});

	it("says so in words when a config cannot be upgraded", () => {
		render(<ConfigInfo {...props} version={1} maxVersion={1} />);

		expect(screen.getByText("no upgrades")).toBeInTheDocument();
		expect(
			screen.queryByRole("img", { name: /version/ })
		).not.toBeInTheDocument();
	});

	it("badges the figures inside the effect line", () => {
		render(
			<ConfigInfo
				{...props}
				description="All coverage earns ×3, fading ×0.5 each gate clear."
			/>
		);

		expect(screen.getByText("×3")).toHaveClass("badge-theme");
		expect(screen.getByText("×0.5")).toHaveClass("badge-theme");
	});

	it("tones the state line's figures as terms rather than gains", () => {
		render(<ConfigInfo {...props} note="At ×2 now — deleted two clears on." />);

		expect(screen.getByText("×2")).toHaveAttribute(
			"data-screen-theme",
			"saffron"
		);
	});

	it("shows no state line when there is nothing to report", () => {
		render(<ConfigInfo {...props} />);

		expect(screen.queryByText(/now/)).not.toBeInTheDocument();
	});

	it("footers the weight as a figure between its two labels", () => {
		render(<ConfigInfo {...props} />);

		expect(screen.getByText("weight").parentElement?.textContent).toBe(
			"weight2slots"
		);
	});

	it("counts one slot as a slot, not as slots", () => {
		render(<ConfigInfo {...props} slots={1} />);

		expect(screen.getByText("weight").parentElement?.textContent).toBe(
			"weight1slot"
		);
	});

	it("prices what selling it back would return", () => {
		render(<ConfigInfo {...props} />);

		expect(screen.getByText("sells for")).toBeInTheDocument();
		expect(screen.getByText("32 KB")).toBeInTheDocument();
	});

	it("omits the version entirely for a config that has none", () => {
		render(
			<ConfigInfo {...props} version={undefined} maxVersion={undefined} />
		);

		expect(screen.queryByText("v2")).not.toBeInTheDocument();
		expect(screen.getByText("no upgrades")).toBeInTheDocument();
	});

	it("wears the kit's panel surface, in a fixed column of its own", () => {
		const { container } = render(<ConfigInfo {...props} />);

		expect(container.firstChild).toHaveClass("bg-theme-faint", "w-80");
		expect(container.firstChild).not.toHaveClass("bg-theme-raised");
	});
});
