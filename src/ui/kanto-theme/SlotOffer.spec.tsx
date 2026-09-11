import { readFileSync } from "node:fs";

import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { maxSlots, slotDealsAt } from "~/test/kantoPoll.factory";

import { SlotOffer } from "./SlotOffer.ui";

const appCss = readFileSync("src/styles/app.css", "utf8");

const OFFER = { slot: 11, price: "120 KB" } as const;

const offerAt = (capacity?: number, balance?: number) => {
	const { offer } = slotDealsAt(capacity, balance);
	if (offer === undefined) throw new Error("the ladder offers nothing here");
	return offer;
};

describe("SlotOffer", () => {
	it("names the slot the purchase makes", () => {
		render(<SlotOffer {...OFFER} />);

		expect(screen.getByText("buy slot")).toBeInTheDocument();
		expect(screen.getByText("11")).toBeInTheDocument();
	});

	it("fattens the slot number so the line reads at a glance", () => {
		render(<SlotOffer {...OFFER} />);

		expect(screen.getByText("11")).toHaveClass(
			"font-bold",
			"tabular-nums",
			"text-theme-faint"
		);
	});

	it("bubbles the price rather than spelling it into the sentence", () => {
		render(<SlotOffer {...OFFER} />);

		expect(screen.getByText("120 KB")).toHaveClass("badge-theme");
	});

	it("greens the price while the balance covers it", () => {
		render(<SlotOffer {...OFFER} />);

		expect(screen.getByText("120 KB")).toHaveAttribute(
			"data-screen-theme",
			"viridian"
		);
	});

	it("reddens the price once it cannot be paid", () => {
		render(<SlotOffer {...OFFER} refusal="24 KB short" />);

		expect(screen.getByText("120 KB")).toHaveAttribute(
			"data-screen-theme",
			"cinnabar"
		);
	});

	it("hatches its ground, because room for sale is not a slot standing open", () => {
		const { container } = render(<SlotOffer {...OFFER} />);

		expect(container.firstElementChild).toHaveClass("bg-hatched-theme");
		expect(container.firstElementChild).not.toHaveClass("border-dashed");
	});

	it("hatches in the theme's own colour rather than a fixed zinc", () => {
		const utility = appCss.slice(appCss.indexOf("@utility bg-hatched-theme {"));
		const body = utility.slice(0, utility.indexOf("}"));

		expect(body).toContain("--theme-color");
		expect(body).not.toContain("--color-edge-strong");
	});

	it("hatches in broad bands rather than pinstripes", () => {
		const utility = appCss.slice(appCss.indexOf("@utility bg-hatched-theme {"));
		const body = utility.slice(0, utility.indexOf("}"));

		expect(body).toContain("12px 24px");
		expect(body).not.toContain("3px 4px");
	});

	it("paints an opaque ground step rather than a translucent line", () => {
		const utility = appCss.slice(appCss.indexOf("@utility bg-hatched-theme {"));
		const body = utility.slice(0, utility.indexOf("}"));

		expect(body).toContain("--theme-ground-chroma");
		expect(body).not.toMatch(/\/\s*0\./);
	});

	it("leaves bg-hatched alone, so the older kits still hatch in zinc", () => {
		const utility = appCss.slice(appCss.indexOf("@utility bg-hatched {"));
		const body = utility.slice(0, utility.indexOf("}"));

		expect(body).toContain("--color-edge-strong");
		expect(body).not.toContain("--theme-color");
	});

	it("shows the refusal it was handed rather than working out the shortfall", () => {
		render(<SlotOffer {...OFFER} refusal="24 KB short" />);

		expect(screen.getByText("24 KB short")).toBeInTheDocument();
	});

	it("says nothing about a shortfall when there is none", () => {
		render(<SlotOffer {...OFFER} />);

		expect(screen.queryByText(/short/)).not.toBeInTheDocument();
	});

	it("keeps the refusal out of a second bubble", () => {
		render(<SlotOffer {...OFFER} refusal="24 KB short" />);

		expect(screen.getByText("24 KB short")).not.toHaveClass("badge-theme");
	});

	it("reads the refusal in the price's own red, so the two are one refusal", () => {
		render(<SlotOffer {...OFFER} refusal="24 KB short" />);

		expect(screen.getByText("24 KB short")).toHaveAttribute(
			"data-screen-theme",
			"cinnabar"
		);
	});

	it("quotes the whole deal at rest, before anything is pressed", () => {
		render(<SlotOffer {...OFFER} refusal="24 KB short" onPress={vi.fn()} />);

		expect(
			screen.getByRole("button", { name: "buy slot 11 · 120 KB · 24 KB short" })
		).toBeInTheDocument();
	});

	it("goes through when the price is covered", async () => {
		const onPress = vi.fn();
		render(<SlotOffer {...OFFER} onPress={onPress} />);

		await userEvent.click(screen.getByRole("button"));

		expect(onPress).toHaveBeenCalledOnce();
	});

	it("refuses the press while the price is not covered", async () => {
		render(<SlotOffer {...OFFER} refusal="24 KB short" />);

		const offer = screen.getByRole("button");
		await userEvent.click(offer);

		expect(offer).toBeDisabled();
	});

	it("arms on the first press rather than spending straight away", () => {
		render(<SlotOffer {...OFFER} armed onPress={vi.fn()} />);

		expect(screen.getByRole("button")).toHaveAttribute("aria-pressed", "true");
	});

	it("rests unarmed, so a stray press cannot buy a slot", () => {
		render(<SlotOffer {...OFFER} onPress={vi.fn()} />);

		expect(screen.getByRole("button")).toHaveAttribute("aria-pressed", "false");
	});

	it("fills the column, so it lines up with the boxes above it", () => {
		const { container } = render(<SlotOffer {...OFFER} />);

		expect(container.firstElementChild).toHaveClass("w-full");
	});

	it("keeps the glyph decorative, since the sentence carries the meaning", () => {
		render(<SlotOffer {...OFFER} />);

		expect(screen.getByText("+")).toHaveAttribute("aria-hidden");
	});

	it("prices the next slot off the ladder, and names what is missing", () => {
		render(<SlotOffer {...offerAt()} />);

		expect(screen.getByText("11")).toBeInTheDocument();
		expect(screen.getByText("120 KB")).toBeInTheDocument();
		expect(screen.getByText("24 KB short")).toBeInTheDocument();
	});

	it("has no offer to make once the ladder is climbed out", () => {
		expect(slotDealsAt(maxSlots).offer).toBeUndefined();
	});

	it("says how the room is taken when the screen names the transaction", () => {
		render(<SlotOffer {...OFFER} verb="open" />);

		expect(screen.getByText(/open slot/)).toBeInTheDocument();
		expect(screen.queryByText(/buy slot/)).not.toBeInTheDocument();
	});

	it("carries that verb into the name the press answers to", () => {
		render(<SlotOffer {...OFFER} verb="open" onPress={vi.fn()} />);

		expect(
			screen.getByRole("button", { name: "open slot 11 · 120 KB" })
		).toBeInTheDocument();
	});

	it("buys a slot by default, so the shop needs no verb of its own", () => {
		render(<SlotOffer {...OFFER} />);

		expect(screen.getByText(/buy slot/)).toBeInTheDocument();
	});
});
