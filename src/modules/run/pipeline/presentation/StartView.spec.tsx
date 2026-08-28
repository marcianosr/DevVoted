import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { CONFIGS } from "~/modules/run/config/domain/configRoster.model";
import { STARTER_STACKS } from "~/modules/run/config/domain/stack.model";
import { createMockGateStake, createMockRunView } from "~/test/runView.factory";

import { StartView, type StartViewProps } from "./StartView.component";

const view = createMockRunView({
	gatesCleared: 0,
	configs: [],
	spots: 4,
	spotsUsed: 0,
	spotsFree: 4,
	available: Object.values(CONFIGS),
	gateStake: createMockGateStake({ gateNumber: 0, coverageDemand: 3 }),
});

const render_ = (overrides: Partial<StartViewProps> = {}) =>
	render(
		<StartView
			view={view}
			onToggle={() => {}}
			onPickStack={() => {}}
			onStart={() => {}}
			{...overrides}
		/>
	);

describe("StartView", () => {
	it("opens on the first gate, named", () => {
		render_();

		expect(
			screen.getByRole("heading", { name: "New run" })
		).toBeInTheDocument();
		expect(screen.getByText("Pallet gate")).toBeInTheDocument();
	});

	it("offers every starter stack by name, with its own blurb", () => {
		render_();

		for (const stack of STARTER_STACKS) {
			expect(screen.getByText(stack.name)).toBeInTheDocument();
			expect(screen.getByText(stack.blurb)).toBeInTheDocument();
		}
	});

	it("flags the one stack a first run should take", () => {
		render_();

		expect(screen.getAllByText("Recommended")).toHaveLength(1);
	});

	it("takes a whole stack in one press", async () => {
		const onPickStack = vi.fn();
		render_({ onPickStack });

		const [first] = screen.getAllByRole("button", { name: "take these" });
		await userEvent.click(first);

		expect(onPickStack).toHaveBeenCalledWith(STARTER_STACKS[0].id);
	});

	it("deals the stacks' configs once each", () => {
		render_();

		expect(screen.getAllByText(".js")).toHaveLength(1);
		expect(screen.getAllByText(".jsx")).toHaveLength(1);
		expect(screen.getByText(/dealt from/)).toBeInTheDocument();
	});

	it("lets a config be picked outside any stack", async () => {
		const onToggle = vi.fn();
		render_({ onToggle });

		await userEvent.click(screen.getByRole("checkbox", { name: /ESLint/ }));

		expect(onToggle).toHaveBeenCalledWith(CONFIGS.eslint.id);
	});

	it("draws each dealt config's grade as a run of cells", () => {
		render_();

		const row = screen.getByText(".js").closest("li");
		expect(row?.querySelectorAll('span[class*="size-1.5"]')).toHaveLength(1);
		expect(screen.queryByText("common")).not.toBeInTheDocument();
	});

	it("holds the run shut while the pipeline is bare", () => {
		render_({ view: createMockRunView({ ...view, canStart: false }) });

		expect(
			screen.getByRole("button", { name: "Pick a config to start" })
		).toBeDisabled();
	});

	it("starts with spots to spare, once the engine says it can", async () => {
		const onStart = vi.fn();
		render_({
			view: createMockRunView({
				...view,
				configs: [CONFIGS.js, CONFIGS.ts],
				canStart: true,
			}),
			onStart,
		});

		await userEvent.click(
			screen.getByRole("button", { name: "Start the run →" })
		);

		expect(onStart).toHaveBeenCalledOnce();
	});

	it("names no seed and no archive, having neither", () => {
		render_();

		expect(screen.queryByText(/^seed/)).not.toBeInTheDocument();
		expect(screen.queryByText("archive")).not.toBeInTheDocument();
	});

	it("badges each config's headline figure beside its name", () => {
		render_();

		expect(screen.getAllByText("×1.25").length).toBeGreaterThan(1);
		expect(screen.getAllByText("+0.5").length).toBeGreaterThan(0);
	});

	it("badges nothing for a config that prices in something else", () => {
		render_();

		const row = screen.getByText("ESLint").closest("li");
		if (!row) throw new Error("No ESLint row rendered");

		expect(row.querySelector(".bg-celadon\\/15")).not.toBeInTheDocument();
	});
});
