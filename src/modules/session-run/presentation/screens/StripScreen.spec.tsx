import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

import { CONFIGS } from "~/modules/session-run/configs/configRoster.model";
import { StripScreen } from "./StripScreen.ui";

describe("StripScreen", () => {
	it("tells the player how many configs to peel", () => {
		render(
			<StripScreen
				stripsRemaining={2}
				configs={[CONFIGS.js, CONFIGS.copilot]}
				onStrip={() => {}}
			/>
		);
		expect(
			screen.getByRole("heading", { name: /Gate missed/ })
		).toBeInTheDocument();
		expect(screen.getByText("2")).toBeInTheDocument();
	});

	it("peels the chosen config", () => {
		const onStrip = vi.fn();
		render(
			<StripScreen
				stripsRemaining={1}
				configs={[CONFIGS.js, CONFIGS.copilot]}
				onStrip={onStrip}
			/>
		);
		fireEvent.click(screen.getByRole("button", { name: /Copilot/ }));
		expect(onStrip).toHaveBeenCalledWith("copilot");
	});
});
