import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { dexAuditsProps } from "~/test/dexRegistry.factory";

import { DexAudits, gatesLabelOf } from "./DexAudits.ui";

describe("gatesLabelOf", () => {
	it("names a single gate", () => {
		expect(gatesLabelOf([3])).toBe("gate 3");
	});

	it("names a span by its ends", () => {
		expect(gatesLabelOf([8, 9, 10])).toBe("gates 8–10");
	});

	it("reports nothing when an audit lands nowhere certain", () => {
		expect(gatesLabelOf([])).toBe("—");
	});
});

describe("DexAudits", () => {
	it("names the collection and counts what has been met", () => {
		render(<DexAudits {...dexAuditsProps()} />);

		expect(screen.getByRole("heading", { name: "audits" })).toBeVisible();
		expect(screen.getByText("7 of 16")).toBeVisible();
	});

	it("shows a met audit's code, name and rule", () => {
		render(<DexAudits {...dexAuditsProps()} />);

		expect(screen.getByText("402")).toBeVisible();
		expect(screen.getByText("Payment Required")).toBeVisible();
		expect(
			screen.getByText("paid actions cost double this gate")
		).toBeVisible();
	});

	it("withholds an unmet audit, code included", () => {
		render(<DexAudits {...dexAuditsProps()} />);

		expect(screen.getByText("Locked audit")).toBeInTheDocument();
		expect(screen.queryByText("451")).not.toBeInTheDocument();
	});

	it("says where a rule can land rather than how often it has fired", () => {
		render(<DexAudits {...dexAuditsProps()} />);

		expect(screen.getByText("gates 8–10")).toBeVisible();
		expect(screen.queryByText(/fired/)).not.toBeInTheDocument();
	});
});
