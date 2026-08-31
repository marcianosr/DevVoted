import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { AuditAlerts, Audits, type AuditRow } from "./Audits.ui";

const AUDITS: readonly AuditRow[] = [
	{ id: "strip", description: "a miss peels 5" },
	{ id: "mirrored", description: "pick every wrong option" },
	{ id: "flaky-build", description: "AGENTS.md missed poll 2" },
];

describe("Audits", () => {
	it("names every audit and what it does to this gate", () => {
		render(<Audits audits={AUDITS} defaultOpen />);

		expect(screen.getByText("Strip")).toBeInTheDocument();
		expect(screen.getByText("a miss peels 5")).toBeInTheDocument();
		expect(screen.getByText("Mirror")).toBeInTheDocument();
		expect(screen.getByText("Flaky Build")).toBeInTheDocument();
	});

	it("counts the audits actually running", () => {
		render(<Audits audits={AUDITS} />);

		expect(screen.getByText("3 running")).toBeInTheDocument();
	});

	// Struck through, never hidden: the fraud stays on the receipt (ADR-028).
	it("keeps a suppressed audit listed and out of the running count", () => {
		render(
			<Audits
				audits={[{ ...AUDITS[0], suppressed: true }, AUDITS[1]]}
				defaultOpen
			/>
		);

		expect(screen.getByText("1 running")).toBeInTheDocument();
		expect(screen.getByText("Strip")).toBeInTheDocument();
		expect(screen.getByText("reported passing")).toBeInTheDocument();
	});
});

describe("AuditAlerts", () => {
	it("gives every audit its own box, named with what it does here", () => {
		render(<AuditAlerts audits={AUDITS} />);

		expect(screen.getAllByRole("listitem")).toHaveLength(3);
		expect(screen.getByText("Strip")).toBeInTheDocument();
		expect(screen.getByText("a miss peels 5")).toBeInTheDocument();
	});

	it("wears the warning colour, so an audit reads as one before it is read", () => {
		render(<AuditAlerts audits={[AUDITS[0]]} />);

		expect(screen.getByRole("listitem")).toHaveClass("border-saffron/40");
		expect(screen.getByText("Strip")).toHaveClass("text-saffron");
	});

	// Struck through, never hidden: the fraud stays on the receipt (ADR-028).
	it("strikes a suppressed audit through rather than dropping its box", () => {
		render(<AuditAlerts audits={[{ ...AUDITS[0], suppressed: true }]} />);

		expect(screen.getByText("Strip")).toHaveClass("line-through");
		expect(screen.getByText("reported passing")).toBeInTheDocument();
	});

	it("says nothing at all on a clean gate", () => {
		const { container } = render(<AuditAlerts audits={[]} />);

		expect(container).toBeEmptyDOMElement();
	});
});
