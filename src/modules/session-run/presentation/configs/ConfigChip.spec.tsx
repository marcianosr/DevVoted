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

	it("colors the label in the rarity text color (common → pewter)", () => {
		render(<ConfigChip config={CONFIGS.js} />);
		expect(screen.getByRole("button")).toHaveClass("text-pewter");
	});

	it("wears the rarity border + text (legendary → indigo)", () => {
		render(<ConfigChip config={CONFIGS.deployFriday} />);
		expect(screen.getByRole("button")).toHaveClass(
			"border-indigo",
			"text-indigo"
		);
	});

	it("shows the level once upgraded", () => {
		render(<ConfigChip config={{ ...CONFIGS.js, level: 2 }} />);
		expect(screen.getByText("L2")).toBeInTheDocument();
	});
});
