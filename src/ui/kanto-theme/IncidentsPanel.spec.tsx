import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";

import {
	kantoIncidents,
	kantoIncidentsQuiet,
} from "~/test/kantoIncidents.factory";

import { IncidentsPanel } from "./IncidentsPanel.ui";

describe("IncidentsPanel", () => {
	it("counts the day's filings beside its heading", () => {
		render(<IncidentsPanel {...kantoIncidents()} />);

		expect(
			screen.getByRole("heading", { name: "Incidents" })
		).toBeInTheDocument();
		expect(screen.getByText(/filed today/)).toBeInTheDocument();
	});

	it("names who fired at whom, and where the audit lands", () => {
		render(<IncidentsPanel {...kantoIncidents()} />);

		const first = kantoIncidents().rows[0]!;

		expect(screen.getAllByText(first.sentBy).length).toBeGreaterThan(0);
		expect(screen.getAllByText(first.target).length).toBeGreaterThan(0);
		expect(screen.getAllByText(first.gate).length).toBeGreaterThan(0);
	});

	it("badges each filing with where it stands", () => {
		render(<IncidentsPanel {...kantoIncidents()} />);

		expect(screen.getAllByText("survived").length).toBeGreaterThan(0);
	});

	it("rings the rows the viewer is a party to", () => {
		const { container } = render(<IncidentsPanel {...kantoIncidents()} />);

		expect(container.querySelectorAll(".ring-theme-soft").length).toBe(
			kantoIncidents().rows.filter((row) => row.own === true).length
		);
	});

	it("calls a quiet day an outcome rather than drawing an empty list", () => {
		const quiet = kantoIncidentsQuiet();
		const { container } = render(<IncidentsPanel {...quiet} />);

		expect(screen.getByText(quiet.empty)).toBeInTheDocument();
		expect(within(container).queryByText("survived")).toBeNull();
	});
});
