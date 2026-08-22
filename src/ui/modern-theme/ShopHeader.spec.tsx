import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { ShopHeader } from "./ShopHeader.ui";

const props = {
	title: "Lavender shop",
	nextGate: "gate 4",
	storage: { plan: "Free tier", used: 216, cap: 512 },
};

describe("ShopHeader", () => {
	it("wears the gate's name, since the shop belongs to the gate", () => {
		render(<ShopHeader {...props} />);

		expect(
			screen.getByRole("heading", { name: "Lavender shop" })
		).toBeInTheDocument();
		expect(screen.getByText("gate 4")).toHaveClass("text-theme");
	});

	it("carries the storage plan and its bar, not a hand-written total", () => {
		render(<ShopHeader {...props} />);

		expect(screen.getByText("Free tier")).toBeInTheDocument();
		expect(screen.getByRole("progressbar")).toHaveAttribute(
			"aria-valuemax",
			"512"
		);
	});

	it("says nothing about the cap when there is no overflow to lose", () => {
		render(<ShopHeader {...props} />);

		expect(screen.queryByText(/clamps/)).not.toBeInTheDocument();
	});

	it("offers no controls of its own — the header only reports", () => {
		render(<ShopHeader {...props} />);

		expect(screen.queryByRole("button")).not.toBeInTheDocument();
	});
});
