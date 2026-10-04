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

		expect(screen.getAllByText(first.sentBy.name).length).toBeGreaterThan(0);
		expect(screen.getAllByText(first.target.name).length).toBeGreaterThan(0);
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

	it("draws both parties' faces, each a way into their profile", () => {
		render(<IncidentsPanel {...kantoIncidents()} />);

		expect(
			screen.getByRole("link", { name: "Erika's profile" })
		).toHaveAttribute("href", "/profile/erika");
		expect(
			screen.getByRole("link", { name: "Koga's profile" })
		).toHaveAttribute("href", "/profile/koga");
	});

	it("states the day's count under the heading, left-aligned, not wrapped at the right", () => {
		render(<IncidentsPanel {...kantoIncidents()} />);

		expect(screen.getByText(kantoIncidents().summary)).toHaveClass(
			"basis-full"
		);
	});

	it("calls a quiet day an outcome rather than drawing an empty list", () => {
		const quiet = kantoIncidentsQuiet();
		const { container } = render(<IncidentsPanel {...quiet} />);

		expect(container.querySelector("header")).toHaveTextContent(quiet.empty);
		expect(screen.getByText(quiet.empty)).toHaveClass("basis-full");
		expect(container.querySelector("section")?.children).toHaveLength(1);
		expect(within(container).queryByText("survived")).toBeNull();
	});
});
