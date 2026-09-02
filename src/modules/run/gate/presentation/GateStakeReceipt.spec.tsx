import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { GateStakeReceipt } from "~/modules/run/gate/presentation/GateStakeReceipt.ui";
import { createMockGateStake } from "~/test/runView.factory";

const COST_OVERRUN_VIEW = {
	id: "cost-overrun",
	code: 402,
	name: "Cost Overrun",
	description: "Every paid action costs ×2 — linting and peeking both.",
	suppressed: false,
};

describe(GateStakeReceipt, () => {
	it("foreshadows the first audit ahead when the gate runs clean", () => {
		render(
			<GateStakeReceipt
				stake={createMockGateStake({
					audits: [],
					upcomingAudit: {
						gateNumber: 3,
						name: "Cost Overrun",
						description: COST_OVERRUN_VIEW.description,
					},
				})}
			/>
		);
		const receipt = screen.getByTestId("gate-stake-receipt");
		expect(receipt.textContent).toContain("The first audit waits at gate 3");
		expect(receipt.textContent).toContain("Cost Overrun");
	});

	it("lists the gate's own audits without the foreshadow", () => {
		render(
			<GateStakeReceipt
				stake={createMockGateStake({ audits: [COST_OVERRUN_VIEW] })}
			/>
		);
		const receipt = screen.getByTestId("gate-stake-receipt");
		expect(receipt.textContent).toContain("Cost Overrun");
		expect(receipt.textContent).not.toContain("first audit waits");
	});

	it("drops the Audit section with no audits and none ahead", () => {
		render(<GateStakeReceipt stake={createMockGateStake({ audits: [] })} />);
		expect(screen.queryByText("Audit")).not.toBeInTheDocument();
	});
});
