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
	slots: 3,
	nextSlotGate: 2,
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

	// ADR-026: three openings, each a flavour decision the name carries.
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

	// `.js` is in two stacks, so the deal is what they are built from, deduped —
	// not nine rows with a repeat.
	it("deals the stacks' configs once each", () => {
		render_();

		// Exact text, not /\.js/ — that regex also catches .jsx, which is a
		// different config in a different stack.
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

	// Rarity replaced the family tag as the row's one-word read: a family named
	// the mechanic, which the row's own sentence already does.
	it("marks each dealt config with the rarity it was drawn at", () => {
		render_();

		expect(screen.getAllByText("common").length).toBeGreaterThan(0);
	});

	it("holds the run shut until the build is wide enough to start", () => {
		render_();

		expect(
			screen.getByRole("button", { name: "Pick 3 to start" })
		).toBeDisabled();
	});

	it("starts once the slots are filled", async () => {
		const onStart = vi.fn();
		render_({
			view: createMockRunView({
				...view,
				configs: [CONFIGS.js, CONFIGS.ts, CONFIGS.eslint],
			}),
			onStart,
		});

		await userEvent.click(
			screen.getByRole("button", { name: "Start the run →" })
		);

		expect(onStart).toHaveBeenCalledOnce();
	});

	it("shows the gate that grants the fourth slot", () => {
		render_();

		expect(screen.getByText("opens when gate 2 clears")).toBeInTheDocument();
	});

	// No seed and nothing banked in the rig — say less rather than invent a figure.
	it("names no seed and no archive, having neither", () => {
		render_();

		expect(screen.queryByText(/^seed/)).not.toBeInTheDocument();
		expect(screen.queryByText("archive")).not.toBeInTheDocument();
	});

	// The figure is in the explainer's prose too, but a sentence is not something
	// you compare three rows on.
	it("badges each config's headline figure beside its name", () => {
		render_();

		// .ts, .js, .jsx, .vue, .java, .git all sit at ×1.25 on level 1.
		expect(screen.getAllByText("×1.25").length).toBeGreaterThan(1);
		// Code Coverage adds flat coverage rather than multiplying it.
		expect(screen.getByText("+0.5")).toBeInTheDocument();
	});

	it("badges nothing for a config that prices in something else", () => {
		render_();

		// ESLint charges a doubling fee — there is no one figure to state.
		const row = screen.getByText("ESLint").closest("li");
		if (!row) throw new Error("No ESLint row rendered");

		expect(row.querySelector(".bg-celadon\\/15")).not.toBeInTheDocument();
	});
});
