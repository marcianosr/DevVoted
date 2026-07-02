import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { STORAGE_UNITS } from "~/lib/storage";
import { PipelineSuccessScreen } from "./PipelineSuccessScreen.ui";
import type { PipelineReward } from "./PipelineSuccessScreen.ui";

const rewards: PipelineReward[] = [
	{ label: "Coverage Gain · medium", bytes: STORAGE_UNITS.KB * 128 },
	{ label: "Correct Answers · low", bytes: STORAGE_UNITS.KB * 64 },
];

const baseProps = {
	gateNumber: 3,
	rewards,
	totalReward: STORAGE_UNITS.KB * 192,
	storageUsed: STORAGE_UNITS.MB / 2,
	storageLimit: STORAGE_UNITS.MB,
};

describe(PipelineSuccessScreen.name, () => {
	it("headlines the cleared gate", () => {
		render(<PipelineSuccessScreen {...baseProps} />);
		expect(
			screen.getByRole("heading", { name: /Gate 3 cleared/ })
		).toBeInTheDocument();
	});

	it("lists each storage reward", () => {
		render(<PipelineSuccessScreen {...baseProps} />);
		expect(screen.getByText("Coverage Gain · medium")).toBeInTheDocument();
		expect(screen.getByText("+64 KB")).toBeInTheDocument();
	});

	it("omits the rewards section when there is no payout", () => {
		render(
			<PipelineSuccessScreen {...baseProps} rewards={[]} totalReward={0} />
		);
		expect(screen.queryByText("Rewards")).not.toBeInTheDocument();
	});

	it("renders the next-step slot passed as children", () => {
		render(
			<PipelineSuccessScreen {...baseProps}>
				<button type="button">Continue →</button>
			</PipelineSuccessScreen>
		);
		expect(
			screen.getByRole("button", { name: "Continue →" })
		).toBeInTheDocument();
	});
});
