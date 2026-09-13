import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { CONFIGS } from "~/modules/run/config/domain/configRoster.model";
import { createMockGateStake, createMockRunView } from "~/test/runView.factory";

import { PrepView } from "./PrepView.component";

const view = createMockRunView({
	configs: [CONFIGS.js, CONFIGS.unitTests],
	storage: 640,
	gatesCleared: 4,
	upcomingCategories: ["ts", "ts", "js", "css", "git"],
	nextGateCategories: ["git", "git", "js", "js", "ts"],
	answerTypesThisGate: { single: 4, multiple: 1 },
	optionCountsThisGate: [3, 4, 4, 5, 3],
	gateStake: createMockGateStake({
		gateNumber: 4,
		coverageLadder: { floor: 0, ok: 0, healthy: 60 },
	}),
});

const props = { view, onStart: () => {}, onBackToShop: () => {} };

describe("PrepView", () => {
	it("titles the window with the gate it is about to run", () => {
		render(<PrepView {...props} />);

		expect(screen.getByText(/gate 4/i)).toBeInTheDocument();
	});

	it("opens on what each band pays rather than on the build", () => {
		render(<PrepView {...props} />);

		expect(
			screen.getByRole("heading", { name: "Objectives and rewards" })
		).toBeInTheDocument();
	});

	describe("a ladder with every rung on it", () => {
		const laddered = createMockRunView({
			...view,
			gateStake: createMockGateStake({
				gateNumber: 4,
				coverageLadder: { floor: 20, ok: 40, healthy: 60 },
			}),
		});

		it("bills the holding band a peel drawn from the gate's own stake", () => {
			render(<PrepView {...props} view={laddered} />);

			expect(screen.getByText(/peel$/)).toHaveTextContent(/^−\d/);
		});

		it("ends the run under the floor rather than quoting it a payout", () => {
			render(<PrepView {...props} view={laddered} />);

			expect(screen.getByText("the run ends")).toBeInTheDocument();
		});
	});

	it("seals the poll details while no prefetcher is installed", () => {
		render(<PrepView {...props} />);

		expect(screen.getByText("answer types")).toBeInTheDocument();
		expect(screen.getByText("options each")).toBeInTheDocument();
	});

	it("starts the gate from the footer", async () => {
		const onStart = vi.fn();
		render(<PrepView {...props} onStart={onStart} />);

		await userEvent.click(screen.getByRole("button", { name: /^Start/ }));
		expect(onStart).toHaveBeenCalled();
	});

	it("refuses the start when the run has no polls left", () => {
		render(
			<PrepView
				{...props}
				view={createMockRunView({ ...view, pollsExhausted: true })}
			/>
		);

		expect(screen.getByRole("button", { name: /^Start/ })).toBeDisabled();
	});

	it("goes back to the shop from the footer aside", async () => {
		const onBackToShop = vi.fn();
		render(<PrepView {...props} onBackToShop={onBackToShop} />);

		await userEvent.click(
			screen.getByRole("button", { name: /Back to the shop/ })
		);
		expect(onBackToShop).toHaveBeenCalled();
	});
});
