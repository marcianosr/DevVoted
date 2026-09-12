import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { planChangeFor } from "~/test/kantoPoll.factory";

import { PlanChange } from "./PlanChange.ui";

const FIGURES = [{ label: "free weight", value: "4 → 8" }] as const;

const props = {
	weight: "8",
	prose: "Bought once, and it lasts the run.",
	figures: FIGURES,
};

describe("PlanChange", () => {
	it("names the free weight being moved to, not the one being left", () => {
		render(<PlanChange {...props} />);

		expect(
			screen.getByRole("heading", { name: "Free weight 8" })
		).toBeInTheDocument();
	});

	it("carries rather than rents, because the purchase is a one-off", () => {
		render(<PlanChange {...props} />);

		expect(screen.getByText("upgrade")).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: "carry 8 free" })
		).toBeInTheDocument();
	});

	it("cannot name one rung in its heading and another on its press", () => {
		render(<PlanChange {...props} weight="16" />);

		expect(
			screen.getByRole("heading", { name: "Free weight 16" })
		).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: "carry 16 free" })
		).toBeInTheDocument();
	});
});

describe("PlanChange against its fixture", () => {
	it("reads the climb out of the ladder", () => {
		render(<PlanChange {...planChangeFor(0, 1, 512)} />);

		expect(
			screen.getByRole("heading", { name: "Free weight 8" })
		).toBeInTheDocument();
		expect(screen.getByText("4 → 8")).toBeInTheDocument();
	});

	it("prices the rung and names what the run holds against it", () => {
		render(<PlanChange {...planChangeFor(0, 1, 512)} />);

		expect(screen.getByText("256 KB")).toBeInTheDocument();
		expect(screen.getByText("512 KB")).toBeInTheDocument();
	});

	it("reddens the cost, since it leaves the balance", () => {
		render(<PlanChange {...planChangeFor(0, 1, 512)} />);

		expect(
			screen.getByText("256 KB").closest("[data-screen-theme]")
		).toHaveAttribute("data-screen-theme", "cinnabar");
	});

	it("climbs two rungs as readily as one, naming both ends", () => {
		render(<PlanChange {...planChangeFor(0, 2, 1024)} />);

		expect(screen.getByText("4 → 12")).toBeInTheDocument();
		expect(screen.getByText("768 KB")).toBeInTheDocument();
	});
});
