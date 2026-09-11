import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import {
	kantoGateZeroFooter,
	kantoPrepChampion,
	kantoPrepSealed,
} from "~/test/kantoPoll.factory";

import { ScreenFooter } from "./ScreenFooter.ui";

const props = kantoGateZeroFooter();

describe("ScreenFooter", () => {
	it("names what the gate asks and every figure it asks for", () => {
		render(<ScreenFooter {...props} />);

		expect(screen.getByText("gate 0 asks")).toBeInTheDocument();
		expect(screen.getByText("3% coverage")).toBeInTheDocument();
		expect(screen.getByText("+32 KB on a clear")).toBeInTheDocument();
		expect(screen.getByText("no peel · no audits")).toBeInTheDocument();
	});

	it("badges each figure apart from the others", () => {
		render(<ScreenFooter {...props} />);

		expect(screen.getByText("3% coverage")).toHaveClass("badge-theme");
	});

	it("colours the payout as a gain and leaves the demands plain", () => {
		render(<ScreenFooter {...props} />);

		expect(screen.getByText("+32 KB on a clear")).toHaveAttribute(
			"data-screen-theme",
			"viridian"
		);
		expect(screen.getByText("3% coverage")).not.toHaveAttribute(
			"data-screen-theme"
		);
	});

	it("refuses the start and says why, while the build is bare", async () => {
		render(<ScreenFooter {...props} />);

		const start = screen.getByRole("button", { name: "start gate 0" });
		await userEvent.click(start);

		expect(start).toBeDisabled();
		expect(
			screen.getByText(
				"A bare build never clears, so the run will not start until one config is installed."
			)
		).toBeInTheDocument();
	});

	it("keeps a refused start neutral rather than painting it as unaffordable", () => {
		render(<ScreenFooter {...props} />);

		expect(
			screen.getByRole("button", { name: "start gate 0" })
		).not.toHaveAttribute("data-screen-theme", "cinnabar");
	});

	it("lights the start and drops the refusal once the run can begin", async () => {
		const onPress = vi.fn();
		render(
			<ScreenFooter
				{...props}
				action={{ label: "start gate 0", onPress }}
				refusal={undefined}
			/>
		);

		const start = screen.getByRole("button", { name: "start gate 0" });
		await userEvent.click(start);

		expect(onPress).toHaveBeenCalledOnce();
		expect(start).not.toHaveAttribute("data-screen-theme");
	});

	it("pushes the start opposite the figures it acts on", () => {
		render(<ScreenFooter {...props} />);

		expect(
			screen.getByRole("button", { name: "start gate 0" }).parentElement
		).toHaveClass("ml-auto");
	});

	it("rules itself off from the screen above", () => {
		const { container } = render(<ScreenFooter {...props} />);

		expect(container.firstElementChild).toHaveClass(
			"border-t",
			"border-theme-faint"
		);
	});

	describe("over more than one stake", () => {
		const prep = kantoPrepSealed().footer;

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
			render(<ScreenFooter {...kantoPrepChampion().footer} />);

			expect(screen.getByText(/deepened by 410 Gone/)).toBeInTheDocument();
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
			aside: {
				label: "Community",
				icon: "community" as const,
				onPress: () => {},
			},
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
