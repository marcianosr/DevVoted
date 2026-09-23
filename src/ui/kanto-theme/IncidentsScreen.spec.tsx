import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import {
	INCIDENTS_EMPTY,
	kantoIncidents,
	kantoIncidentsQuiet,
} from "~/test/kantoIncidents.factory";

import { IncidentsScreen } from "./IncidentsScreen.ui";

const rowOf = (sender: string) =>
	screen.getByText(sender).closest("[class*='ring-']");

describe("IncidentsScreen", () => {
	it("counts the day's incidents in its subtitle", () => {
		render(<IncidentsScreen {...kantoIncidents()} />);

		expect(
			screen.getByRole("heading", { name: "Incidents" })
		).toBeInTheDocument();
		expect(
			screen.getByText("4 incidents filed today · everyone's, newest first")
		).toBeInTheDocument();
	});

	it("names both parties, the audit and the gate it lands on", () => {
		render(<IncidentsScreen {...kantoIncidents()} />);

		expect(screen.getByText("Erika")).toBeInTheDocument();
		expect(screen.getByText("Koga")).toBeInTheDocument();
		expect(screen.getByText("408")).toBeInTheDocument();
		expect(screen.getByText("Request Timeout")).toBeInTheDocument();
		expect(screen.getByText("gate 9 · Volcano")).toBeInTheDocument();
	});

	it("badges every incident with where it stands", () => {
		render(<IncidentsScreen {...kantoIncidents()} />);

		for (const status of ["queued", "locked", "survived", "failed"])
			expect(screen.getByText(status)).toBeInTheDocument();
	});

	it("rings the rows the viewer fired or was hit by, and no others", () => {
		render(<IncidentsScreen {...kantoIncidents()} />);

		expect(rowOf("Misty")).not.toBeNull();
		expect(rowOf("Brock")).not.toBeNull();
		expect(rowOf("Erika")).toBeNull();
	});

	it("calls a quiet day a real outcome", () => {
		render(<IncidentsScreen {...kantoIncidentsQuiet()} />);

		expect(screen.getByText(INCIDENTS_EMPTY)).toBeInTheDocument();
		expect(
			screen.getByText("0 incidents filed today · everyone's, newest first")
		).toBeInTheDocument();
	});
});
