import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import type { PlanProps } from "./Plan.ui";
import { StoragePlan } from "./StoragePlan.ui";

const PLANS: readonly PlanProps[] = [
	{
		id: "tier-1",
		name: "storage-plan",
		cap: "512 KB",
		terms: "free",
		free: true,
		figure: "296 free now",
		selected: true,
		onSelect: () => {},
	},
	{
		id: "tier-2",
		name: "storage-plan",
		cap: "640 KB",
		terms: "8 KB / gate",
		figure: "+128",
		selected: false,
		onSelect: () => {},
	},
	{ id: "tier-5", locked: true, opensAt: "opens when gate 6 clears" },
];

describe("StoragePlan", () => {
	it("lists every rung, with the plan in force already picked", () => {
		render(<StoragePlan plans={PLANS} nextBillKb={0} />);

		expect(
			screen.getByRole("radio", { name: "512 KB free 296 free now" })
		).toBeChecked();
		expect(
			screen.getByRole("radio", { name: "640 KB 8 KB / gate +128" })
		).not.toBeChecked();
	});

	it("shows the sealed rung without naming what it is", () => {
		render(<StoragePlan plans={PLANS} nextBillKb={0} />);

		expect(screen.getByText("???")).toBeInTheDocument();
		expect(screen.getByText("opens when gate 6 clears")).toBeInTheDocument();
		expect(screen.getAllByRole("radio")).toHaveLength(2);
	});

	it("says the bill lands whether the gate clears or not", () => {
		render(<StoragePlan plans={PLANS} nextBillKb={0} />);

		expect(
			screen.getByText("billed every window, pass or fail")
		).toBeInTheDocument();
		expect(screen.getByText(/Switching is free/)).toBeInTheDocument();
	});

	it("states what the coming gate charges", () => {
		render(<StoragePlan plans={PLANS} nextBillKb={16} />);

		expect(screen.getByText("next gate bills")).toBeInTheDocument();
		expect(screen.getByText("16 KB")).toBeInTheDocument();
	});

	// A free plan bills nothing, and nothing is not news.
	it("mutes a bill of zero", () => {
		render(<StoragePlan plans={PLANS} nextBillKb={0} />);

		expect(screen.getByText("0 KB")).toHaveClass("text-zinc-400");
	});
});
