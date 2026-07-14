import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

import { CONFIGS } from "~/modules/session-run/configs/configRoster.model";
import { ConfigChip } from "./ConfigChip.ui";

describe("ConfigChip", () => {
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

	it("colors the label in the rarity text color (common → cerulean)", () => {
		render(<ConfigChip config={CONFIGS.js} />);
		expect(screen.getByText(".js")).toHaveClass("text-cerulean");
	});

	it("wears the prismatic rarity styling (legendary)", () => {
		render(<ConfigChip config={CONFIGS.copilot} />);
		expect(screen.getByText("Copilot")).toHaveClass("prismatic-chip");
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
