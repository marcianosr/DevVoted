import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { ShopHeader } from "./ShopHeader.ui";

const props = {
	title: "Lavender shop",
	nextGate: "gate 4",
	storage: { balanceKb: 216 },
};

describe("ShopHeader", () => {
	it("wears the gate's name, since the shop belongs to the gate", () => {
		render(<ShopHeader {...props} />);

		expect(
			screen.getByRole("heading", { name: "Lavender shop" })
		).toBeInTheDocument();
		expect(screen.getByText("gate 4")).toHaveClass("text-theme");
	});

	it("carries the balance, and no bar to fill", () => {
		render(<ShopHeader {...props} />);

		expect(screen.getByText("216 KB")).toBeInTheDocument();
		expect(screen.getByText("balance")).toBeInTheDocument();
		expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
	});

	it("names no plan and no cap beside it", () => {
		render(<ShopHeader {...props} />);

		expect(screen.queryByText(/tier/i)).not.toBeInTheDocument();
		expect(screen.queryByText(/cap/i)).not.toBeInTheDocument();
	});

	it("offers no controls of its own — the header only reports", () => {
		render(<ShopHeader {...props} />);

		expect(screen.queryByRole("button")).not.toBeInTheDocument();
	});

	it("wears the gate's swatch beside its name, the way a gate header does", () => {
		const { container } = render(
			<ShopHeader
				title="Lavender shop"
				nextGate="gate 4"
				storage={{ balanceKb: 216 }}
			/>
		);

		expect(container.querySelector(".bg-theme")).toBeInTheDocument();
	});
});
