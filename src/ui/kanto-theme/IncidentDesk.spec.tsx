import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { kantoIncidentDesk } from "~/test/kantoIncidentDesk.factory";

import { IncidentDesk } from "./IncidentDesk.ui";

describe("IncidentDesk", () => {
	it("names the incident on offer and what it does", () => {
		render(<IncidentDesk {...kantoIncidentDesk()} />);

		expect(screen.getByText("409")).toBeInTheDocument();
		expect(screen.getByText("Conflict")).toBeInTheDocument();
	});

	it("states how many rivals it could reach", () => {
		render(<IncidentDesk {...kantoIncidentDesk()} />);

		expect(screen.getByText("4 rivals have room")).toBeInTheDocument();
	});

	it("counts a lone rival in the singular", () => {
		render(<IncidentDesk {...kantoIncidentDesk({ rivalsInReach: 1 })} />);

		expect(screen.getByText("1 rival has room")).toBeInTheDocument();
	});

	it("buys the incident at its price", async () => {
		const onBuy = vi.fn();
		render(<IncidentDesk {...kantoIncidentDesk({ onBuy })} />);

		await userEvent.click(screen.getByRole("button", { name: /Buy/ }));

		expect(onBuy).toHaveBeenCalled();
	});

	it("warns which held incident a purchase would discard", () => {
		render(<IncidentDesk {...kantoIncidentDesk({ heldAudit: "not-found" })} />);

		expect(screen.getByRole("button", { name: /Replace held/ })).toBeVisible();
		expect(
			screen.getByText("Your held 404 Not Found will be discarded.")
		).toBeInTheDocument();
	});

	it("says nothing about discarding when the hand is empty", () => {
		render(<IncidentDesk {...kantoIncidentDesk()} />);

		expect(screen.queryByText(/will be discarded/)).not.toBeInTheDocument();
	});

	it("refuses the buy when no rival could take it", () => {
		render(<IncidentDesk {...kantoIncidentDesk({ rivalsInReach: 0 })} />);

		expect(screen.getByRole("button", { name: /Buy/ })).toBeDisabled();
		expect(screen.getAllByText("nobody in reach").length).toBeGreaterThan(0);
	});

	it("refuses the buy while the balance is short, naming the shortfall", () => {
		render(<IncidentDesk {...kantoIncidentDesk({ balanceKb: 8 })} />);

		expect(screen.getByRole("button", { name: /Buy/ })).toBeDisabled();
		expect(screen.getByText("24 KB short")).toBeInTheDocument();
	});

	it("refuses both presses while the shop is read-only", () => {
		render(<IncidentDesk {...kantoIncidentDesk({ shopLocked: true })} />);

		expect(screen.getByRole("button", { name: /Buy/ })).toBeDisabled();
		expect(screen.getByRole("button", { name: /Refresh/ })).toBeDisabled();
	});

	it("deals another incident, and shows the ladder its price climbs", async () => {
		const onRefresh = vi.fn();
		render(<IncidentDesk {...kantoIncidentDesk({ onRefresh })} />);

		await userEvent.click(screen.getByRole("button", { name: /Refresh/ }));

		expect(onRefresh).toHaveBeenCalled();
		expect(
			screen.getByText("deals another incident · doubles this shop")
		).toBeInTheDocument();
		for (const rung of ["8 KB", "16 KB", "32 KB", "64 KB"])
			expect(screen.getAllByText(rung).length).toBeGreaterThan(0);
	});
});
