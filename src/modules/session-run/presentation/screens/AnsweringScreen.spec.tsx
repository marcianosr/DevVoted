import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

import { CONFIGS } from "~/modules/session-run/configs/configRoster.model";
import { AnsweringScreen } from "./AnsweringScreen.ui";

const base = {
	configs: [CONFIGS.unitTests, CONFIGS.js],
	checks: [
		{
			label: "Correct",
			progress: "1/2",
			current: 1,
			target: 2,
			state: "running" as const,
			sourceConfigId: "unit-tests",
		},
	],
	category: "react" as const,
	question: "Which key?",
	options: [
		{ id: "a", label: "A stable unique id" },
		{ id: "b", label: "The array index" },
	],
	canSubmit: true,
	onSelect: vi.fn(),
	onSubmit: vi.fn(),
};

describe("AnsweringScreen", () => {
	it("renders the poll question and the gate checklist", () => {
		render(<AnsweringScreen {...base} />);
		expect(screen.getByText("Which key?")).toBeInTheDocument();
		expect(screen.getByText("Unit Tests")).toBeInTheDocument();
	});

	it("answers a poll option", () => {
		const onSelect = vi.fn();
		render(<AnsweringScreen {...base} onSelect={onSelect} />);
		fireEvent.click(screen.getByRole("button", { name: /A stable unique id/ }));
		expect(onSelect).toHaveBeenCalledWith("a");
	});

	it("submits the selected answer", () => {
		const onSubmit = vi.fn();
		render(<AnsweringScreen {...base} onSubmit={onSubmit} />);
		fireEvent.click(screen.getByRole("button", { name: /Submit answer/ }));
		expect(onSubmit).toHaveBeenCalledOnce();
	});

	it("disables submit when nothing is selected", () => {
		render(<AnsweringScreen {...base} canSubmit={false} />);
		expect(
			screen.getByRole("button", { name: /Submit answer/ })
		).toBeDisabled();
	});
});
