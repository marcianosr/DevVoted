import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

import { CONFIGS } from "~/modules/session-run/configs/configRoster";
import { RewardScreen } from "./RewardScreen.ui";

const base = {
	storage: 440,
	draftOptions: [CONFIGS.eslint, CONFIGS.speed],
	onDraft: vi.fn(),
	rebuildCost: 1,
	canRebuild: true,
	onRebuild: vi.fn(),
	slots: 3,
	canAddSlot: true,
	onAddSlot: vi.fn(),
	upgradeable: [CONFIGS.js],
	onUpgrade: vi.fn(),
	onSkip: vi.fn(),
};

describe("RewardScreen", () => {
	it("renders the reward header and draft options", () => {
		render(<RewardScreen {...base} />);
		expect(
			screen.getByRole("heading", { name: /take one reward/ })
		).toBeInTheDocument();
		expect(screen.getByText("ESLint")).toBeInTheDocument();
	});

	it("drafts a config and skips the reward", () => {
		const onDraft = vi.fn();
		const onSkip = vi.fn();
		render(<RewardScreen {...base} onDraft={onDraft} onSkip={onSkip} />);
		fireEvent.click(screen.getByRole("button", { name: /ESLint/ }));
		expect(onDraft).toHaveBeenCalledWith("eslint");
		fireEvent.click(screen.getByRole("button", { name: /Skip reward/ }));
		expect(onSkip).toHaveBeenCalledTimes(1);
	});
});
