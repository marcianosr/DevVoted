import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { CONFIGS } from "~/modules/run/config/domain/configRoster.model";
import type { CheckStatus } from "~/modules/run/config/domain/effect.model";
import { roleRows } from "~/modules/run/gate/domain/configRole.model";
import { RoleList } from "~/modules/run/gate/presentation/RoleList.ui";

const checks: CheckStatus[] = [
	{
		label: "Correct",
		progress: { kind: "answers", current: 0, target: 1 },
		current: 0,
		target: 1,
		state: "running",
		sourceConfigId: "unit-tests",
	},
	{
		label: "Coverage",
		progress: { kind: "coverage", current: 2, target: 1 },
		current: 2,
		target: 1,
		state: "success",
		sourceConfigId: "coverage-gain",
	},
];

const configs = [CONFIGS.unitTests, CONFIGS.coverageGain];

// The detail cell hides by class rather than unmounting, so "shut" is read off
// the classes — the same thing the breakpoint default does. Found via the row's
// own chip so the assertions don't ride on the list's sort order.
const detailFor = (label: string) => {
	const row = screen.getByText(label).closest("div.grid");
	const detail = row?.querySelector(".row-start-2");
	if (!detail) throw new Error(`no detail cell for ${label}`);
	return detail;
};

describe(RoleList, () => {
	it("leaves every row's fold to the breakpoint by default", () => {
		render(<RoleList rows={roleRows(configs, checks)} />);
		expect(detailFor("Unit Tests")).toHaveClass("hidden", "sm:flex");
		expect(detailFor("Coverage")).toHaveClass("hidden", "sm:flex");
	});

	it("opens only the running check when idle rows are folded", () => {
		render(<RoleList rows={roleRows(configs, checks)} foldIdleRows />);
		// Unit Tests is the check the gate is judging right now: open, at any width.
		expect(detailFor("Unit Tests")).toHaveClass("flex");
		expect(detailFor("Unit Tests")).not.toHaveClass("hidden");
		// The satisfied one has nothing left to watch: shut.
		expect(detailFor("Coverage")).toHaveClass("hidden");
		expect(detailFor("Coverage")).not.toHaveClass("sm:flex");
	});

	it("shuts a config with no check at all, since nothing about it is live", () => {
		render(<RoleList rows={roleRows([CONFIGS.agentsMd], [])} foldIdleRows />);
		expect(detailFor("AGENTS.md")).toHaveClass("hidden");
	});

	// Which column a tally reads in, per DVTD-c0d0. A counter is short enough to
	// scan in the value column; prose needs the width of the note under it.
	const valueOf = (label: string) =>
		screen.getByText(label).closest("div.grid")?.querySelector(".tabular-nums")
			?.textContent;

	it("puts a bare counter in the value column", () => {
		const counting: CheckStatus[] = [
			{
				label: "Correct",
				progress: { kind: "answers", current: 1, target: 2 },
				current: 1,
				target: 2,
				state: "running",
				sourceConfigId: "unit-tests",
			},
		];
		render(<RoleList rows={roleRows([CONFIGS.unitTests], counting)} />);
		expect(valueOf("Unit Tests")).toBe("1/2");
	});

	it("drops a wordy tally under the description instead of the value column", () => {
		const breadth: CheckStatus[] = [
			{
				label: "Breadth",
				progress: { kind: "categories", current: 0, target: 2 },
				current: 0,
				target: 2,
				state: "running",
				sourceConfigId: "unit-tests",
			},
		];
		render(<RoleList rows={roleRows([CONFIGS.unitTests], breadth)} />);
		expect(screen.getByText("0/2 categories")).toBeInTheDocument();
		expect(valueOf("Unit Tests")).toBeUndefined();
	});
});
