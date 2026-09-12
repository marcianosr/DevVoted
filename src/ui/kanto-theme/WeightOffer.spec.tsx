import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { WeightOffer } from "./WeightOffer.ui";

const OFFER = { from: 4, to: 8, price: "256 KB" } as const;
const LOCKED = {
	to: 12,
	opensAt: "opens once a run has held 768 KB",
} as const;

const rowOf = (container: HTMLElement) => container.firstElementChild;

describe("WeightOffer", () => {
	it("names the weight the purchase carries", () => {
		render(<WeightOffer {...OFFER} onPress={() => {}} />);

		expect(
			screen.getByRole("button", { name: /^carry 8 free weight/ })
		).toBeInTheDocument();
	});

	it("shows the climb, so the upgrade reads as a move from where you are", () => {
		render(<WeightOffer {...OFFER} onPress={() => {}} />);

		expect(screen.getByText("4 → 8")).toBeInTheDocument();
	});

	it("fattens the weight so the line reads at a glance", () => {
		const { container } = render(<WeightOffer {...OFFER} onPress={() => {}} />);

		expect(
			container.querySelector(".font-bold.tabular-nums")
		).toHaveTextContent("8");
	});

	it("bubbles the price rather than spelling it into the sentence", () => {
		const { container } = render(<WeightOffer {...OFFER} onPress={() => {}} />);

		expect(container.querySelector(".badge-theme")).toHaveTextContent("256 KB");
	});

	it("greens the price while the balance covers it", () => {
		const { container } = render(<WeightOffer {...OFFER} onPress={() => {}} />);

		expect(container.querySelector(".badge-theme")).toHaveAttribute(
			"data-screen-theme",
			"viridian"
		);
	});

	it("reddens the price once it cannot be paid", () => {
		const { container } = render(
			<WeightOffer {...OFFER} refusal="160 KB short" />
		);

		expect(container.querySelector(".badge-theme")).toHaveAttribute(
			"data-screen-theme",
			"cinnabar"
		);
	});

	it("shows the refusal it was handed rather than working out the shortfall", () => {
		render(<WeightOffer {...OFFER} refusal="160 KB short" />);

		expect(screen.getByText("160 KB short")).toBeInTheDocument();
	});

	it("keeps the refusal out of a second bubble", () => {
		const { container } = render(
			<WeightOffer {...OFFER} refusal="160 KB short" />
		);

		expect(container.querySelectorAll(".badge-theme")).toHaveLength(1);
	});

	it("quotes the whole deal at rest, before anything is pressed", () => {
		render(<WeightOffer {...OFFER} refusal="160 KB short" />);

		expect(
			screen.getByRole("button", {
				name: "carry 8 free weight · 4 → 8 · 256 KB · 160 KB short",
			})
		).toBeInTheDocument();
	});

	it("hatches its ground, because room for sale is not weight you hold", () => {
		const { container } = render(<WeightOffer {...OFFER} onPress={() => {}} />);

		expect(rowOf(container)).toHaveClass("bg-hatched-theme");
	});

	it("goes through when the price is covered", async () => {
		const onPress = vi.fn();
		render(<WeightOffer {...OFFER} onPress={onPress} />);

		await userEvent.click(screen.getByRole("button"));

		expect(onPress).toHaveBeenCalledOnce();
	});

	it("refuses the press while the price is not covered", () => {
		render(<WeightOffer {...OFFER} refusal="160 KB short" />);

		expect(screen.getByRole("button")).toBeDisabled();
	});

	it("rests unarmed, so a stray press cannot buy weight", () => {
		render(<WeightOffer {...OFFER} onPress={() => {}} />);

		expect(screen.getByRole("button")).toHaveAttribute("aria-pressed", "false");
	});

	it("arms on the first press rather than spending straight away", () => {
		render(<WeightOffer {...OFFER} armed onPress={() => {}} />);

		expect(screen.getByRole("button")).toHaveAttribute("aria-pressed", "true");
	});

	it("fills the column, so it lines up with the chips above it", () => {
		const { container } = render(<WeightOffer {...OFFER} onPress={() => {}} />);

		expect(rowOf(container)).toHaveClass("w-full");
	});

	it("keeps the glyph decorative, since the sentence carries the meaning", () => {
		const { container } = render(<WeightOffer {...OFFER} onPress={() => {}} />);

		expect(container.querySelector("[aria-hidden]")).toHaveTextContent("+");
	});
});

describe("a rung the run has not opened", () => {
	it("offers no press, because it is not for sale at any price", () => {
		render(<WeightOffer {...LOCKED} />);

		expect(screen.queryByRole("button")).not.toBeInTheDocument();
	});

	it("names what opens it instead of what it costs", () => {
		const { container } = render(<WeightOffer {...LOCKED} />);

		expect(rowOf(container)).toHaveTextContent(
			"opens once a run has held 768 KB"
		);
	});

	it("still shows its weight, so the ladder can be aimed at", () => {
		const { container } = render(<WeightOffer {...LOCKED} />);

		expect(
			container.querySelector(".font-bold.tabular-nums")
		).toHaveTextContent("12");
	});

	it("badges the figure in the condition, since a figure never goes bare", () => {
		const { container } = render(<WeightOffer {...LOCKED} />);

		expect(container.querySelector(".badge-theme")).toHaveTextContent("768 KB");
	});

	it("stays readable rather than being hidden as decoration", () => {
		const { container } = render(<WeightOffer {...LOCKED} />);

		expect(rowOf(container)).not.toHaveAttribute("aria-hidden");
	});

	it("hatches like the offer, since both are room that is not yours", () => {
		const { container } = render(<WeightOffer {...LOCKED} />);

		expect(rowOf(container)).toHaveClass("bg-hatched-theme");
	});
});
