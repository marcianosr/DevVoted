import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { baseSlots, slotDealsAt } from "~/test/kantoPoll.factory";

import { SlotBox } from "./SlotBox.ui";

const CASH = { refund: "+96 KB" } as const;

describe("SlotBox", () => {
	it("reads as an empty slot when nothing is on offer for it", () => {
		render(<SlotBox />);

		expect(screen.getByText("empty slot")).toBeInTheDocument();
	});

	it("stays a plain box while there is no refund to take", () => {
		render(<SlotBox />);

		expect(screen.queryByRole("button")).not.toBeInTheDocument();
	});

	it("leaves the count to the band rather than announcing itself", () => {
		const { container } = render(<SlotBox />);

		expect(container.firstElementChild).toHaveAttribute("aria-hidden");
	});

	it("becomes one press across the whole box when the slot can be cashed", () => {
		render(<SlotBox cash={{ ...CASH, onPress: vi.fn() }} />);

		expect(
			screen.getByRole("button", { name: "cash this slot back · +96 KB" })
		).toBeInTheDocument();
	});

	it("bubbles the refund rather than spelling it into the sentence", () => {
		render(<SlotBox cash={CASH} />);

		expect(screen.getByText("+96 KB")).toHaveClass("badge-theme");
	});

	it("pays the refund in the colour a gain wears, since cashing does not cost", () => {
		render(<SlotBox cash={CASH} />);

		expect(screen.getByText("+96 KB")).toHaveAttribute(
			"data-screen-theme",
			"viridian"
		);
	});

	it("hands the refund back on a press", async () => {
		const onPress = vi.fn();
		render(<SlotBox cash={{ ...CASH, onPress }} />);

		await userEvent.click(screen.getByRole("button"));

		expect(onPress).toHaveBeenCalledOnce();
	});

	it("reports whether the next press would commit", () => {
		render(<SlotBox cash={{ ...CASH, armed: true, onPress: vi.fn() }} />);

		expect(screen.getByRole("button")).toHaveAttribute("aria-pressed", "true");
	});

	it("rests unarmed, so a stray press cannot spend", () => {
		render(<SlotBox cash={{ ...CASH, onPress: vi.fn() }} />);

		expect(screen.getByRole("button")).toHaveAttribute("aria-pressed", "false");
	});

	it("refuses the press when the deal came without a handler", () => {
		render(<SlotBox cash={CASH} />);

		expect(screen.getByRole("button")).toBeDisabled();
	});

	it.each([
		["idle", undefined],
		["cashable", { refund: "+96 KB", onPress: () => {} }],
	])("dashes its edge while %s, since a config could fill it", (_, cash) => {
		const { container } = render(<SlotBox cash={cash} />);

		expect(container.firstElementChild).toHaveClass("border-dashed");
	});

	it("wears no fill, so a vacancy is a hole and not a dimmer chip", () => {
		const { container } = render(<SlotBox />);

		expect(container.firstElementChild).not.toHaveClass("bg-theme-raised");
	});

	it("fills the column, so it lines up with the chips above it", () => {
		const { container } = render(<SlotBox />);

		expect(container.firstElementChild).toHaveClass("w-full");
	});

	it("keeps the glyph decorative, since the sentence carries the meaning", () => {
		render(<SlotBox cash={CASH} />);

		expect(screen.getByText("−")).toHaveAttribute("aria-hidden");
	});

	it("has nothing to cash on the four slots that were free", () => {
		render(<SlotBox cash={slotDealsAt(baseSlots).cash} />);

		expect(screen.queryByRole("button")).not.toBeInTheDocument();
		expect(screen.getByText("empty slot")).toBeInTheDocument();
	});

	it("refunds what the engine says the widest slot cost", () => {
		render(<SlotBox cash={slotDealsAt().cash} />);

		expect(screen.getByText("+96 KB")).toBeInTheDocument();
	});

	it("says what the screen gives it instead of naming a slot", () => {
		render(<SlotBox label="nothing installed yet" />);

		expect(screen.getByText("nothing installed yet")).toBeInTheDocument();
		expect(screen.queryByText("empty slot")).not.toBeInTheDocument();
	});

	it("keeps a labelled box inert, since it stands for no slot to cash", () => {
		render(<SlotBox label="nothing installed yet" />);

		expect(screen.queryByRole("button")).not.toBeInTheDocument();
	});
});
