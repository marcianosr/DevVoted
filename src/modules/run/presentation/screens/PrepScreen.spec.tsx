import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

import { CONFIGS } from "~/modules/run/configs/configRoster.model";
import { PrepScreen } from "./PrepScreen.ui";

const base = {
	gateNumber: 1,
	pollsPerGate: 5,
	stripsOnFailure: 1,
	storageBillKb: 0,
	modifiers: {
		gateReward: 32,
		rewardMultiplier: 1,
		coverageMultiplier: 1,
		coverageAdd: 0,
	},
	configs: [CONFIGS.js, CONFIGS.eslint],
	editing: false,
	onDropConfig: vi.fn(),
	onEditPipeline: vi.fn(),
	onStartGate: vi.fn(),
};

describe(PrepScreen, () => {
	it("names the gate", () => {
		render(<PrepScreen {...base} />);
		expect(screen.getByText("Boulder gate")).toBeInTheDocument();
	});

	it("falls back to a plain number past the swatch roster", () => {
		render(<PrepScreen {...base} gateNumber={99} />);
		expect(screen.getByText("Gate 99 gate")).toBeInTheDocument();
	});

	it("shows the polls-per-window subcaption", () => {
		render(<PrepScreen {...base} pollsPerGate={5} />);
		expect(
			screen.getAllByText("polls this window", { exact: false }).length
		).toBeGreaterThan(0);
	});

	it("lists the gate's storage and coverage gain this gate", () => {
		render(<PrepScreen {...base} />);
		expect(
			screen.getByRole("heading", { name: "On clear" })
		).toBeInTheDocument();
		expect(screen.getByText("+32KB")).toHaveClass("text-gradient-green");
		expect(screen.getByText("×1")).toHaveClass("text-gradient-green");
	});

	it("captions the gate with its coverage multiplier", () => {
		render(
			<PrepScreen
				{...base}
				modifiers={{ ...base.modifiers, coverageMultiplier: 2, coverageAdd: 5 }}
			/>
		);
		expect(screen.getByText("×2 +5%")).toHaveClass("text-gradient-green");
	});

	it("states the window's objectives on the receipt", () => {
		render(<PrepScreen {...base} pollsPerGate={5} />);
		expect(
			screen.getByRole("heading", { name: "Objective" })
		).toBeInTheDocument();
		expect(screen.getByText("Clear your pipeline")).toBeInTheDocument();
		expect(screen.getByText("Answer 5 polls this window")).toBeInTheDocument();
	});

	it("states the stake as a plain count when it is not fatal", () => {
		render(<PrepScreen {...base} stripsOnFailure={1} />);
		expect(screen.getByText("Strip 1 config")).toHaveClass("text-cinnabar");
	});

	it("pluralizes the stake for more than one config", () => {
		render(
			<PrepScreen
				{...base}
				stripsOnFailure={2}
				configs={[CONFIGS.js, CONFIGS.eslint, CONFIGS.agentsMd]}
			/>
		);
		expect(screen.getByText("Strip 2 configs")).toBeInTheDocument();
	});

	it("warns the run is over once the stake would take the whole build", () => {
		render(<PrepScreen {...base} stripsOnFailure={2} configs={base.configs} />);
		expect(screen.getByText("Strip all — run over")).toBeInTheDocument();
	});

	it("names the storage plan's bill on a paid tier", () => {
		render(<PrepScreen {...base} storageBillKb={8} />);
		expect(screen.getByText("−8KB")).toHaveClass("text-cinnabar");
		expect(screen.getByText(/storage bill — pass or fail/)).toBeInTheDocument();
	});

	it("keeps the free tier's receipt bill-free", () => {
		render(<PrepScreen {...base} />);
		expect(
			screen.queryByText(/storage bill — pass or fail/)
		).not.toBeInTheDocument();
	});

	it("marks the gate name with its swatch colour", () => {
		render(<PrepScreen {...base} />);
		expect(screen.getByTestId("swatch")).toBeInTheDocument();
	});

	it("lists the installed configs as plain chips", () => {
		render(<PrepScreen {...base} />);
		expect(screen.getByText(".js")).toBeInTheDocument();
		expect(screen.getByText("ESLint")).toBeInTheDocument();
		expect(
			screen.queryByRole("button", { name: /^\.js/ })
		).not.toBeInTheDocument();
		expect(
			screen.queryByRole("button", { name: /^ESLint/ })
		).not.toBeInTheDocument();
	});

	it("reveals a remove action on every chip once editing", () => {
		render(<PrepScreen {...base} editing />);
		expect(screen.getByRole("button", { name: /^\.js/ })).toBeInTheDocument();
		expect(screen.getByRole("button", { name: /^ESLint/ })).toBeInTheDocument();
	});

	it("drops a config when its remove action is clicked while editing", () => {
		const onDropConfig = vi.fn();
		render(<PrepScreen {...base} editing onDropConfig={onDropConfig} />);
		fireEvent.click(screen.getByRole("button", { name: /ESLint/ }));
		expect(onDropConfig).toHaveBeenCalledWith("eslint");
	});

	it("keeps the last config non-interactive even while editing", () => {
		render(<PrepScreen {...base} editing configs={[CONFIGS.js]} />);
		expect(
			screen.queryByRole("button", { name: /^\.js/ })
		).not.toBeInTheDocument();
	});

	it("names the start action after the gate and fires onStartGate when clicked", () => {
		const onStartGate = vi.fn();
		render(<PrepScreen {...base} onStartGate={onStartGate} />);
		fireEvent.click(
			screen.getByRole("button", { name: "Start Boulder gate →" })
		);
		expect(onStartGate).toHaveBeenCalledTimes(1);
	});

	it("fires onEditPipeline and flips its own label once editing", () => {
		const onEditPipeline = vi.fn();
		const { rerender } = render(
			<PrepScreen {...base} onEditPipeline={onEditPipeline} />
		);
		fireEvent.click(screen.getByRole("button", { name: "Edit pipeline" }));
		expect(onEditPipeline).toHaveBeenCalledTimes(1);

		rerender(<PrepScreen {...base} editing onEditPipeline={onEditPipeline} />);
		expect(
			screen.getByRole("button", { name: "Done editing" })
		).toBeInTheDocument();
	});
});
