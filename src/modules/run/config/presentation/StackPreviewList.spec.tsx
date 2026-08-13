import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

import { CONFIGS } from "~/modules/run/config/domain/configRoster.model";
import { preRunRoleRows } from "~/modules/run/gate/domain/configRole.model";
import { StackPreviewList } from "~/modules/run/config/presentation/StackPreviewList.ui";

const checks = [
	{
		label: "Correct",
		progress: { kind: "answers" as const, current: 0, target: 1 },
		current: 0,
		target: 1,
		state: "running" as const,
		sourceConfigId: "unit-tests",
		description: "1 correct answer",
	},
];

describe(StackPreviewList, () => {
	it("shows a config's demand and payoff without asking for a tap", () => {
		const rows = preRunRoleRows([CONFIGS.unitTests], checks);
		render(<StackPreviewList rows={rows} />);
		expect(screen.getByText("1 correct answer")).toBeInTheDocument();
		expect(
			screen.getByText((_, el) => el?.textContent === "+32KB on clear")
		).toBeInTheDocument();
	});

	it("carries no live progress — preRunRoleRows already stripped it", () => {
		const rows = preRunRoleRows([CONFIGS.unitTests], checks);
		render(<StackPreviewList rows={rows} />);
		expect(screen.queryByText("0/1")).not.toBeInTheDocument();
	});

	it("shows each config's live status dot — preRunRoleRows keeps state", () => {
		const rows = preRunRoleRows([CONFIGS.unitTests], checks);
		render(<StackPreviewList rows={rows} />);
		expect(screen.getByRole("img", { name: "running" })).toBeInTheDocument();
	});

	it("defaults a config with no matching check to a skipped dot", () => {
		const rows = preRunRoleRows([CONFIGS.eslint], []);
		render(<StackPreviewList rows={rows} />);
		expect(screen.getByRole("img", { name: "skipped" })).toBeInTheDocument();
	});

	it("hides a config's fee until its details are tapped open", () => {
		const rows = preRunRoleRows([CONFIGS.eslint], []);
		render(<StackPreviewList rows={rows} />);
		expect(
			screen.queryByText("The fee doubles each use")
		).not.toBeInTheDocument();
		fireEvent.click(screen.getByRole("button", { name: /more details/ }));
		expect(screen.getByText("The fee doubles each use")).toBeInTheDocument();
	});

	it("closes the fee again on a second tap", () => {
		const rows = preRunRoleRows([CONFIGS.eslint], []);
		render(<StackPreviewList rows={rows} />);
		const toggle = screen.getByRole("button", { name: /more details/ });
		fireEvent.click(toggle);
		fireEvent.click(
			screen.getByRole("button", { name: /hide the fine print/ })
		);
		expect(
			screen.queryByText("The fee doubles each use")
		).not.toBeInTheDocument();
	});

	it("skips the details tap entirely for a config with no fee", () => {
		const rows = preRunRoleRows([CONFIGS.unitTests], checks);
		render(<StackPreviewList rows={rows} />);
		expect(
			screen.queryByRole("button", { name: /more details/ })
		).not.toBeInTheDocument();
	});

	it("numbers rows in pipeline order", () => {
		const rows = preRunRoleRows([CONFIGS.unitTests, CONFIGS.eslint], []);
		render(<StackPreviewList rows={rows} />);
		expect(screen.getByText("1")).toBeInTheDocument();
		expect(screen.getByText("2")).toBeInTheDocument();
	});
});
