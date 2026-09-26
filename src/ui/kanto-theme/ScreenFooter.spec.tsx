import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { kantoGateZeroFooter } from "~/test/kantoPoll.factory";
import { gateSwatchAt } from "~/test/swatchTrack.factory";

import {
	ScreenActions,
	ScreenFooter,
	type ScreenFooterProps,
} from "./ScreenFooter.ui";

const props = kantoGateZeroFooter();

const BARE_BUILD_REFUSAL =
	"A bare build never clears, so the run will not start until one config is installed.";

const REFUSED: ScreenFooterProps = { ...props, refusal: BARE_BUILD_REFUSAL };

const ONE_STAKE: ScreenFooterProps = {
	...props,
	stakes: [
		{
			label: "gate 0 asks",
			figures: [
				{ label: "3% coverage" },
				{ label: "+32 KB on a clear", color: "viridian" },
				{ label: "no peel · no audits" },
			],
		},
	],
};

const TWO_STAKES: ScreenFooterProps = {
	stakes: [
		{
			label: "clear",
			figures: [
				{ label: "+160 KB", color: "viridian" },
				{
					label: "Lavender swatch",
					swatch: { state: "current", swatch: gateSwatchAt(4) },
				},
			],
		},
		{ label: "miss", figures: [{ label: "peels 1 or 2 configs" }] },
	],
	asides: [{ label: "Community", icon: "community", onPress: () => {} }],
	action: { label: "Start Lavender", icon: "gate", onPress: () => {} },
};

describe("ScreenFooter", () => {
	it("names what the gate asks and every figure it asks for", () => {
		render(<ScreenFooter {...ONE_STAKE} />);

		expect(screen.getByText("gate 0 asks")).toBeInTheDocument();
		expect(screen.getByText("3% coverage")).toBeInTheDocument();
		expect(screen.getByText("+32 KB on a clear")).toBeInTheDocument();
		expect(screen.getByText("no peel · no audits")).toBeInTheDocument();
	});

	it("badges each figure apart from the others", () => {
		render(<ScreenFooter {...ONE_STAKE} />);

		expect(screen.getByText("3% coverage")).toHaveClass("badge-theme");
	});

	it("colours the payout as a gain and leaves the demands plain", () => {
		render(<ScreenFooter {...ONE_STAKE} />);

		expect(screen.getByText("+32 KB on a clear")).toHaveAttribute(
			"data-screen-theme",
			"viridian"
		);
		expect(screen.getByText("3% coverage")).not.toHaveAttribute(
			"data-screen-theme"
		);
	});

	it("refuses the start and says why, when a screen hands it a reason", async () => {
		render(<ScreenFooter {...REFUSED} />);

		const start = screen.getByRole("button", { name: /Pallet gate prep/ });
		await userEvent.click(start);

		expect(start).toBeDisabled();
		expect(screen.getByText(BARE_BUILD_REFUSAL)).toBeInTheDocument();
	});

	it("says nothing under a refused start that was given no reason", () => {
		render(<ScreenFooter {...props} />);

		expect(
			screen.getByRole("button", { name: /Pallet gate prep/ })
		).toBeDisabled();
		expect(screen.queryByText(BARE_BUILD_REFUSAL)).toBeNull();
	});

	it("keeps a refused start neutral rather than painting it as unaffordable", () => {
		render(<ScreenFooter {...props} />);

		expect(
			screen.getByRole("button", { name: /Pallet gate prep/ })
		).not.toHaveAttribute("data-screen-theme", "cinnabar");
	});

	it("lights the start and drops the refusal once the run can begin", async () => {
		const onPress = vi.fn();
		render(
			<ScreenFooter
				{...REFUSED}
				action={{ label: "Pallet gate prep", onPress }}
				refusal={undefined}
			/>
		);

		const start = screen.getByRole("button", { name: /Pallet gate prep/ });
		await userEvent.click(start);

		expect(onPress).toHaveBeenCalledOnce();
		expect(start).not.toHaveAttribute("data-screen-theme");
	});

	it("spans the press across the footer at every width", () => {
		render(<ScreenFooter {...props} />);

		expect(
			screen.getByRole("button", { name: /Pallet gate prep/ })
		).toHaveClass("w-full");
	});

	it("keeps the press the full width even once asides share the footer", () => {
		render(
			<ScreenFooter
				{...props}
				asides={[{ label: "Community", onPress: vi.fn() }]}
			/>
		);

		expect(
			screen.getByRole("button", { name: /Pallet gate prep/ })
		).toHaveClass("w-full");
	});

	it("stacks the press under the asides on a phone and sets it beside them from sm", () => {
		render(
			<ScreenFooter
				{...props}
				asides={[{ label: "Community", onPress: vi.fn() }]}
			/>
		);

		const press = screen.getByRole("button", { name: /Pallet gate prep/ });
		const asideRow = screen.getByRole("button", { name: "Community" })
			.parentElement?.parentElement;

		expect(asideRow).not.toContainElement(press);
		expect(press.parentElement?.parentElement).toHaveClass(
			"flex-col",
			"sm:flex-row"
		);
		expect(press.parentElement).toHaveClass("w-full", "sm:flex-1");
	});

	// A string standing between the two presses reads as a third control.
	it("drops the string the press cannot carry below the row, never between them", () => {
		render(
			<ScreenFooter
				{...kantoGateZeroFooter(true)}
				asides={[{ label: "Community", onPress: vi.fn() }]}
				refusal="That run is already going."
			/>
		);

		const spare = screen.getByText("That run is already going.");
		const row = screen.getByRole("button", { name: "Community" }).parentElement
			?.parentElement?.parentElement;

		expect(row).not.toContainElement(spare);
		expect(spare.parentElement?.parentElement?.nodeName).toBe("FOOTER");
	});

	// A screen offering two exits is offering a choice, and a choice reads as a
	// pair of equals rather than a queue to the left of the real press.
	it("gives two ways out a row of their own above the press, split evenly", () => {
		render(
			<ScreenFooter
				{...props}
				asides={[
					{ label: "Review answers", onPress: vi.fn() },
					{ label: "Community", onPress: vi.fn() },
				]}
			/>
		);

		const review = screen.getByRole("button", { name: "Review answers" });
		const block = review.parentElement?.parentElement?.parentElement;

		expect(block).not.toHaveClass("sm:flex-row");
		expect(review.parentElement).toHaveClass("flex-1");
		expect(review).toHaveClass("w-full");
		expect(review).not.toHaveClass("sm:w-fit");
	});

	it("stands the ways out at the size of the press they sit beside", () => {
		render(
			<ScreenFooter
				{...props}
				asides={[{ label: "Community", onPress: vi.fn() }]}
			/>
		);

		expect(screen.getByRole("button", { name: "Community" })).toHaveClass(
			"h-14",
			"rounded-2xl"
		);
	});

	it("keeps its asides side by side at every width", () => {
		render(
			<ScreenFooter
				{...props}
				asides={[
					{ label: "Community", onPress: vi.fn() },
					{ label: "To the shop", onPress: vi.fn() },
				]}
			/>
		);

		const row = screen.getByRole("button", { name: "Community" }).parentElement
			?.parentElement;

		expect(row).toHaveClass("flex-wrap");
		expect(row).not.toHaveClass("flex-col");
	});

	it("reads the note under the press's own label", () => {
		render(<ScreenFooter {...props} note="Or click ENTER" />);

		expect(
			screen.getByRole("button", { name: /Or click ENTER/ })
		).toContainElement(screen.getByText("Or click ENTER"));
	});

	it("draws no stake row for a screen that states its own stakes", () => {
		render(<ScreenFooter {...props} />);

		expect(screen.queryByText("gate 0 asks")).toBeNull();
	});

	it("rules itself off from the screen above", () => {
		const { container } = render(<ScreenFooter {...props} />);

		expect(container.firstElementChild).toHaveClass(
			"border-t",
			"border-theme-faint"
		);
	});

	describe("over more than one stake", () => {
		const prep = TWO_STAKES;

		it("labels each stake and keeps its own figures with it", () => {
			render(<ScreenFooter {...prep} />);

			expect(screen.getByText("clear")).toBeInTheDocument();
			expect(screen.getByText("miss")).toBeInTheDocument();
			expect(screen.getByText("+160 KB")).toBeInTheDocument();
			expect(screen.getByText("peels 1 or 2 configs")).toBeInTheDocument();
		});

		it("draws a swatch figure as a chip rather than a badge", () => {
			render(<ScreenFooter {...prep} />);

			expect(screen.getByText("Lavender swatch")).not.toHaveClass(
				"badge-theme"
			);
		});

		it("keeps the side exit unthemed beside the press that commits", () => {
			render(<ScreenFooter {...prep} />);

			expect(
				screen.getByRole("button", { name: "Community" })
			).not.toHaveAttribute("data-screen-theme");
			expect(
				screen.getByRole("button", { name: "Start Lavender" })
			).toHaveClass("segment-theme");
		});

		it("spends a second line on a cost with news in it", () => {
			render(
				<ScreenFooter {...prep} note="A peel this deep can end the run." />
			);

			expect(
				screen.getByText("A peel this deep can end the run.")
			).toBeInTheDocument();
		});

		it("says nothing under the rows while nothing needs saying", () => {
			const { container } = render(<ScreenFooter {...prep} />);

			expect(container.querySelectorAll("footer p")).toHaveLength(0);
		});

		it("stands the stakes over the press rather than beside it", () => {
			const { container } = render(<ScreenFooter {...prep} />);

			const stakes = container.querySelector("footer > div");
			expect(stakes).toHaveClass("justify-end");
			expect(stakes).toContainElement(screen.getByText("+160 KB"));
		});
	});

	describe("closing a debrief", () => {
		const debrief = {
			action: {
				label: "To the shop",
				icon: "shop" as const,
				onPress: () => {},
			},
			asides: [
				{
					label: "Community",
					icon: "community" as const,
					onPress: () => {},
				},
			],
			note: "the shop stays open until next gate starts",
		};

		it("stands with no stakes at all", () => {
			const { container } = render(<ScreenFooter {...debrief} />);

			expect(container.querySelector(".justify-end")).toBeNull();
			expect(
				screen.getByRole("button", { name: /To the shop/ })
			).toBeInTheDocument();
		});

		it("carries the note inside the press it describes", () => {
			render(<ScreenFooter {...debrief} />);

			const note = screen.getByText(
				"the shop stays open until next gate starts"
			);

			expect(note.nodeName).toBe("SPAN");
			expect(
				screen.getByRole("button", { name: /To the shop/ })
			).toContainElement(note);
		});

		it("marks the press with the icon where it has no gate to wear", () => {
			render(<ScreenFooter {...debrief} />);

			expect(
				screen
					.getByRole("button", { name: /To the shop/ })
					.querySelectorAll("svg")
			).toHaveLength(2);
		});

		it("signs each aside with the icon it was given", () => {
			render(<ScreenFooter {...debrief} />);

			expect(
				screen.getByRole("button", { name: "Community" }).querySelector("svg")
			).not.toBeNull();
		});
	});
});

describe("ScreenActions", () => {
	it("pins the screen's press to the bottom of a phone, and lets it go on a desktop", () => {
		const { container } = render(<ScreenActions {...props} />);

		expect(container.firstElementChild).toHaveClass(
			"sticky",
			"bottom-0",
			"md:static"
		);
	});

	it("spans the phone flush to its edges at every width", () => {
		const { container } = render(<ScreenActions {...props} />);

		expect(container.firstElementChild).toHaveClass(
			"-mx-4",
			"sm:-mx-8",
			"md:mx-0"
		);
	});

	it("draws no ground of its own behind a bar that is only the press", () => {
		const { container } = render(<ScreenActions {...props} />);

		expect(container.firstElementChild).not.toHaveClass("bg-theme-faint");
		expect(
			screen.getByRole("button", { name: /Pallet gate prep/ })
		).toBeInTheDocument();
	});

	// A stake reading and an aside's note have no fill of their own.
	it("stands on an opaque ground once it carries more than the press", () => {
		const { container } = render(
			<ScreenActions
				{...props}
				asides={[{ label: "Community", onPress: () => {} }]}
			/>
		);

		const bar = container.firstElementChild;

		expect(bar).toHaveClass("bg-theme-faint", "border-t");
		expect(bar).toHaveClass("md:rounded-2xl", "md:border");
		expect(bar).not.toHaveClass("rounded-2xl", "border");
	});

	it("stands on a ground for a refusal it has to seat above a live press", () => {
		const { container } = render(
			<ScreenActions
				{...kantoGateZeroFooter(true)}
				refusal="That run is already going."
			/>
		);

		expect(container.firstElementChild).toHaveClass("bg-theme-faint");
		expect(screen.getByText("That run is already going.").nodeName).toBe(
			"SPAN"
		);
	});

	it("carries its own space rather than a spacer sized to guess at it", () => {
		const { container } = render(<ScreenActions {...props} />);

		expect(container.children).toHaveLength(1);
		expect(container.firstElementChild).not.toHaveClass("fixed");
	});

	it("draws no rule of its own: the bar's own edge already is one", () => {
		const { container } = render(<ScreenActions {...props} />);

		expect(container.querySelector("footer")).not.toHaveClass("border-t");
	});
});
