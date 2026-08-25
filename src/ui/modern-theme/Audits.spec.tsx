import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { Audits, type AuditRow } from "./Audits.ui";

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
