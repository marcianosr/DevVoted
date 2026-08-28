import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { ExtraSpotRow } from "./ExtraSpotRow.ui";

const step = {
	label: "+2 spots",
	makes: "makes 10",
	terms: "16 KB a gate",
	held: false,
};

describe("ExtraSpotRow", () => {
	it("states what it adds, the width it makes, and what it costs", () => {
		render(<ExtraSpotRow {...step} pick={{ onUse: () => {} }} />);

		expect(screen.getByText("+2 spots")).toBeInTheDocument();
		expect(screen.getByText("makes 10")).toBeInTheDocument();
		expect(screen.getByText("16 KB a gate")).toBeInTheDocument();
	});

	it("picks with a radio, named after all three figures", () => {
		render(<ExtraSpotRow {...step} pick={{ onUse: () => {} }} />);

		expect(
			screen.getByRole("radio", { name: "+2 spots makes 10 16 KB a gate" })
		).toBeInTheDocument();
	});

	it("rents the step when its radio is used", async () => {
		const onUse = vi.fn();
		render(<ExtraSpotRow {...step} pick={{ onUse }} />);

		await userEvent.click(screen.getByRole("radio"));

		expect(onUse).toHaveBeenCalledOnce();
	});

	it("marks the step the run is standing on", () => {
		const { container } = render(
			<ExtraSpotRow {...step} held pick={{ onUse: () => {} }} />
		);

		expect(screen.getByRole("radio")).toBeChecked();
		expect(container.firstElementChild).toHaveClass("border-theme");
	});

	it("refuses the radio when the rent is out of reach", () => {
		render(
			<ExtraSpotRow {...step} pick={{ disabled: true, onUse: vi.fn() }} />
		);

		expect(screen.getByRole("radio")).toBeDisabled();
	});

	it("reads the free width in a settled tone, not as a price", () => {
		render(
			<ExtraSpotRow
				{...step}
				label="none"
				terms="free"
				settled
				pick={{ onUse: () => {} }}
			/>
		);

		expect(screen.getByText("free")).toHaveClass("text-celadon");
	});

	it("offers no radio at all on a step this depth does not sell", () => {
		render(<ExtraSpotRow {...step} opensAt="opens at gate 5" />);

		expect(screen.queryByRole("radio")).toBeNull();
		expect(screen.getByText("opens at gate 5")).toBeInTheDocument();
	});

	it("carries no press of any kind", () => {
		render(<ExtraSpotRow {...step} pick={{ onUse: () => {} }} />);

		expect(screen.queryByRole("button")).toBeNull();
	});

	it("stands at the kit's tight rhythm", () => {
		const { container } = render(
			<ExtraSpotRow {...step} pick={{ onUse: () => {} }} />
		);

		expect(container.firstElementChild).toHaveClass("px-2", "py-1");
	});
});
