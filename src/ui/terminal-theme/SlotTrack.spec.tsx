import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { SlotTrack } from "./SlotTrack.ui";

describe("SlotTrack", () => {
	it("draws no press when neither deal is on offer", () => {
		render(<SlotTrack segments={[{ slots: 1 }]} slots={4} />);

		expect(screen.queryByRole("button")).not.toBeInTheDocument();
	});

	it("puts the next slot on the bar, priced, and buys it on a press", async () => {
		const onUse = vi.fn();
		render(
			<SlotTrack
				segments={[{ slots: 1 }]}
				slots={4}
				buy={{ label: "Buy slot 5", price: "32 KB", onUse }}
			/>
		);

		await userEvent.click(
			screen.getByRole("button", { name: "Buy slot 5 · 32 KB" })
		);

		expect(onUse).toHaveBeenCalledOnce();
	});

	it("puts the trailing empty slot on the bar as a cash press", async () => {
		const onUse = vi.fn();
		render(
			<SlotTrack
				segments={[{ slots: 1 }]}
				slots={4}
				cash={{ label: "Hand slot 4 back", price: "16 KB", onUse }}
			/>
		);

		await userEvent.click(
			screen.getByRole("button", { name: "Hand slot 4 back · 16 KB" })
		);

		expect(onUse).toHaveBeenCalledOnce();
	});

	it("disables a deal with no handler and carries its refusal in the name", () => {
		render(
			<SlotTrack
				segments={[]}
				slots={4}
				buy={{
					label: "Buy slot 5",
					price: "512 KB",
					refusal: "Costs 512 KB, you have 216.",
				}}
			/>
		);

		expect(
			screen.getByRole("button", {
				name: "Buy slot 5 · 512 KB · Costs 512 KB, you have 216.",
			})
		).toBeDisabled();
	});
});
