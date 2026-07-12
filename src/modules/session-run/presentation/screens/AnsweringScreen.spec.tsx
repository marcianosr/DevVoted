import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

import { CONFIGS } from "~/modules/session-run/configs/configRoster.model";
import { AnsweringScreen } from "./AnsweringScreen.ui";

const base = {
	gatesCleared: 2,
	victoryGate: 5,
	pollsToGate: 3,
	coverage: 6,
	storage: 440,
	configs: [CONFIGS.js],
	slots: 3,
	checks: [
		{
			label: "Correct",
			progress: "1/2",
			current: 1,
			target: 2,
			state: "running" as const,
		},
	],
	gateReward: 120,
	category: "react" as const,
	question: "Which key?",
	options: [
		{ id: "a", label: "A stable unique id" },
		{ id: "b", label: "The array index" },
	],
	answerType: "single" as const,
	onSelect: vi.fn(),
};

describe("AnsweringScreen", () => {
	it("renders the poll question and the gate checklist", () => {
		render(<AnsweringScreen {...base} />);
		expect(screen.getByText("Which key?")).toBeInTheDocument();
		expect(screen.getByText(/Correct/)).toBeInTheDocument();
	});

	it("answers a poll option", () => {
		const onSelect = vi.fn();
		render(<AnsweringScreen {...base} onSelect={onSelect} />);
		fireEvent.click(screen.getByRole("button", { name: /A stable unique id/ }));
		expect(onSelect).toHaveBeenCalledWith("a");
	});
});
