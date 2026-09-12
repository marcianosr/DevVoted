import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import {
	LOCK_NOTE,
	createKantoHeaderProps,
	createKantoShopScreenProps,
	kantoClosedShopProps,
} from "~/test/kantoPoll.factory";

import { ShopScreen } from "./ShopScreen.ui";

const props = createKantoShopScreenProps();

const sentence = (text: string) =>
	screen.getByText((_, element) => element?.textContent === text);

describe("ShopScreen", () => {
	it("stands the build beside the registry", () => {
		render(<ShopScreen {...props} />);

		expect(screen.getByText("Build")).toBeInTheDocument();
		expect(screen.getByText("Registry")).toBeInTheDocument();
	});

	it("names what the build costs to run every gate", () => {
		render(<ShopScreen {...props} />);

		expect(
			screen.getByText("7 weight · 16 KB a gate · 1 to 32 KB")
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

	it("reads as the shop of the gate it cleared, facing the gate ahead", () => {
		render(<ShopScreen {...props} />);

		expect(screen.getByText("Shop · cleared Volcano")).toBeInTheDocument();
		expect(
			screen.getByText("next gate 10 · Earth · to pass 250%")
		).toBeInTheDocument();
	});

	it("splits the build's weight into what is covered and what is billed", () => {
		render(<ShopScreen {...props} />);

		expect(
			screen.getByText("5 configs · 7 weight · 4 covered · 3 billable")
		).toBeInTheDocument();
	});

	it("sells the next rung of free weight under the build it applies to", () => {
		render(<ShopScreen {...props} />);

		const offer = screen.getByRole("button", {
			name: /^carry 8 free weight/,
		});
		expect(offer.closest("section")).toContainElement(
			screen.getByText("Build")
		);
	});

	it("names what opens the rung after the one on sale", () => {
		render(<ShopScreen {...props} />);

		expect(screen.getByText(/opens once a run has held/)).toBeInTheDocument();
	});

	it("keeps no ladder panel beside the build", () => {
		render(<ShopScreen {...props} />);

		expect(
			screen.queryByRole("list", { name: "free weight rungs" })
		).not.toBeInTheDocument();
		expect(
			screen.queryByRole("heading", { name: "What it costs to run" })
		).not.toBeInTheDocument();
	});

	it("footnotes what the hidden padlock needs", () => {
		render(<ShopScreen {...props} />);

		expect(screen.getByText(LOCK_NOTE)).toBeInTheDocument();
	});

	it("stages the git tag as a control, refused with its shortfall", () => {
		render(<ShopScreen {...props} />);

		expect(screen.getByText("git tag · gate 10")).toBeInTheDocument();

		const shortfall = screen.getByText("352 KB short");
		expect(shortfall).toHaveAttribute("data-screen-theme", "cinnabar");
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
});
