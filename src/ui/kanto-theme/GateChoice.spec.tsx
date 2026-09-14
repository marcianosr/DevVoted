import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";

import {
	BRIBE_LABEL,
	REFUSAL_LABEL,
	kantoGatePeelBillKb,
	kantoGateOutcomeSellValues,
	kantoGateShaky,
	kantoGateShakyCollected,
	kantoGateShakyFunded,
	kantoGateShakyPaid,
	kantoGateShakyPicking,
	peelTallyOf,
} from "~/test/kantoGate.factory";

import { GateChoice, type GateChoiceProps } from "./GateChoice.ui";

const choiceIn = (props: { tail?: { choice?: GateChoiceProps } }) =>
	props.tail!.choice!;

const armOf = (title: string): HTMLElement => {
	const arm = screen
		.getByRole("heading", { name: title })
		.closest<HTMLElement>("section");

	if (arm === null) throw new Error(`"${title}" heads no arm`);

	return arm;
};

describe("GateChoice", () => {
	it("names both exits under one heading, so neither reads as the only move", () => {
		render(<GateChoice {...choiceIn(kantoGateShaky())} />);

		expect(
			screen.getByRole("heading", { name: "How this gate ends" })
		).toBeInTheDocument();
		expect(
			screen.getByRole("heading", { name: "Retry gate 4" })
		).toBeInTheDocument();
		expect(
			screen.getByRole("heading", { name: "End the run here" })
		).toBeInTheDocument();
	});

	it("prices the retry as a debt, in the colour a debt wears", () => {
		render(<GateChoice {...choiceIn(kantoGateShaky())} />);

		expect(screen.getByText("48 KB still owed")).toHaveAttribute(
			"data-screen-theme",
			"cinnabar"
		);
	});

	it("prices refusing the gate in what it banks, not in what it costs", () => {
		render(<GateChoice {...choiceIn(kantoGateShaky())} />);

		expect(
			within(armOf("End the run here")).getByText(/banks 4 of 13/)
		).toBeInTheDocument();
	});

	it("lets the player walk away whatever the peel stands at", () => {
		render(<GateChoice {...choiceIn(kantoGateShaky())} />);

		expect(screen.getByRole("button", { name: REFUSAL_LABEL })).toBeEnabled();
	});

	describe("the bribe", () => {
		it("refuses itself when the archive falls short, and says by how much", () => {
			render(<GateChoice {...choiceIn(kantoGateShaky())} />);

			expect(
				screen.getByRole("button", { name: `${BRIBE_LABEL} · short 20 KB` })
			).toBeDisabled();
		});

		it("goes live once the archive covers what is left", () => {
			render(<GateChoice {...choiceIn(kantoGateShakyFunded())} />);

			expect(screen.getByRole("button", { name: BRIBE_LABEL })).toBeEnabled();
		});

		it("states the balance it would spend, not the bill", () => {
			render(<GateChoice {...choiceIn(kantoGateShaky())} />);

			expect(
				screen.getByRole("button", { name: `${BRIBE_LABEL} · short 20 KB` })
			).toHaveTextContent("28 KB");
		});
	});

	describe("dropping configs", () => {
		it("prices every config in what dropping it settles", () => {
			render(<GateChoice {...choiceIn(kantoGateShaky())} />);

			for (const value of kantoGateOutcomeSellValues) {
				expect(screen.getAllByText(`${value} KB`).length).toBeGreaterThan(0);
			}
		});

		it("warns that the overpay is gone when nothing collects it", () => {
			render(<GateChoice {...choiceIn(kantoGateShaky())} />);

			expect(screen.getByText(/refunds nothing/)).toBeInTheDocument();
		});

		it("says a drop pays twice when Garbage Collection is installed", () => {
			render(<GateChoice {...choiceIn(kantoGateShakyCollected())} />);

			expect(
				screen.getByText(/Garbage Collection is installed/)
			).toBeInTheDocument();
		});
	});
});

describe("peelTallyOf", () => {
	it("names the whole bill while nothing is chosen", () => {
		expect(peelTallyOf(48, 0)).toBe("48 KB still owed");
	});

	it("counts down what is left rather than restating the bill", () => {
		expect(peelTallyOf(48, 32)).toBe("16 KB still owed · 32 KB chosen");
	});

	it("says the peel is settled when the choice lands exactly", () => {
		expect(peelTallyOf(48, 48)).toBe("the peel is settled");
	});

	it("names the overshoot, since the remainder is simply gone", () => {
		expect(peelTallyOf(48, 64)).toBe("the peel is settled · 16 KB over");
	});
});

describe("the outcome fixture's build", () => {
	it("cannot settle its peel exactly, which is the whole tension", () => {
		const sums = kantoGateOutcomeSellValues.flatMap((value, index) => [
			value,
			...kantoGateOutcomeSellValues
				.slice(index + 1)
				.map((other) => value + other),
		]);

		expect(kantoGatePeelBillKb).toBe(48);
		expect(sums).not.toContain(kantoGatePeelBillKb);
	});

	it("settles the bill from the archive alone once the balance is there", () => {
		const funded = choiceIn(kantoGateShakyFunded());
		const broke = choiceIn(kantoGateShaky());

		expect(funded.peel.bribe.shortfall).toBeUndefined();
		expect(broke.peel.bribe.shortfall).toBeDefined();
	});

	it("clears the retry once a drop covers the bill", () => {
		expect(choiceIn(kantoGateShakyPaid()).peel.owed).toBe(
			"the peel is settled · 16 KB over"
		);
		expect(choiceIn(kantoGateShakyPicking()).peel.owed).toContain("still owed");
	});
});
