import { describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import {
	BRIBE_LABEL,
	REFUSAL_LABEL,
	kantoGateCaught,
	kantoGateCaughtDropped,
	kantoGatePeelBillKb,
	kantoGatePeelValues,
	kantoGateShaky,
	kantoGateShakyCollected,
	kantoGateShakyFunded,
	kantoGateShakyFundedDropping,
	kantoGateShakyMix,
	kantoGateShakyMixSettled,
	kantoGateShakyStorageOnly,
	kantoGateShakyStuck,
	peelTallyOf,
} from "~/test/kantoGate.factory";
import type { GateOutcomeScreenProps } from "./GateOutcomeScreen.ui";

import { GateChoice, type GateChoiceProps } from "./GateChoice.ui";

const choiceOf = (props: GateOutcomeScreenProps): GateChoiceProps => ({
	...props.tail!.choice!,
	press: { ...props.footer.action, note: props.footer.note },
});

const radios = () =>
	within(screen.getByRole("radiogroup")).getAllByRole("radio");

const press = (name: RegExp) => screen.getByRole("button", { name });

describe("GateChoice", () => {
	it("heads the panel with the price of the retry", () => {
		render(<GateChoice {...choiceOf(kantoGateShaky())} />);

		expect(screen.getByRole("heading")).toHaveTextContent("Pay 48 KB to retry");
	});

	it("names the gate and the band it held on", () => {
		render(<GateChoice {...choiceOf(kantoGateShaky())} />);

		expect(screen.getByText(/Gate 4 held/)).toBeInTheDocument();
	});

	it("lets the player walk away whatever the peel stands at, keeping the balance", () => {
		render(<GateChoice {...choiceOf(kantoGateShaky())} />);

		expect(screen.getByRole("button", { name: REFUSAL_LABEL })).toBeEnabled();
		expect(screen.getByText(/no retry, keep/).parentElement).toHaveTextContent(
			"no retry, keep 28 KB"
		);
	});

	describe("when storage and a single config can each pay", () => {
		it("offers both, with storage picked first", () => {
			render(<GateChoice {...choiceOf(kantoGateShakyFunded())} />);

			expect(screen.getByRole("radio", { name: BRIBE_LABEL })).toBeChecked();
			expect(
				screen.getByRole("radio", { name: "Drop Cache" })
			).not.toBeChecked();
			expect(press(/^Pay from storage/)).toBeEnabled();
		});

		it("states the balance the storage move leaves", () => {
			render(<GateChoice {...choiceOf(kantoGateShakyFunded())} />);

			expect(press(/^Pay from storage/)).toHaveAccessibleName(
				"Pay from storage · 512 KB → 464 KB · 5 fresh polls"
			);
		});

		it("renames the press for the config picked and names the overpay", () => {
			render(<GateChoice {...choiceOf(kantoGateShakyFundedDropping())} />);

			expect(press(/^Drop Cache/)).toBeEnabled();
			expect(screen.getByText(/lost/).parentElement).toHaveTextContent(
				"64 KB for 48 KB · −16 KB lost"
			);
		});

		it("lists only the moves that pay the peel alone", () => {
			render(<GateChoice {...choiceOf(kantoGateShakyFunded())} />);

			expect(radios()).toHaveLength(3);
			expect(
				screen.queryByRole("radio", { name: "Drop IndexedDB" })
			).not.toBeInTheDocument();
		});

		it("hands the screen the whole move a radio picks", async () => {
			const onToggle = vi.fn();
			const choice = choiceOf(kantoGateShakyFunded());
			const options = choice.options;
			if (options?.kind !== "radio") throw new Error("expected a radio");

			render(
				<GateChoice
					{...choice}
					options={{
						...options,
						rows: options.rows.map((row) => ({
							...row,
							pick: { ...row.pick, onToggle },
						})),
					}}
				/>
			);
			await userEvent.click(screen.getByRole("radio", { name: "Drop Cache" }));

			expect(onToggle).toHaveBeenCalledOnce();
		});
	});

	describe("when only storage can pay", () => {
		it("offers storage as the one move", () => {
			render(<GateChoice {...choiceOf(kantoGateShakyStorageOnly())} />);

			expect(radios()).toHaveLength(1);
			expect(press(/^Pay from storage/)).toBeEnabled();
		});
	});

	describe("when only a config can pay", () => {
		it("waits for a pick and says how short storage is", () => {
			render(<GateChoice {...choiceOf(kantoGateShaky())} />);

			expect(press(/^Pick a config/)).toBeDisabled();
			expect(press(/^Pick a config/)).toHaveAccessibleName(
				"Pick a config · you have 28 KB · 20 KB short"
			);
			expect(
				screen.queryByRole("radio", { name: BRIBE_LABEL })
			).not.toBeInTheDocument();
		});

		it("badges each config with what dropping it pays", () => {
			render(<GateChoice {...choiceOf(kantoGateShaky())} />);

			expect(screen.getAllByText("64 KB")).toHaveLength(2);
		});

		it("badges the refund a drop pays back under Garbage Collection", () => {
			render(<GateChoice {...choiceOf(kantoGateShakyCollected())} />);

			expect(screen.getByText(/^\+\d+ KB$/)).toBeInTheDocument();
		});
	});

	describe("when nothing pays the peel alone", () => {
		it("falls back to combining drops and storage with checkboxes", () => {
			render(<GateChoice {...choiceOf(kantoGateShakyMix())} />);

			expect(screen.queryByRole("radiogroup")).not.toBeInTheDocument();
			expect(
				screen.getByRole("checkbox", { name: "Drop IndexedDB" })
			).toBeEnabled();
			expect(screen.getByRole("checkbox", { name: BRIBE_LABEL })).toBeEnabled();
			expect(press(/^Retry gate 4/)).toBeDisabled();
		});

		it("opens the retry once a drop and storage settle it together", () => {
			render(<GateChoice {...choiceOf(kantoGateShakyMixSettled())} />);

			expect(press(/^Retry gate 4/)).toBeEnabled();
		});
	});

	describe("when nothing can pay the peel", () => {
		it("refuses the retry and leaves only the way out", () => {
			render(<GateChoice {...choiceOf(kantoGateShakyStuck())} />);

			expect(press(/^Nothing covers the peel/)).toBeDisabled();
			expect(screen.getByRole("button", { name: REFUSAL_LABEL })).toBeEnabled();
		});
	});

	describe("a caught gate", () => {
		it("asks for the catch before the retry opens", () => {
			render(<GateChoice {...choiceOf(kantoGateCaught())} />);

			expect(
				screen.getByRole("checkbox", { name: "Drop Try/Catch" })
			).toBeEnabled();
			expect(press(/^Drop Try\/Catch first/)).toBeDisabled();
		});

		it("opens the retry once the catch alone covers the peel", () => {
			render(<GateChoice {...choiceOf(kantoGateCaughtDropped())} />);

			expect(
				screen.getByRole("checkbox", { name: "Keep Try/Catch" })
			).toBeChecked();
			expect(press(/^Retry gate 4/)).toBeEnabled();
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

describe("the outcome fixture's build", () => {
	it("cannot settle its peel exactly, which is the whole tension", () => {
		const sums = kantoGatePeelValues.flatMap((value, index) => [
			value,
			...kantoGatePeelValues.slice(index + 1).map((other) => value + other),
		]);

		expect(kantoGatePeelBillKb).toBe(48);
		expect(sums).not.toContain(kantoGatePeelBillKb);
	});
});
