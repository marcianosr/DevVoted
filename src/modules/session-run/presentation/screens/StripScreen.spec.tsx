import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

import { CONFIGS } from "~/modules/session-run/configs/configRoster.model";
import type { CheckStatus } from "~/modules/session-run/configs/effect.model";
import { StripScreen } from "./StripScreen.ui";

const checks: CheckStatus[] = [
	{
		label: "Correct",
		progress: "1/2",
		current: 1,
		target: 2,
		state: "failed",
	},
	{
		label: "Coverage",
		progress: "2%/4%",
		current: 2,
		target: 4,
		state: "success",
		sourceConfigId: "coverage-gain",
	},
];

describe(StripScreen, () => {
	it("tells the player how many configs to peel", () => {
		render(
			<StripScreen
				stripsRemaining={2}
				configs={[CONFIGS.js, CONFIGS.copilot]}
				checks={checks}
				answered={[]}
				onStrip={() => {}}
			/>
		);
		expect(
			screen.getByRole("heading", { name: /Gate failed/ })
		).toBeInTheDocument();
		expect(screen.getByText("2")).toBeInTheDocument();
	});

	it("shows which check broke the gate", () => {
		render(
			<StripScreen
				stripsRemaining={1}
				configs={[CONFIGS.js]}
				checks={checks}
				answered={[]}
				onStrip={() => {}}
			/>
		);
		expect(screen.getByText("Correct")).toBeInTheDocument();
	});

	it("peels the chosen config", () => {
		const onStrip = vi.fn();
		render(
			<StripScreen
				stripsRemaining={1}
				configs={[CONFIGS.js, CONFIGS.copilot]}
				checks={checks}
				answered={[]}
				onStrip={onStrip}
			/>
		);
		fireEvent.click(screen.getByRole("button", { name: /Copilot/ }));
		expect(onStrip).toHaveBeenCalledWith("copilot");
	});

	it("locks the peel chips once the quota is met", () => {
		render(
			<StripScreen
				stripsRemaining={0}
				configs={[CONFIGS.js]}
				checks={checks}
				answered={[]}
				onStrip={() => {}}
			/>
		);
		expect(screen.getByRole("button", { name: /Remove/ })).toBeDisabled();
	});
});
