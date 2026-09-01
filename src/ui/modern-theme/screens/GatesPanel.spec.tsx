import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";

import { GatesPanel, type DexGate } from "./GatesPanel.ui";

const gate = (over: Partial<DexGate> = {}): DexGate => ({
	number: 0,
	name: "Pallet",
	theme: "pallet",
	coverage: 3,
	peels: 1,
	audits: [],
	unlocks: ["shop"],
	state: "locked",
	...over,
});

describe("GatesPanel", () => {
	it("draws one row per gate", () => {
		render(
			<GatesPanel gates={[gate(), gate({ number: 1, name: "Boulder" })]} />
		);

		expect(screen.getAllByRole("listitem")).toHaveLength(2 + 4);
	});

	it("writes the peel count as a loss, with a minus sign not a hyphen", () => {
		render(<GatesPanel gates={[gate({ peels: 2 })]} />);

		expect(screen.getByText("−2")).toBeInTheDocument();
	});

	it("reddens only the peel counts an audit inflated", () => {
		render(
			<GatesPanel
				gates={[
					gate({ peels: 3 }),
					gate({ number: 11, name: "Elite", peels: 5, peelsAudited: true }),
				]}
			/>
		);

		expect(screen.getByText("−3")).toHaveClass("text-zinc-400");
		expect(screen.getByText("−5")).toHaveClass("text-cinnabar");
	});

	it("says where you are on the ladder, and stays quiet about the rest", () => {
		render(
			<GatesPanel
				gates={[
					gate({ state: "cleared" }),
					gate({ number: 1, name: "Boulder", state: "next" }),
					gate({ number: 2, name: "Cascade", state: "locked" }),
				]}
			/>
		);

		expect(screen.getByText("cleared")).toBeInTheDocument();
		expect(screen.getByText("next")).toBeInTheDocument();
		expect(screen.queryByText("locked")).toBeNull();
	});

	it("washes the row you have beaten and rings the one you are on", () => {
		render(
			<GatesPanel
				gates={[
					gate({ state: "cleared" }),
					gate({ number: 1, name: "Boulder", state: "next" }),
				]}
			/>
		);
		const [cleared, next] = screen.getAllByRole("listitem");

		expect(cleared).toHaveClass("bg-celadon/5");
		expect(next).toHaveClass("outline-edge-strong");
	});

	it("tells an audit from an unlock by colour, the way the key says", () => {
		render(
			<GatesPanel
				gates={[
					gate({ audits: ["300 Multiple Choices"], unlocks: ["slot 10"] }),
				]}
			/>
		);

		expect(screen.getByText("300 Multiple Choices").parentElement).toHaveClass(
			"bg-saffron/15"
		);
		expect(screen.getByText("slot 10").parentElement).toHaveClass(
			"bg-zinc-100/10"
		);
	});

	it("marks the gate that ends the run rather than opening anything", () => {
		render(
			<GatesPanel
				gates={[
					gate({
						number: 12,
						name: "Champion",
						unlocks: [],
						wins: true,
					}),
				]}
			/>
		);

		expect(screen.getByText("wins the run").parentElement).toHaveClass(
			"bg-celadon/15"
		);
	});

	it("keys the two colours a row uses, and the two columns it does not", () => {
		render(<GatesPanel gates={[gate()]} />);
		const keys = screen.getAllByRole("list")[1];

		expect(
			within(keys)
				.getAllByRole("listitem")
				.map((item) => item.textContent)
		).toEqual(["coverage needed", "configs a miss peels", "audit", "unlock"]);
	});
});
