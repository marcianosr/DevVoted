import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import {
	BRIBE_LABEL,
	REFUSAL_LABEL,
	kantoGatePeelBillKb,
	kantoGatePeelBillSlots,
	kantoGatePeelValues,
	kantoGateShaky,
	kantoGateShakyCollected,
	kantoGateShakyFromStorage,
	kantoGateShakyFunded,
	kantoGateShakyMixed,
	kantoGateShakyPaid,
	kantoGateShakyPicking,
	peelHeadlineOf,
	peelTallyOf,
} from "~/test/kantoGate.factory";

import { GateChoice, type GateChoiceProps } from "./GateChoice.ui";

const choiceIn = (props: { tail?: { choice?: GateChoiceProps } }) =>
	props.tail!.choice!;

const bribeBox = () => screen.getByRole("checkbox", { name: BRIBE_LABEL });

describe("GateChoice", () => {
	it("heads the panel with the work it asks for, not with the verdict", () => {
		render(<GateChoice {...choiceIn(kantoGateShaky())} />);

		expect(
			screen.getByRole("heading", { name: "Settle the peel to retry" })
		).toBeInTheDocument();
	});

	it("leads with what is owed, in the colour a debt wears", () => {
		render(<GateChoice {...choiceIn(kantoGateShaky())} />);

		expect(screen.getByText("48 KB owed")).toHaveAttribute(
			"data-screen-theme",
			"cinnabar"
		);
	});

	it("turns the headline over to what was settled once it is paid", () => {
		render(<GateChoice {...choiceIn(kantoGateShakyPaid())} />);

		expect(screen.getByText("64 KB settled")).toHaveAttribute(
			"data-screen-theme",
			"viridian"
		);
	});

	it("prices refusing the gate in what it banks, not in what it costs", () => {
		render(<GateChoice {...choiceIn(kantoGateShaky())} />);

		expect(screen.getByText(/Banks gate 4 of 13/)).toBeInTheDocument();
	});

	it("lets the player walk away whatever the peel stands at", () => {
		render(<GateChoice {...choiceIn(kantoGateShaky())} />);

		expect(screen.getByRole("button", { name: REFUSAL_LABEL })).toBeEnabled();
	});

	describe("the settlement bar", () => {
		it("names no source while nothing has been paid", () => {
			render(<GateChoice {...choiceIn(kantoGateShaky())} />);

			expect(screen.queryByText("from storage")).not.toBeInTheDocument();
			expect(
				screen.queryByText("from dropped configs")
			).not.toBeInTheDocument();
			expect(screen.queryByText("overpaid · lost")).not.toBeInTheDocument();
		});

		it("names only storage when storage settled the whole bill", () => {
			render(<GateChoice {...choiceIn(kantoGateShakyFromStorage())} />);

			expect(screen.getByText("from storage")).toBeInTheDocument();
			expect(
				screen.queryByText("from dropped configs")
			).not.toBeInTheDocument();
		});

		it("names both sources when a drop and storage each paid a part", () => {
			render(<GateChoice {...choiceIn(kantoGateShakyMixed())} />);

			expect(screen.getByText("from storage")).toBeInTheDocument();
			expect(screen.getByText("from dropped configs")).toBeInTheDocument();
		});

		it("names the overpay, because the waste is the cost", () => {
			render(<GateChoice {...choiceIn(kantoGateShakyPaid())} />);

			expect(screen.getByText("overpaid · lost")).toBeInTheDocument();
		});
	});

	describe("paying from storage", () => {
		it("offers only the slots the balance can reach", () => {
			render(<GateChoice {...choiceIn(kantoGateShaky())} />);

			expect(screen.getByText("Pay 16 KB of the peel")).toBeInTheDocument();
		});

		it("offers the whole bill once the balance covers it", () => {
			render(<GateChoice {...choiceIn(kantoGateShakyFunded())} />);

			expect(screen.getByText("Pay 48 KB of the peel")).toBeInTheDocument();
		});

		it("offers only what the drops left owed", () => {
			render(<GateChoice {...choiceIn(kantoGateShakyMixed())} />);

			expect(screen.getByText("Pay 16 KB of the peel")).toBeInTheDocument();
		});

		it("shuts itself when the drops already settled the peel", () => {
			render(<GateChoice {...choiceIn(kantoGateShakyPaid())} />);

			expect(bribeBox()).toBeDisabled();
			expect(
				screen.getByText("the drops already settle the peel")
			).toBeInTheDocument();
		});

		it("states the balance it leaves behind", () => {
			render(<GateChoice {...choiceIn(kantoGateShakyFunded())} />);

			expect(
				screen.getByText(/storage drops to/).parentElement
			).toHaveTextContent("storage drops to 480 KB · your build stays intact");
		});

		it("carries the toggle the screen hands it", async () => {
			const onToggleStorage = vi.fn();
			const choice = choiceIn(kantoGateShakyFunded());

			render(
				<GateChoice
					{...choice}
					peel={{
						...choice.peel,
						bribe: {
							...choice.peel.bribe,
							pick: { ...choice.peel.bribe.pick, onToggle: onToggleStorage },
						},
					}}
				/>
			);
			await userEvent.click(bribeBox());

			expect(onToggleStorage).toHaveBeenCalledOnce();
		});
	});

	describe("dropping configs", () => {
		it("prices every config in what dropping it settles", () => {
			render(<GateChoice {...choiceIn(kantoGateShaky())} />);

			for (const value of kantoGatePeelValues) {
				expect(screen.getAllByText(`${value} KB`).length).toBeGreaterThan(0);
			}
		});

		it("picks a config with a checkbox rather than a badge", () => {
			render(<GateChoice {...choiceIn(kantoGateShakyPicking())} />);

			expect(
				screen.getByRole("checkbox", { name: "Keep IndexedDB" })
			).toBeChecked();
			expect(
				screen.getByRole("checkbox", { name: "Drop Cache" })
			).not.toBeChecked();
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
	it("says nothing is covered while nothing is chosen", () => {
		expect(peelTallyOf(48, 0)).toBe("nothing covered yet");
	});

	it("counts what is covered rather than restating the bill", () => {
		expect(peelTallyOf(48, 32)).toBe("32 KB of 48 KB covered");
	});

	it("says the peel is settled when the choice lands exactly", () => {
		expect(peelTallyOf(48, 48)).toBe("the peel is settled");
	});

	it("names the overshoot, since the remainder is simply gone", () => {
		expect(peelTallyOf(48, 64)).toBe("the peel is settled · 16 KB over");
	});
});

describe("peelHeadlineOf", () => {
	it("leads with the debt while any of it stands", () => {
		expect(peelHeadlineOf(48, 32)).toBe("16 KB owed");
	});

	it("leads with what was paid once the debt is gone", () => {
		expect(peelHeadlineOf(48, 64)).toBe("64 KB settled");
	});
});

describe("the outcome fixture's build", () => {
	it("cannot settle its peel exactly, which is the whole tension", () => {
		const sums = kantoGatePeelValues.flatMap((value, index) => [
			value,
			...kantoGatePeelValues.slice(index + 1).map((other) => value + other),
		]);

		expect(kantoGatePeelBillKb).toBe(48);
		expect(sums).not.toContain(kantoGatePeelBillKb);
	});

	it("lets storage buy the exact change the build cannot make", () => {
		const mixed = choiceIn(kantoGateShakyMixed());

		expect(mixed.peel.bill).toBe(kantoGatePeelBillSlots);
		expect(mixed.peel.owed).toBe("48 KB settled");
		expect(
			mixed.peel.sources.find((source) => source.label === "overpaid · lost")
		).toBeUndefined();
	});

	it("clears the retry once a drop covers the bill", () => {
		expect(choiceIn(kantoGateShakyPaid()).peel.tally).toBe(
			"the peel is settled · 16 KB over"
		);
		expect(choiceIn(kantoGateShakyPicking()).peel.tally).toContain("covered");
	});
});
