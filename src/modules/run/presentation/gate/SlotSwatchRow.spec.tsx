import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { MAX_SLOTS } from "~/modules/run/pipeline/pipeline.model";
import { SLOT_SWATCHES } from "~/modules/run/pipeline/swatch.model";
import { SlotSwatchRow } from "./SlotSwatchRow.ui";

const boulder = SLOT_SWATCHES[4];
const eliteFour = SLOT_SWATCHES[MAX_SLOTS];

describe(SlotSwatchRow, () => {
	it("names the swatch, its slot, and the unlock line", () => {
		render(
			<SlotSwatchRow swatch={boulder} unlockAtPct={8} coveragePct={5.5} />
		);
		expect(screen.getByText("Boulder Swatch")).toBeInTheDocument();
		expect(screen.getByText("· slot 4")).toBeInTheDocument();
		expect(screen.getByText("8%")).toBeInTheDocument();
		expect(screen.getByText("5.5%")).toBeInTheDocument();
	});

	it("draws unlock progress as a bar capped at the coverage gate", () => {
		render(
			<SlotSwatchRow swatch={boulder} unlockAtPct={8} coveragePct={5.5} />
		);
		const bar = screen.getByRole("progressbar", {
			name: "coverage toward Boulder Swatch",
		});
		expect(bar).toHaveAttribute("aria-valuenow", "5.5");
		expect(bar).toHaveAttribute("aria-valuemax", "8");
	});

	it("themes the row in the swatch's Kanto color", () => {
		const { container } = render(
			<SlotSwatchRow swatch={boulder} unlockAtPct={8} coveragePct={5.5} />
		);
		expect(
			container.querySelector('[data-swatch-theme="boulder"]')
		).toBeInTheDocument();
	});

	it("offers the unlock button only once the gate is met", () => {
		const { rerender } = render(
			<SlotSwatchRow
				swatch={boulder}
				unlockAtPct={8}
				coveragePct={5.5}
				claim={{ ready: false, onClaim: () => {} }}
			/>
		);
		expect(screen.queryByRole("button")).not.toBeInTheDocument();

		rerender(
			<SlotSwatchRow
				swatch={boulder}
				unlockAtPct={8}
				coveragePct={9}
				claim={{ ready: true, onClaim: () => {} }}
			/>
		);
		expect(
			screen.getByRole("button", { name: "Unlock slot" })
		).toBeInTheDocument();
	});

	it("unlocks the slot through the button", async () => {
		const onClaim = vi.fn();
		render(
			<SlotSwatchRow
				swatch={boulder}
				unlockAtPct={8}
				coveragePct={9}
				claim={{ ready: true, onClaim }}
			/>
		);
		await userEvent.click(screen.getByRole("button", { name: "Unlock slot" }));
		expect(onClaim).toHaveBeenCalledOnce();
	});

	it("shows a lock pill instead of a button when the row is read-only", () => {
		render(
			<SlotSwatchRow swatch={boulder} unlockAtPct={8} coveragePct={5.5} />
		);
		expect(screen.queryByRole("button")).not.toBeInTheDocument();
		expect(screen.getByText("locked")).toBeInTheDocument();
	});

	it("flips the read-only pill to unlocked once coverage meets the gate", () => {
		render(<SlotSwatchRow swatch={boulder} unlockAtPct={8} coveragePct={9} />);
		expect(screen.getByText("unlocked")).toBeInTheDocument();
	});

	it("dresses the Elite Four in the legendary ring instead of a flat color", () => {
		const { container } = render(
			<SlotSwatchRow
				swatch={eliteFour}
				unlockAtPct={250}
				coveragePct={251}
				claim={{ ready: true, onClaim: () => {} }}
			/>
		);
		expect(container.querySelector("[data-swatch-theme]")).toBeNull();
		expect(container.querySelectorAll(".legendary-ring").length).toBe(2); // chip + pill
	});
});
