import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import {
	createKantoRegistryProps,
	kantoRegistryOffers,
	kantoUpgradeOffer,
} from "~/test/kantoPoll.factory";

import { Registry } from "./Registry.ui";

const props = createKantoRegistryProps();

const chipOf = (name: string) =>
	document.querySelector<HTMLElement>(`[data-config="${name}"]`);

const sentence = (text: string) =>
	screen.getByText((_, element) => element?.textContent === text);

describe("Registry", () => {
	it("counts its offers and prices a slot", () => {
		render(<Registry {...props} />);

		expect(screen.getByText("Registry")).toBeInTheDocument();
		expect(
			sentence(`${kantoRegistryOffers.length} offers · 32 KB`)
		).toBeInTheDocument();
	});

	it("badges the slot price whether or not it reads as a figure", () => {
		const { unmount } = render(<Registry {...props} slotPrice="12 MB" />);
		expect(screen.getByText("12 MB")).toHaveClass("badge-theme");
		unmount();

		render(<Registry {...props} slotPrice="free" />);
		expect(screen.getByText("free")).toHaveClass("badge-theme");
	});

	it.each(["Intellisense", "IndexedDB", ".ts", "Planning Poker", "Prefetch"])(
		"shows the %s offer it was dealt",
		(name) => {
			render(<Registry {...props} />);

			expect(chipOf(name)).toHaveTextContent(name);
		}
	);

	it("grids the offers, an offer filling its cell rather than sizing itself", () => {
		render(<Registry {...props} />);

		const offer = chipOf("IndexedDB");
		expect(offer).toHaveClass("w-full");
		expect(offer?.closest(".grid")).not.toBeNull();
	});

	it("flows as many offers to a row as fit, never below a head's width", () => {
		render(<Registry {...props} />);

		const list = chipOf("IndexedDB")?.closest(".grid");

		// auto-fill, not auto-fit: a half-filled row keeps its empty tracks
		// instead of stretching two cards across the whole panel.
		expect(list?.className).toContain(
			"grid-cols-[repeat(auto-fill,minmax(20rem,1fr))]"
		);
	});

	it("lets a shut card keep its own height beside an open one", () => {
		render(<Registry {...props} />);

		// Without this a grid row stretches every cell to the tallest in it, and a
		// collapsed card reads as one with its body missing.
		expect(chipOf("IndexedDB")?.closest(".grid")).toHaveClass("items-start");
	});

	it("names every offer at the head of its card, whatever the panel's width", () => {
		render(<Registry {...props} />);

		for (const offer of kantoRegistryOffers) {
			expect(chipOf(offer.name ?? "")).toHaveTextContent(offer.name ?? "");
		}
	});

	it("makes an affordable price the control that takes the offer", () => {
		render(<Registry {...props} />);

		expect(
			screen.getByRole("button", { name: /Install IndexedDB/ })
		).toBeInTheDocument();
	});

	it("refuses an unaffordable offer while still naming its price", () => {
		render(<Registry {...props} />);

		const install = screen.getByRole("button", {
			name: "Install Intellisense \u00b7 128 KB",
		});

		expect(install).toBeDisabled();
		expect(install).toHaveTextContent("Install \u00b7 128 KB");
	});

	it("dims the chip of an offer that cannot be taken", () => {
		render(<Registry {...props} />);

		expect(chipOf("Intellisense")).toHaveClass("opacity-60");
		expect(chipOf("IndexedDB")).not.toHaveClass("opacity-60");
	});

	it("shows an upgrade offer's price at rest rather than on hover", () => {
		const { container } = render(<Registry {...props} />);

		expect(container.querySelector(".group-hover\\/press\\:inline")).toBeNull();
	});

	it("names a rolled upgrade's press by the version on offer and the registry price", () => {
		render(<Registry {...props} />);

		expect(
			screen.getByRole("button", { name: "Upgrade .ts to v3 \u00b7 32 KB" })
		).toBeInTheDocument();
	});

	it("asks its parent to open the upgrade panel the press belongs to", async () => {
		const onToggleUpgrades = vi.fn();
		render(<Registry {...props} onToggleUpgrades={onToggleUpgrades} />);

		await userEvent.click(
			screen.getByRole("button", { name: /Upgrade \.ts to v3/ })
		);

		expect(onToggleUpgrades).toHaveBeenCalledWith(".ts");
	});

	it("reaches the Buy press once the upgrade panel is open", async () => {
		const onBuy = vi.fn();
		render(
			<Registry
				{...props}
				offers={[kantoUpgradeOffer(onBuy)]}
				openUpgrades=".ts"
			/>
		);

		await userEvent.click(
			screen.getByRole("button", { name: "Buy v3 \u00b7 32 KB" })
		);

		expect(onBuy).toHaveBeenCalledOnce();
	});

	it("states the odds the roll landed on beside the version, at rest", () => {
		render(<Registry {...props} />);

		expect(chipOf(".ts")).toHaveTextContent("1 in 4 rolls");
	});

	it("lists offers alone, the controls being the screen's to place", () => {
		render(<Registry {...props} />);

		expect(screen.queryByText("Rebuild the registry")).not.toBeInTheDocument();
		expect(
			screen.queryByRole("heading", { name: "Registry control" })
		).not.toBeInTheDocument();
	});

	it("asks its parent which card was flipped, holding no state itself", async () => {
		const onToggleInfo = vi.fn();
		render(<Registry {...props} onToggleInfo={onToggleInfo} />);

		await userEvent.click(
			screen.getByRole("button", { name: /(Expand|Collapse) IndexedDB/ })
		);

		expect(onToggleInfo).toHaveBeenCalledWith("IndexedDB");
	});
});
