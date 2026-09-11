import { describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import {
	GATE_REVIEW_LABEL,
	holdTallyOf,
	kantoGateAnswers,
	kantoGateHold,
	kantoGateHoldAt,
	kantoGateHoldBuild,
	kantoGateHoldCollected,
	kantoGateHoldDemandSlots,
	kantoGateHoldExact,
	kantoGateHoldOpen,
	kantoGateHoldOccupiedSlots,
	kantoGateHoldOver,
	kantoGateHoldShort,
	kantoGateHoldSlotSizes,
} from "~/test/kantoGate.factory";

import { GateHoldScreen } from "./GateHoldScreen.ui";

const props = kantoGateHold();

const panelOf = (title: string) =>
	screen.getByRole("heading", { name: title }).closest("details");

const dropBand = () =>
	screen
		.getByRole("heading", { name: "Drop configs to pay the peel" })
		.closest("section");

describe("GateHoldScreen", () => {
	it("names the gate that held the run, not a gate that was earned", () => {
		render(<GateHoldScreen {...props} />);

		expect(
			screen.getByRole("heading", { name: "Lavender holds" })
		).toBeInTheDocument();
		expect(screen.getByText(/the meter fell short/)).toBeInTheDocument();
	});

	it("wears the colour of the gate that held it", () => {
		const { container } = render(<GateHoldScreen {...props} />);

		expect(container.firstElementChild).toHaveAttribute(
			"data-gate-theme",
			"lavender"
		);
	});

	it("leaves the gate's swatch dashed, since a miss earns nothing", () => {
		const { container } = render(<GateHoldScreen {...props} />);

		expect(
			container.querySelector('[data-swatch-theme="lavender"]')
		).toHaveClass("border-dashed");
	});

	it("prices the toll in slots and in a cost colour, not the gate's own", () => {
		render(<GateHoldScreen {...props} />);

		const toll = within(
			screen.getByRole("heading", { name: "Lavender holds" }).closest("header")!
		).getByText("3 slots");

		expect(toll).toHaveClass("text-theme", "tabular-nums");
		expect(toll.closest("[data-screen-theme]")).toHaveAttribute(
			"data-screen-theme",
			"cinnabar"
		);
		expect(screen.getByText("of 12 slots to free")).toBeInTheDocument();
	});

	it("states the demand alone until something is chosen", () => {
		render(<GateHoldScreen {...props} />);

		expect(within(dropBand()!).getByText("3 slots")).toBeInTheDocument();
	});

	it("counts the chosen slots against the demand while the peel is short", () => {
		render(<GateHoldScreen {...kantoGateHoldShort()} />);

		expect(
			within(dropBand()!).getByText("3 slots · 1 chosen")
		).toBeInTheDocument();
	});

	it("says nothing about overpaying when the selection lands exactly", () => {
		render(<GateHoldScreen {...kantoGateHoldExact()} />);

		expect(
			within(dropBand()!).getByText("3 slots · 3 chosen")
		).toBeInTheDocument();
	});

	it("names the wasted slot when the selection overshoots the demand", () => {
		render(<GateHoldScreen {...kantoGateHoldOver()} />);

		expect(
			within(dropBand()!).getByText("3 slots · 4 chosen · 1 over")
		).toBeInTheDocument();
	});

	it("refuses the drop while the peel is short, naming what is still owed", () => {
		render(<GateHoldScreen {...kantoGateHoldShort()} />);

		expect(
			screen.getByRole("button", { name: "Free 2 more slots" })
		).toBeDisabled();
		expect(
			screen.getByText("The gate stays shut until the peel is paid in full.")
		).toBeInTheDocument();
	});

	it("lets the drop through once the demand is covered", () => {
		render(<GateHoldScreen {...kantoGateHoldExact()} />);

		expect(
			screen.getByRole("button", { name: "Drop 2 configs →" })
		).toBeEnabled();
		expect(
			screen.queryByText("The gate stays shut until the peel is paid in full.")
		).not.toBeInTheDocument();
	});

	it("strikes through a config that is going, so the loss reads before it lands", () => {
		render(<GateHoldScreen {...kantoGateHoldOver()} />);

		expect(within(dropBand()!).getByText("Cache")).toHaveClass("line-through");
		expect(within(dropBand()!).getByText("Deprecated")).not.toHaveClass(
			"line-through"
		);
	});

	it("arms the badge of a config already chosen, and offers the rest", () => {
		render(<GateHoldScreen {...kantoGateHoldOver()} />);

		expect(screen.getByRole("button", { name: "Keep Cache" })).toHaveAttribute(
			"aria-pressed",
			"true"
		);
		expect(
			screen.getByRole("button", { name: "Drop Deprecated" })
		).toBeInTheDocument();
	});

	it("toggles a config through the handler it was given", async () => {
		const onToggle = vi.fn();

		render(
			<GateHoldScreen
				{...kantoGateHoldAt({
					gate: 4,
					answers: kantoGateAnswers,
					balanceBeforeKb: 102,
					configs: kantoGateHoldBuild,
					onToggle,
				})}
			/>
		);

		await userEvent.click(screen.getByRole("button", { name: "Drop Cache" }));

		expect(onToggle).toHaveBeenCalledWith("cache");
	});

	it("warns that a drop refunds nothing when no collector is installed", () => {
		render(<GateHoldScreen {...props} />);

		expect(
			within(dropBand()!).getByText(
				"Drops refund nothing. Whatever you overpay is simply gone."
			)
		).toBeInTheDocument();
		expect(
			within(panelOf("Storage bonus")!).getByText("nothing paid")
		).toHaveAttribute("data-screen-theme", "saffron");
	});

	it("quotes each config's refund when Garbage Collection is installed", () => {
		render(<GateHoldScreen {...kantoGateHoldCollected()} />);

		expect(
			within(dropBand()!).getByText(/Garbage Collection is installed/)
		).toBeInTheDocument();
		expect(
			within(panelOf("Storage bonus")!).getByText("peel refund")
		).toBeInTheDocument();
	});

	it("says the gate was not paid for, above whatever the window earned", () => {
		render(<GateHoldScreen {...kantoGateHoldOpen()} />);

		const storage = within(panelOf("Storage bonus")!);

		expect(storage.getByText("not paid")).toHaveClass("text-theme-muted");
		expect(storage.getByText("correct answers")).toBeInTheDocument();
		expect(storage.getByText("balance")).toHaveClass("font-bold");
	});

	it("prices the shortfall against the gate's own demand", () => {
		render(<GateHoldScreen {...kantoGateHoldOpen()} />);

		expect(
			within(panelOf("Coverage by category")!).getByText("of 60% needed")
		).toBeInTheDocument();
		expect(screen.getByText("short by 9.4%")).toHaveAttribute(
			"data-screen-theme",
			"cinnabar"
		);
	});

	it("keeps the drop band out of a fold, since paying is the screen's work", () => {
		const { container } = render(<GateHoldScreen {...props} />);

		expect(container.querySelectorAll("details")).toHaveLength(2);
		expect(dropBand()!.closest("details")).toBeNull();
	});

	it("reads the debrief before the bill, and the bill before the footer", () => {
		const { container } = render(<GateHoldScreen {...props} />);

		const body = container.querySelector("section > div");
		const order = [...body!.children].map((child) =>
			child.tagName.toLowerCase()
		);

		expect(order).toEqual(["header", "div", "div", "section", "footer"]);
	});

	it("omits the audit band entirely when no audit fired", () => {
		const { container } = render(
			<GateHoldScreen
				{...kantoGateHoldAt({
					gate: 4,
					answers: kantoGateAnswers,
					balanceBeforeKb: 102,
					configs: kantoGateHoldBuild,
				})}
			/>
		);

		const body = container.querySelector("section > div");
		const order = [...body!.children].map((child) =>
			child.tagName.toLowerCase()
		);

		expect(order).toEqual(["header", "div", "section", "footer"]);
	});

	it("offers the answers for review without leaving the hold", () => {
		render(<GateHoldScreen {...props} />);

		expect(
			screen.getByRole("button", { name: GATE_REVIEW_LABEL })
		).toBeInTheDocument();
	});
});

describe("holdTallyOf", () => {
	it("names only the demand when nothing is chosen yet", () => {
		expect(holdTallyOf(3, 0)).toBe("3 slots");
	});

	it("counts the chosen slots while they fall short", () => {
		expect(holdTallyOf(3, 2)).toBe("3 slots · 2 chosen");
	});

	it("stays quiet about waste when the sum lands exactly", () => {
		expect(holdTallyOf(3, 3)).toBe("3 slots · 3 chosen");
	});

	it("names the remainder when the sum overshoots", () => {
		expect(holdTallyOf(3, 4)).toBe("3 slots · 4 chosen · 1 over");
	});

	it("speaks of one slot in the singular", () => {
		expect(holdTallyOf(1, 0)).toBe("1 slot");
	});
});

describe("the hold fixture's build", () => {
	it("cannot pay its peel exactly, which is the whole tension", () => {
		const sums = kantoGateHoldSlotSizes.flatMap((size, index) => [
			size,
			...kantoGateHoldSlotSizes.slice(index + 1).map((other) => size + other),
		]);

		expect(kantoGateHoldOccupiedSlots).toBe(12);
		expect(kantoGateHoldDemandSlots).toBe(3);
		expect(sums).not.toContain(kantoGateHoldDemandSlots);
	});
});
