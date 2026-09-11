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

	it("counts the slots the build has spent, not what pays a poll", () => {
		render(<ShopScreen {...props} />);

		expect(
			screen.getByText("5 configs · 7 of 10 slots · 3 free")
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
				plan={props.plan}
			/>
		);

		const root = container.firstElementChild;

		expect(root).toHaveAttribute("data-gate-theme", header.swatch.theme);
		expect(root).not.toHaveAttribute("data-screen-theme");
	});

	it("prices the room the build has not bought under the room it has", () => {
		render(<ShopScreen {...props} />);

		expect(screen.getAllByText("empty slot")).toHaveLength(2);
		expect(
			screen.getByRole("button", { name: "buy slot 11 · 120 KB · 24 KB short" })
		).toBeInTheDocument();
	});

	it("names the balance its offers are priced against", () => {
		render(<ShopScreen {...props} />);

		expect(screen.getByText("96 KB")).toBeInTheDocument();
		expect(screen.getByText("balance")).toBeInTheDocument();
	});

	it("reads as the shop of the gate it cleared, facing the gate ahead", () => {
		render(<ShopScreen {...props} />);

		expect(screen.getByText("Shop · cleared Volcano")).toBeInTheDocument();
		expect(
			screen.getByText("next gate 10 · Earth · to pass 250%")
		).toBeInTheDocument();
	});

	it("keeps the plan ladder in the build's own column", () => {
		render(<ShopScreen {...props} />);

		const heading = screen.getByRole("heading", { name: "Storage plan" });
		expect(heading.closest("div")).toContainElement(
			screen.getByText("Build").closest("section")
		);
		expect(
			screen.getByRole("list", { name: "storage plan rungs" })
		).toBeInTheDocument();
	});

	it("bills the held cap at the next clear", () => {
		render(<ShopScreen {...props} />);

		expect(screen.getByText("Your cap")).toBeInTheDocument();
		expect(screen.getByText("224 KB")).toBeInTheDocument();
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
