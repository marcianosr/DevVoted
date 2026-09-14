import { describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import {
	createKantoRegistryProps,
	kantoRegistryOffers,
} from "~/test/kantoPoll.factory";

import { Registry } from "./Registry.ui";

const props = createKantoRegistryProps();

const rowOf = (name: string) =>
	screen
		.getByRole("button", { name: `About ${name}` })
		.closest<HTMLElement>(".rounded-lg");

const sentence = (text: string) =>
	screen.getByText((_, element) => element?.textContent === text);

describe("Registry", () => {
	it("counts its offers and prices a slot", () => {
		render(<Registry {...props} />);

		expect(screen.getByText("Registry")).toBeInTheDocument();
		expect(
			sentence(`${kantoRegistryOffers.length} offers · 32 KB a slot`)
		).toBeInTheDocument();
	});

	it.each(["Intellisense", "IndexedDB", ".ts", "Planning Poker", "Prefetch"])(
		"shows the %s offer it was dealt",
		(name) => {
			render(<Registry {...props} />);

			expect(rowOf(name)).toHaveTextContent(name);
		}
	);

	it("makes an affordable price the control that takes the offer", () => {
		render(<Registry {...props} />);

		expect(
			screen.getByRole("button", { name: /Install IndexedDB/ })
		).toBeInTheDocument();
	});

	it("leaves an unaffordable offer with a price but no press", () => {
		render(<Registry {...props} />);

		const row = rowOf("Intellisense");
		expect(row).not.toBeNull();
		if (row === null) return;

		expect(
			screen.queryByRole("button", { name: /Install Intellisense/ })
		).not.toBeInTheDocument();
		expect(within(row).getByText("128 KB")).toBeInTheDocument();
	});

	it("dims the row of an offer that cannot be taken", () => {
		render(<Registry {...props} />);

		expect(rowOf("Intellisense")).toHaveClass("opacity-60");
		expect(rowOf("IndexedDB")).not.toHaveClass("opacity-60");
	});

	it("shows an upgrade offer's price at rest rather than on hover", () => {
		const { container } = render(<Registry {...props} />);

		expect(container.querySelector(".group-hover\\/press\\:inline")).toBeNull();
	});

	it("lists offers alone, the controls being the screen's to place", () => {
		render(<Registry {...props} />);

		expect(screen.queryByText("Rebuild the registry")).not.toBeInTheDocument();
		expect(
			screen.queryByRole("heading", { name: "Registry control" })
		).not.toBeInTheDocument();
	});

	it("asks its parent which panel to open, holding no state itself", async () => {
		const onToggleInfo = vi.fn();
		render(<Registry {...props} onToggleInfo={onToggleInfo} />);

		await userEvent.click(
			screen.getByRole("button", { name: "About IndexedDB" })
		);

		expect(onToggleInfo).toHaveBeenCalledWith("IndexedDB");
	});
});
