import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";

import {
	createKantoHeaderProps,
	createKantoShopScreenProps,
	kantoClosedShopProps,
	kantoRegistryControls,
} from "~/test/kantoPoll.factory";

import { ShopScreen } from "./ShopScreen.ui";

const props = createKantoShopScreenProps();

const sentence = (text: string) =>
	screen.getByText((_, element) => element?.textContent === text);

const panelOf = (name: string): HTMLElement => {
	const panel = screen
		.getByRole("heading", { name })
		.closest<HTMLElement>("section");

	if (panel === null) throw new Error(`no panel is headed "${name}"`);

	return panel;
};

const headOf = (label: string): HTMLElement => {
	const head = screen.getByText(label).closest<HTMLElement>("header");

	if (head === null) throw new Error(`"${label}" heads no panel`);

	return head;
};

describe("ShopScreen", () => {
	it("stands the build beside the registry", () => {
		render(<ShopScreen {...props} />);

		expect(screen.getByText("Build")).toBeInTheDocument();
		expect(screen.getByText("Registry")).toBeInTheDocument();
	});

	it("counts the room left and names what crossing it would cost", () => {
		render(<ShopScreen {...props} />);

		expect(
			screen.getByText("7 of 8 weight · 1 free before the bill becomes 64 KB")
		).toBeInTheDocument();
	});

	it("prices a slot in the registry's own header", () => {
		render(<ShopScreen {...props} />);

		expect(sentence("5 offers · 32 KB a slot")).toBeInTheDocument();
	});

	it("stretches the build's chips across the column rather than wrapping them", () => {
		render(<ShopScreen {...props} />);

		const build = screen.getByText("Build").closest("section");
		expect(build?.querySelector('.w-full[class*="bg-theme/"]')).not.toBeNull();
	});

	it("wears the gate it is running rather than a colour of its own", () => {
		const header = createKantoHeaderProps();
		const { container } = render(
			<ShopScreen
				build={props.build}
				registry={props.registry}
				header={header}
			/>
		);

		const root = container.firstElementChild;

		expect(root).toHaveAttribute("data-gate-theme", header.swatch.theme);
		expect(root).not.toHaveAttribute("data-screen-theme");
	});

	it("sells no room, because nothing caps the build any more", () => {
		render(<ShopScreen {...props} />);

		expect(screen.queryByText("empty slot")).not.toBeInTheDocument();
		expect(
			screen.queryByRole("button", { name: /^buy slot/ })
		).not.toBeInTheDocument();
		expect(
			screen.queryByRole("button", { name: /cash this slot/ })
		).not.toBeInTheDocument();
	});

	it("names the balance its offers are priced against", () => {
		render(<ShopScreen {...props} />);

		const funds = screen.getByText("balance").parentElement;
		expect(funds).toHaveTextContent("96 KB");
	});

	it("reads as the shop of the gate it cleared, counting that gate off", () => {
		render(<ShopScreen {...props} />);

		expect(screen.getByText("Shop · cleared Volcano")).toBeInTheDocument();
		expect(screen.getByText("gate 9 cleared")).toBeInTheDocument();
	});

	it("stands its panels on the page, shedding the screen's own frame", () => {
		const { container } = render(<ShopScreen {...props} />);

		expect(container.firstElementChild).not.toHaveClass("bg-theme-faint");
		expect(container.firstElementChild).not.toHaveClass("rounded-3xl");
	});

	it("heads the build with what it holds against the room it rents", () => {
		render(<ShopScreen {...props} />);

		expect(headOf("Build")).toHaveTextContent(
			"5 configs · 7 of 8 weight · 1 free"
		);
	});

	it("quotes the bill once, in the Build panel that now owns it (ADR-098)", () => {
		render(<ShopScreen {...props} />);

		expect(within(headOf("Build")).getByText("↻ 32 KB a gate")).toBeVisible();
		expect(screen.getAllByText(/32 KB a gate/)).toHaveLength(1);
	});

	/**
	 * The rung is no longer a thing the shop sells, so there is no panel and no
	 * press for it (ADR-098) — it is stated on the build it follows.
	 */
	it("sells no build space at all, in a panel or on a press", () => {
		render(<ShopScreen {...props} />);

		expect(screen.queryByText("build space")).not.toBeInTheDocument();
		expect(
			screen.queryByRole("button", { name: /weight · \d+ KB/ })
		).not.toBeInTheDocument();
		expect(
			screen.queryByRole("button", { name: /free weight/ })
		).not.toBeInTheDocument();
	});

	it("stages the git tag as a control, refused with its shortfall", () => {
		render(<ShopScreen {...props} />);

		expect(screen.getByText("git tag · gate 10")).toBeInTheDocument();

		const shortfall = screen.getByText("352 KB short");
		expect(shortfall).toHaveAttribute("data-screen-theme", "cinnabar");
	});

	it("stands the registry's controls in a panel of their own", () => {
		render(<ShopScreen {...props} />);

		const panel = panelOf("Registry control");

		for (const control of kantoRegistryControls) {
			expect(within(panel).getByText(control.title)).toBeInTheDocument();
		}
		expect(within(panel).queryByText("Intellisense")).toBeNull();
	});

	it("rules the controls apart rather than boxing each one twice", () => {
		render(<ShopScreen {...props} />);

		const row = screen
			.getByText("Rebuild the registry")
			.closest("div.border-t");

		expect(row).toHaveClass("first:border-t-0");
		expect(row?.querySelector(".bg-theme-raised.rounded-lg")).toBeNull();
	});

	it("drops the control panel when the shop offers no controls", () => {
		render(<ShopScreen {...props} controls={[]} />);

		expect(
			screen.queryByRole("heading", { name: "Registry control" })
		).not.toBeInTheDocument();
	});

	it("shows no audit band when no audit runs the shop", () => {
		render(<ShopScreen {...props} />);

		expect(screen.queryByText("405")).not.toBeInTheDocument();
	});

	it("closes under a 405 audit with every press dead", () => {
		render(<ShopScreen {...kantoClosedShopProps()} />);

		expect(screen.getByText("405")).toBeInTheDocument();
		expect(screen.getByText("Method Not Allowed")).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: /Rebuild the registry/ })
		).toBeDisabled();
		expect(
			screen.getByRole("button", { name: /Install IndexedDB/ })
		).toBeDisabled();
	});

	it("leaves the shop without an exit until the run gives it one", () => {
		render(<ShopScreen {...props} />);

		expect(
			screen.queryByRole("button", { name: /prep/ })
		).not.toBeInTheDocument();
	});

	it("closes on the footer the run hands it", () => {
		render(
			<ShopScreen
				{...props}
				footer={{ action: { label: "To gate 10 prep", onPress: () => {} } }}
			/>
		);

		expect(
			screen.getByRole("button", { name: /To gate 10 prep/ })
		).toBeEnabled();
	});

	it("refuses the exit while the build is over capacity", () => {
		render(
			<ShopScreen
				{...props}
				footer={{
					action: { label: "To gate 10 prep" },
					refusal: "the build is over capacity by 1 slot",
				}}
			/>
		);

		expect(
			screen.getByRole("button", { name: /To gate 10 prep/ })
		).toBeDisabled();
		expect(
			screen.getByText("the build is over capacity by 1 slot")
		).toBeInTheDocument();
	});
});

describe("the gate the shop is stocking for", () => {
	it("names the gate ahead and what it will be scored out of", () => {
		render(<ShopScreen {...props} />);

		const panel = panelOf("Next gate");

		expect(within(panel).getByText("Gate 10 · Earth")).toBeInTheDocument();
		expect(
			within(panel).getByText(/55 slots after it closes/)
		).toBeInTheDocument();
	});

	it("sets the pass line against the coverage the run carries in", () => {
		render(<ShopScreen {...props} />);

		const panel = panelOf("Next gate");

		expect(within(panel).getByText("HEALTHY")).toBeInTheDocument();
		expect(within(panel).getByText("83.6%")).toHaveAttribute(
			"data-screen-theme",
			"viridian"
		);
		expect(within(panel).getByText("74.5%")).toHaveAttribute(
			"data-screen-theme",
			"vermillion"
		);
	});

	it("says when the gate opens, the run being one gate a day", () => {
		render(<ShopScreen {...props} />);

		expect(screen.getByText("tomorrow")).toBeInTheDocument();
	});

	it("shows no gate ahead once the shop has no next gate", () => {
		render(<ShopScreen {...props} nextGate={undefined} />);

		expect(
			screen.queryByRole("heading", { name: "Next gate" })
		).not.toBeInTheDocument();
	});
});
