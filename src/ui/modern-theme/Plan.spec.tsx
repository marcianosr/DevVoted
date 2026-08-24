import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Plan } from "./Plan.ui";

const free = {
	id: "tier-1",
	name: "storage-plan",
	cap: "512 KB",
	terms: "free",
	free: true,
	figure: "296 free now",
	selected: true,
	onSelect: () => {},
};

describe("Plan", () => {
	it("names the tier, its terms and its figure in one breath", async () => {
		render(<Plan {...free} />);

		expect(
			screen.getByRole("radio", { name: "512 KB free 296 free now" })
		).toBeChecked();
	});

	it("reports the plan you moved to", async () => {
		const onSelect = vi.fn();
		render(
			<Plan
				id="tier-3"
				name="storage-plan"
				cap="768 KB"
				terms="16 KB / gate"
				figure="+256"
				selected={false}
				onSelect={onSelect}
			/>
		);

		await userEvent.click(screen.getByRole("radio"));

		expect(onSelect).toHaveBeenCalledWith("tier-3");
	});

	it("greens a plan that costs nothing, since no bill is the good news", () => {
		render(<Plan {...free} />);

		expect(screen.getByText("free")).toHaveClass("text-celadon");
	});

	it("leaves a plan that bills in the muted column", () => {
		render(
			<Plan
				id="tier-2"
				name="storage-plan"
				cap="640 KB"
				terms="8 KB / gate"
				selected={false}
				onSelect={() => {}}
			/>
		);

		expect(screen.getByText("8 KB / gate")).not.toHaveClass("text-celadon");
	});

	it("redacts a tier that has not opened, cap and terms both", () => {
		render(<Plan id="tier-5" locked opensAt="opens when gate 6 clears" />);

		expect(screen.getByText("???")).toBeInTheDocument();
		expect(screen.getByText("opens when gate 6 clears")).toBeInTheDocument();
		expect(screen.queryByRole("radio")).toBeNull();
	});

	// A sealed tier is not a choice you can lose, so it must not sit in the
	// radio group's tab order at all.
	it("offers no control on a sealed tier", () => {
		const { container } = render(
			<Plan id="tier-5" locked opensAt="opens when gate 6 clears" />
		);

		expect(container.querySelector("input")).toBeNull();
		expect(container.firstChild).toHaveClass("opacity-50");
	});
	// Row owns the padding, so a rung sits at the same rhythm as every other list
	// item in the kit rather than at its own.
	it("stands at the kit's tight rhythm", () => {
		const { container } = render(
			<Plan
				id="tier-1"
				name="storage-plan"
				cap="512 KB"
				terms="free"
				selected
				onSelect={() => {}}
			/>
		);

		expect(container.firstElementChild).toHaveClass("px-2", "py-1");
	});
});
