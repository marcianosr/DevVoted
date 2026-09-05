import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

import { CONFIGS } from "~/modules/run/config/domain/configRoster.model";
import { ConfigChip } from "~/modules/run/config/presentation/ConfigChip.ui";

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

	it("outlines every chip the same, whatever its grade", () => {
		const { container: bit } = render(<ConfigChip config={CONFIGS.js} />);
		const { container: byte } = render(
			<ConfigChip config={CONFIGS.agentsMd} />
		);

		expect(screen.getByText(".js")).toHaveClass(
			"text-zinc-100",
			"border-edge-strong"
		);
		expect(bit.firstElementChild?.className).toBe(
			byte.firstElementChild?.className
		);
	});

	it("gives the byte no ring of its own", () => {
		render(<ConfigChip config={CONFIGS.agentsMd} />);

		expect(screen.getByText("AGENTS.md")).not.toHaveClass("legendary-ring");
	});

	it("shows the level once upgraded", () => {
		render(<ConfigChip config={{ ...CONFIGS.js, level: 2 }} />);
		expect(screen.getByText("L2")).toBeInTheDocument();
	});

	it("exposes its description in a tooltip", () => {
		render(<ConfigChip config={CONFIGS.codeCoverage} />);
		expect(
			screen.getByText(CONFIGS.codeCoverage.description)
		).toBeInTheDocument();
	});
});
