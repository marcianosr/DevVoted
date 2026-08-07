import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { CONFIGS } from "~/modules/run/configs/configRoster.model";
import type { CheckStatus } from "~/modules/run/configs/effect.model";
import { roleRows } from "~/modules/run/gate/configRole.model";
import { RoleList } from "./RoleList.ui";

const checks: CheckStatus[] = [
	{
		label: "Correct",
		progress: "0/1",
		current: 0,
		target: 1,
		state: "running",
		sourceConfigId: "unit-tests",
	},
	{
		label: "Coverage",
		progress: "2%/1%",
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
	const detail = row?.querySelector(".border-l");
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
		render(<RoleList rows={roleRows([CONFIGS.copilot], [])} foldIdleRows />);
		expect(detailFor("Copilot")).toHaveClass("hidden");
	});
});
