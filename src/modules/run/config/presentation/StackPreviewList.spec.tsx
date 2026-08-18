import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

import { CONFIGS } from "~/modules/run/config/domain/configRoster.model";
import { roleRows } from "~/modules/run/gate/domain/configRole.model";
import { StackPreviewList } from "~/modules/run/config/presentation/StackPreviewList.ui";

describe(StackPreviewList, () => {
	it("shows a config's payoff without asking for a tap", () => {
		const rows = roleRows([CONFIGS.unitTests]);
		render(<StackPreviewList rows={rows} />);
		expect(
			screen.getByText((_, el) => el?.textContent === "+32KB on clear")
		).toBeInTheDocument();
	});

	it("shows a neutral dot per row — nothing is live before a run", () => {
		const rows = roleRows([CONFIGS.unitTests]);
		render(<StackPreviewList rows={rows} />);
		expect(screen.getByRole("img", { name: "skipped" })).toBeInTheDocument();
	});

	it("hides a config's fee until its details are tapped open", () => {
		const rows = roleRows([CONFIGS.eslint]);
		render(<StackPreviewList rows={rows} />);
		expect(
			screen.queryByText("The fee doubles each use")
		).not.toBeInTheDocument();
		fireEvent.click(screen.getByRole("button", { name: /more details/ }));
		expect(screen.getByText("The fee doubles each use")).toBeInTheDocument();
	});

	it("closes the fee again on a second tap", () => {
		const rows = roleRows([CONFIGS.eslint]);
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
		const rows = roleRows([CONFIGS.unitTests]);
		render(<StackPreviewList rows={rows} />);
		expect(
			screen.queryByRole("button", { name: /more details/ })
		).not.toBeInTheDocument();
	});

	it("numbers rows in role order — conditional first", () => {
		const rows = roleRows([CONFIGS.unitTests, CONFIGS.eslint]);
		render(<StackPreviewList rows={rows} />);
		const numbers = screen
			.getAllByText(/^[12]$/)
			.map((node) => node.textContent);
		expect(numbers).toEqual(["1", "2"]);
	});
});
