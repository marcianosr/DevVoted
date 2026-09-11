import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { planChangeFor } from "~/test/kantoPoll.factory";

import { PlanChange } from "./PlanChange.ui";

const FIGURES = [{ label: "cap", value: "2 MB → 1 MB" }] as const;

const props = {
	cap: "1 MB",
	prose: "Dropping a rung takes effect now.",
	figures: FIGURES,
};

describe("PlanChange", () => {
	it("names the plan being moved to, not the one being left", () => {
		render(<PlanChange {...props} direction="downgrade" />);

		expect(
			screen.getByRole("heading", { name: "Storage plan 1 MB" })
		).toBeInTheDocument();
	});

	it("calls a drop a drop", () => {
		render(<PlanChange {...props} direction="downgrade" />);

		expect(screen.getByText("downgrade")).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: "drop to 1 MB" })
		).toBeInTheDocument();
	});

	it("rents on the way up rather than buying", () => {
		render(<PlanChange {...props} direction="upgrade" cap="2 MB" />);

		expect(screen.getByText("upgrade")).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: "rent 2 MB" })
		).toBeInTheDocument();
	});

	it("cannot name one rung in its heading and another on its press", () => {
		render(<PlanChange {...props} direction="upgrade" cap="10 MB" />);

		expect(
			screen.getByRole("heading", { name: "Storage plan 10 MB" })
		).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: "rent 10 MB" })
		).toBeInTheDocument();
	});
});

describe("PlanChange against the engine", () => {
	it("reproduces the mock's ledger from the ladder", () => {
		render(<PlanChange {...planChangeFor(3, 2, 0)} />);

		expect(screen.getByText("downgrade")).toBeInTheDocument();
		expect(
			screen.getByRole("heading", { name: "Storage plan 1 MB" })
		).toBeInTheDocument();
		expect(screen.getByText("2 MB → 1 MB")).toBeInTheDocument();
		expect(screen.getByText("224 KB → 96 KB")).toBeInTheDocument();
		expect(screen.getByText("0 KB")).toBeInTheDocument();
	});

	it("counts nothing burnt in the ledger's own unit", () => {
		render(<PlanChange {...planChangeFor(3, 2, 0)} />);

		expect(screen.queryByText("0 B")).not.toBeInTheDocument();
	});

	it("burns whatever will not fit under the new cap", () => {
		render(<PlanChange {...planChangeFor(3, 2, 1536)} />);

		expect(screen.getByText("512 KB")).toBeInTheDocument();
	});

	it("reddens a burn only when there is one", () => {
		const { rerender } = render(<PlanChange {...planChangeFor(3, 2, 1536)} />);
		expect(screen.getByText("512 KB")).toHaveAttribute(
			"data-screen-theme",
			"cinnabar"
		);

		rerender(<PlanChange {...planChangeFor(3, 2, 0)} />);
		expect(screen.getByText("0 KB")).not.toHaveAttribute("data-screen-theme");
	});

	it("reads a climb as an upgrade without being told twice", () => {
		render(<PlanChange {...planChangeFor(2, 3, 512)} />);

		expect(screen.getByText("upgrade")).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: "rent 2 MB" })
		).toBeInTheDocument();
	});

	it("burns nothing on the way up", () => {
		render(<PlanChange {...planChangeFor(2, 3, 1024)} />);

		expect(screen.getByText("0 KB")).toBeInTheDocument();
	});
});
