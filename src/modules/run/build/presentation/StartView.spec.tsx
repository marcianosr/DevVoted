import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { CONFIGS } from "~/modules/run/config/domain/configRoster.model";
import {
	NEW_RUN_BUILD_NOTE,
} from "~/modules/run/build/application/newRunScreen.viewmodel";
import { createMockRunView } from "~/test/runView.factory";

import { StartView } from "./StartView.component";

const noop = () => {};

const handlers = {
	onToggle: noop,
	onVendorLock: noop,
	onStart: noop,
};

const view = createMockRunView({
	status: "configuring",
	configs: [CONFIGS.js],
	available: [CONFIGS.js, CONFIGS.eslint, CONFIGS.unitTests],
	recommendedConfigIds: [CONFIGS.unitTests.id],
	slots: 4,
	canStart: true,
});

describe("StartView", () => {
	it("opens the run on gate 0 rather than on a gate already climbed", () => {
		render(<StartView view={view} {...handlers} />);

		expect(screen.getByText("New run")).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: /Pallet gate prep/ })
		).toBeInTheDocument();
	});

	it("deals the hand it was given", () => {
		render(<StartView view={view} {...handlers} />);

		expect(screen.getAllByText(CONFIGS.eslint.label).length).toBeGreaterThan(0);
		expect(
			screen.getAllByText(CONFIGS.unitTests.label).length
		).toBeGreaterThan(0);
	});

	it("lists the deal as the registry, under the name the shop uses", () => {
		render(<StartView view={view} {...handlers} />);

		expect(screen.getByText("Registry")).toBeInTheDocument();
	});

	it("stands an installed config in the build as well as the registry", () => {
		render(<StartView view={view} {...handlers} />);

		expect(screen.getAllByText(CONFIGS.js.label).length).toBeGreaterThan(1);
	});

	it("says a slot is paid for out of the archive, not the run", () => {
		render(<StartView view={view} {...handlers} />);

		expect(screen.getByText(NEW_RUN_BUILD_NOTE)).toBeInTheDocument();
	});

	it("marks the hand's advice without requiring it", () => {
		render(<StartView view={view} {...handlers} />);

		expect(screen.getByText("suggested")).toBeInTheDocument();
	});

	it("installs a config from the hand", async () => {
		const onToggle = vi.fn();
		render(<StartView view={view} {...handlers} onToggle={onToggle} />);

		const install = screen.getAllByRole("button", { name: /install/i })[0];
		await userEvent.click(install);
		expect(onToggle).toHaveBeenCalled();
	});

	it("prices no band, leaving the stakes to the prep screen it leads to", () => {
		render(<StartView view={view} {...handlers} />);

		expect(
			screen.queryByRole("heading", { name: "Objectives and rewards" })
		).toBeNull();
	});

	it("sells no room at all, because every run opens on the free four (ADR-074)", () => {
		render(<StartView view={view} {...handlers} />);

		expect(screen.queryByRole("button", { name: /^buy slot/ })).toBeNull();
	});

	it("draws no row for a slot that is merely empty", () => {
		render(<StartView view={view} {...handlers} />);

		expect(screen.queryByText("empty slot")).not.toBeInTheDocument();
	});

	it("leads to the gate's prep from the footer", async () => {
		const onStart = vi.fn();
		render(<StartView view={view} {...handlers} onStart={onStart} />);

		await userEvent.click(
			screen.getByRole("button", { name: /Pallet gate prep/ })
		);
		expect(onStart).toHaveBeenCalled();
	});

	it("refuses the start while the build cannot run", () => {
		render(
			<StartView
				view={createMockRunView({ ...view, canStart: false })}
				{...handlers}
			/>
		);

		expect(
			screen.getByRole("button", { name: /Pallet gate prep/ })
		).toBeDisabled();
	});
	it("holds the start while vendor lock-in names nobody", () => {
		render(
			<StartView
				view={createMockRunView({
					...view,
					configs: [CONFIGS.vendorLockIn, CONFIGS.agentsMd],
					vendorLock: { offered: true },
				})}
				{...handlers}
			/>
		);

		expect(
			screen.getByRole("button", { name: /Pallet gate prep/ })
		).toBeDisabled();
		expect(screen.getByText(/pick the config it exempts/)).toBeInTheDocument();
	});

	it("offers the pick on every config but the vendor itself", async () => {
		const onVendorLock = vi.fn();
		render(
			<StartView
				view={createMockRunView({
					...view,
					configs: [CONFIGS.vendorLockIn, CONFIGS.agentsMd],
					vendorLock: { offered: true },
				})}
				{...handlers}
				onVendorLock={onVendorLock}
			/>
		);

		expect(screen.getAllByText("lock in")).toHaveLength(1);

		await userEvent.click(screen.getByText("lock in"));
		expect(onVendorLock).toHaveBeenCalledWith(CONFIGS.agentsMd.id);
	});

	it("takes the uninstall press off the config it locked in", () => {
		render(
			<StartView
				view={createMockRunView({
					...view,
					configs: [CONFIGS.vendorLockIn, CONFIGS.agentsMd],
					vendorLock: { offered: false, lockedConfigId: CONFIGS.agentsMd.id },
				})}
				{...handlers}
			/>
		);

		expect(screen.getByText("locked in")).toBeInTheDocument();
		expect(
			screen.queryByRole("button", {
				name: `Uninstall ${CONFIGS.agentsMd.label}`,
			})
		).not.toBeInTheDocument();
	});
});
