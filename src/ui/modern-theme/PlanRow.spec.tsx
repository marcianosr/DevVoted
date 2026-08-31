import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { PlanRow } from "./PlanRow.ui";

describe("PlanRow", () => {
	it("names the cap and what it bills every gate", () => {
		render(
			<PlanRow
				label="1 MB"
				terms="32 KB a gate"
				held={false}
				pick={{ onUse: () => {} }}
			/>
		);

		expect(screen.getByText("1 MB")).toBeInTheDocument();
		expect(screen.getByText("32 KB a gate")).toBeInTheDocument();
	});

	it("checks the plan the run is on", () => {
		render(
			<PlanRow label="512 KB" terms="free" held pick={{ onUse: () => {} }} />
		);

		expect(screen.getByRole("radio")).toBeChecked();
	});

	it("warns what a downgrade burns before it is picked", () => {
		render(
			<PlanRow
				label="512 KB"
				terms="free"
				held={false}
				warns="burns 240 KB"
				pick={{ onUse: () => {} }}
			/>
		);

		expect(screen.getByText("burns 240 KB")).toBeInTheDocument();
	});

	it("switches plan on the pick", async () => {
		const onUse = vi.fn();
		render(
			<PlanRow
				label="768 KB"
				terms="16 KB a gate"
				held={false}
				pick={{ onUse }}
			/>
		);

		await userEvent.click(screen.getByRole("radio"));

		expect(onUse).toHaveBeenCalledOnce();
	});

	it("refuses the pick when the plan cannot be switched to", () => {
		render(
			<PlanRow
				label="10 MB"
				terms="768 KB a gate"
				held={false}
				pick={{ disabled: true, onUse: () => {} }}
			/>
		);

		expect(screen.getByRole("radio")).toBeDisabled();
	});
});
