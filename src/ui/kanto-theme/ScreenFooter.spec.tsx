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

	it("pushes the start opposite the figures it acts on, at every width", () => {
		render(<ScreenFooter {...props} />);

		expect(
			screen.getByRole("button", { name: /Pallet gate prep/ }).parentElement
		).toHaveClass("ml-auto");
	});

	it("spans a lone press across a phone, having no aside to sit beside", () => {
		render(<ScreenFooter {...props} />);

		expect(
			screen.getByRole("button", { name: /Pallet gate prep/ })
		).toHaveClass("w-full", "sm:w-fit");
	});

	it("leaves the press its own width once an aside shares the row", () => {
		render(
			<ScreenFooter
				{...props}
				asides={[{ label: "Community", onPress: vi.fn() }]}
			/>
		);

		expect(
			screen.getByRole("button", { name: /Pallet gate prep/ })
		).not.toHaveClass("w-full");
	});

	it("keeps its presses side by side at every width", () => {
		render(<ScreenFooter {...props} />);

		const row = screen.getByRole("button", { name: /Pallet gate prep/ })
			.parentElement?.parentElement;

		expect(row).toHaveClass("flex-wrap");
		expect(row).not.toHaveClass("flex-col");
	});

	// The note is the only thing in the row that can give, and squeezing it is
	// what collapsed it to one word per line on a phone.
	it("drops the note onto its own line rather than squeezing it between the presses", () => {
		render(<ScreenFooter {...props} note="Or click ENTER" noteAt="row" />);

		expect(screen.getByText("Or click ENTER").parentElement).toHaveClass(
			"order-last",
			"w-full",
			"sm:order-none"
		);
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
			).toHaveClass("press-theme");
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
			note: "the shop stays open until Vermilion starts",
		};

		it("stands with no stakes at all", () => {
			const { container } = render(<ScreenFooter {...debrief} />);

			expect(container.querySelector(".justify-end")).toBeNull();
			expect(
				screen.getByRole("button", { name: "To the shop" })
			).toBeInTheDocument();
		});

		it("sets the note between the two presses when asked", () => {
			render(<ScreenFooter {...debrief} noteAt="row" />);

			const note = screen.getByText(
				"the shop stays open until Vermilion starts"
			);

			expect(note.nodeName).toBe("SPAN");
			expect(note.closest("div")).toContainElement(
				screen.getByRole("button", { name: "Community" })
			);
		});

		it("keeps the note under the rows by default", () => {
			render(<ScreenFooter {...debrief} />);

			expect(
				screen.getByText("the shop stays open until Vermilion starts").nodeName
			).toBe("P");
		});

		it("signs each press with the icon it was given", () => {
			render(<ScreenFooter {...debrief} />);

			expect(
				screen.getByRole("button", { name: "To the shop" }).querySelector("svg")
			).not.toBeNull();
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

	it("spans the phone flush to its edges, and closes into a panel on a desktop", () => {
		const { container } = render(<ScreenActions {...props} />);

		const bar = container.firstElementChild;

		expect(bar).not.toHaveClass("rounded-2xl", "border");
		expect(bar).toHaveClass("border-t", "md:rounded-2xl", "md:border");
		expect(bar).toHaveClass("-mx-4", "sm:-mx-8", "md:mx-0");
	});

	it("stands the press on an opaque ground, so the screen scrolls behind it", () => {
		const { container } = render(<ScreenActions {...props} />);

		expect(container.firstElementChild).toHaveClass("bg-theme-faint");
		expect(
			screen.getByRole("button", { name: /Pallet gate prep/ })
		).toBeInTheDocument();
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
