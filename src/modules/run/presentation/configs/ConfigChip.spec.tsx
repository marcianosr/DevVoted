import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

import { CONFIGS } from "~/modules/run/configs/configRoster.model";
import { ConfigChip } from "./ConfigChip.ui";

describe(ConfigChip, () => {
	it("renders the config label", () => {
		render(<ConfigChip config={CONFIGS.js} />);
		expect(screen.getByText(".js")).toBeInTheDocument();
	});

	it("calls onClick when interactive", () => {
		const onClick = vi.fn();
		render(<ConfigChip config={CONFIGS.eslint} action="✕" onClick={onClick} />);
		fireEvent.click(screen.getByRole("button"));
		expect(onClick).toHaveBeenCalledTimes(1);
	});

	it("renders a static, non-interactive token when no onClick is given", () => {
		render(<ConfigChip config={CONFIGS.js} />);
		expect(screen.queryByRole("button")).not.toBeInTheDocument();
	});

	it("does not fire while disabled", () => {
		const onClick = vi.fn();
		render(<ConfigChip config={CONFIGS.js} disabled onClick={onClick} />);
		fireEvent.click(screen.getByRole("button"));
		expect(onClick).not.toHaveBeenCalled();
	});

	it("keeps the label white and carries rarity on the border (common → cerulean)", () => {
		render(<ConfigChip config={CONFIGS.js} />);
		expect(screen.getByText(".js")).toHaveClass(
			"text-zinc-100",
			"border-cerulean"
		);
	});

	it("wears the border-only prismatic styling (legendary), label stays white", () => {
		render(<ConfigChip config={CONFIGS.copilot} />);
		expect(screen.getByText("Copilot")).toHaveClass(
			"prismatic-border",
			"text-zinc-100"
		);
		expect(screen.getByText("Copilot")).not.toHaveClass("prismatic-chip");
	});

	it("shows the level once upgraded", () => {
		render(<ConfigChip config={{ ...CONFIGS.js, level: 2 }} />);
		expect(screen.getByText("L2")).toBeInTheDocument();
	});

	it("exposes its description in a tooltip", () => {
		render(<ConfigChip config={CONFIGS.coverageGain} />);
		expect(
			screen.getByText(CONFIGS.coverageGain.description)
		).toBeInTheDocument();
	});
});
