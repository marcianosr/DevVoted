import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { CONFIGS } from "~/modules/run/config/domain/configRoster.model";
import { roleRows } from "~/modules/run/gate/domain/configRole.model";
import { RoleList } from "~/modules/run/gate/presentation/RoleList.ui";

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
		render(<RoleList rows={roleRows(configs)} />);
		expect(detailFor("Unit Tests")).toHaveClass("hidden", "sm:flex");
		expect(detailFor("Coverage")).toHaveClass("hidden", "sm:flex");
	});

	it("shuts every row when idle rows are folded — nothing is live anymore (ADR-035)", () => {
		render(<RoleList rows={roleRows(configs)} foldIdleRows />);
		expect(detailFor("Unit Tests")).toHaveClass("hidden");
		expect(detailFor("Coverage")).toHaveClass("hidden");
	});

	it("renders each config's gives line in its detail", () => {
		render(<RoleList rows={roleRows([CONFIGS.coverageGain])} />);
		expect(detailFor("Coverage").textContent).toContain("Coverage gains earn");
	});
});

// Dependabot's merge lands in the reducer, and the run log never shows in the
// live game — the badge is how the player learns their build changed.
describe("a config Dependabot just bumped", () => {
	it("badges the upgraded config", () => {
		render(<RoleList rows={roleRows(configs)} upgradedConfigId="unit-tests" />);
		expect(screen.getByText("upgraded")).toBeInTheDocument();
	});

	it("lets offline win the badge slot — a dead config has nothing to celebrate", () => {
		render(
			<RoleList
				rows={roleRows(configs)}
				upgradedConfigId="unit-tests"
				offlineConfigIds={["unit-tests"]}
			/>
		);
		expect(screen.getByText("offline")).toBeInTheDocument();
		expect(screen.queryByText("upgraded")).not.toBeInTheDocument();
	});
});

// ADR-038: four audits switch a config off mid-attempt, and two of them move it
// every poll — so the rail has to say which one is dead right now, not merely
// that something is.
describe("a config an audit has switched off", () => {
	const offline = { offlineConfigIds: ["unit-tests"] };

	it("badges the offline config and leaves the rest alone", () => {
		render(<RoleList rows={roleRows(configs)} {...offline} />);
		expect(screen.getByText("offline")).toBeInTheDocument();
	});

	it("opens the offline row, since the struck-out effect is the point", () => {
		render(<RoleList rows={roleRows(configs)} foldIdleRows {...offline} />);
		expect(detailFor("Unit Tests")).not.toHaveClass("hidden");
		expect(detailFor("Coverage")).toHaveClass("hidden");
	});

	it("strikes the effect it can no longer deliver", () => {
		render(<RoleList rows={roleRows(configs)} {...offline} />);
		const struck = detailFor("Unit Tests").querySelector(".line-through");
		expect(struck).not.toBeNull();
	});

	it("takes away the paid action — a dead config sells nothing", () => {
		const onUse = () => {
			throw new Error("an offline config must not be usable");
		};
		render(
			<RoleList
				rows={roleRows(configs)}
				{...offline}
				getUseAction={() => ({ cost: 8, ready: true, onUse })}
			/>
		);
		// One "use" press left: Coverage's, not the offline Unit Tests'.
		expect(screen.getAllByRole("button", { name: /use/ })).toHaveLength(1);
	});

	it("says nothing when nothing is offline", () => {
		render(<RoleList rows={roleRows(configs)} />);
		expect(screen.queryByText("offline")).not.toBeInTheDocument();
	});
});
