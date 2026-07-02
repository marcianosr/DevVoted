import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { STORAGE_UNITS } from "~/lib/storage";
import { PipelineUpgradeCard } from "./PipelineUpgradeCard.ui";

const baseProps = {
	badge: "Upgrade",
	title: "Coverage gain pipeline",
	slug: "coverage-gain",
	reward: STORAGE_UNITS.KB * 130,
	needs: "Gain 8% coverage",
	description: "Strengthen an existing check for a bigger payout.",
	riskClassName: "text-green-400 border-green-400",
	selected: false,
	onToggle: vi.fn(),
};

describe(PipelineUpgradeCard.name, () => {
	it("renders the badge, title, slug, reward and requirement", () => {
		render(<PipelineUpgradeCard {...baseProps} />);
		expect(screen.getByText("Upgrade")).toBeInTheDocument();
		expect(screen.getByText("Coverage gain pipeline")).toBeInTheDocument();
		expect(screen.getByText("coverage-gain")).toBeInTheDocument();
		expect(screen.getByText("+130 KB")).toBeInTheDocument();
		expect(screen.getByText("needs: Gain 8% coverage")).toBeInTheDocument();
	});

	it("toggles selection on click", () => {
		const onToggle = vi.fn();
		render(<PipelineUpgradeCard {...baseProps} onToggle={onToggle} />);
		fireEvent.click(screen.getByRole("button"));
		expect(onToggle).toHaveBeenCalledOnce();
	});

	it("marks the selected state for assistive tech", () => {
		render(<PipelineUpgradeCard {...baseProps} selected />);
		expect(screen.getByRole("button")).toHaveAttribute("aria-pressed", "true");
	});

	it("cannot be toggled while disabled", () => {
		render(<PipelineUpgradeCard {...baseProps} disabled />);
		expect(screen.getByRole("button")).toBeDisabled();
	});
});
