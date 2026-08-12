import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

import { CONFIGS } from "~/modules/run/config/domain/configRoster.model";
import { PrepScreen } from "~/modules/run/run/presentation/PrepScreen.ui";

const base = {
	gateNumber: 1,
	pollsPerGate: 5,
	stripsOnFailure: 1,
	minConfigs: 1,
	storageBillKb: 0,
	modifiers: {
		gateReward: 32,
		rewardMultiplier: 1,
		coverageMultiplier: 1,
		coverageAdd: 0,
	},
	perAnswer: {
		coveragePerCorrect: 1,
		storageKbPerCorrect: 0,
	},
	configs: [CONFIGS.js, CONFIGS.eslint],
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
		expect(screen.getByText(/5 polls/)).toBeInTheDocument();
	});

	it("shows the gate's storage reward, not a trivial coverage multiplier", () => {
		render(<PrepScreen {...base} />);
		expect(screen.getByText("Succeed your build:")).toBeInTheDocument();
		expect(screen.getByText("+32KB")).toHaveClass("text-gradient-green");
		expect(screen.queryByText("×1")).not.toBeInTheDocument();
	});

	it("captions the gate with its coverage multiplier", () => {
		render(
			<PrepScreen
				{...base}
				modifiers={{ ...base.modifiers, coverageMultiplier: 2, coverageAdd: 5 }}
			/>
		);
		expect(screen.getByText("×2 +5% coverage this gate")).toHaveClass(
			"text-gradient-green"
		);
	});

	it("keeps the stake in plain language, no pipeline jargon", () => {
		render(<PrepScreen {...base} />);
		expect(screen.queryByText(/Clear your pipeline/)).not.toBeInTheDocument();
		expect(
			screen.queryByText(/satisfy your config checks/)
		).not.toBeInTheDocument();
	});

	it("states the stake as a plain count when it is not fatal", () => {
		render(<PrepScreen {...base} stripsOnFailure={1} />);
		expect(screen.getByText("Remove 1 config")).toHaveClass("text-cinnabar");
	});

	it("pluralizes the stake for more than one config", () => {
		render(
			<PrepScreen
				{...base}
				stripsOnFailure={2}
				configs={[CONFIGS.js, CONFIGS.eslint, CONFIGS.agentsMd]}
			/>
		);
		expect(screen.getByText("Remove 2 configs")).toBeInTheDocument();
	});

	it("warns the run is over once the stake would take the whole build", () => {
		render(<PrepScreen {...base} stripsOnFailure={2} configs={base.configs} />);
		expect(
			screen.getByText("All configs disabled — run over")
		).toBeInTheDocument();
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

	it("mentions the gate's width demand in the build summary", () => {
		render(<PrepScreen {...base} minConfigs={2} />);
		expect(screen.getByText(/2\+ configs/)).toBeInTheDocument();
	});

	it("names the shortfall in cinnabar while the build sits under the demand", () => {
		render(<PrepScreen {...base} minConfigs={3} />);
		expect(
			screen.getByText(
				"Demands 3 configs — the build holds 2. Install 1 more to climb on."
			)
		).toHaveClass("text-cinnabar");
	});

	it("names the start action after the gate and fires onStartGate when clicked", () => {
		const onStartGate = vi.fn();
		render(<PrepScreen {...base} onStartGate={onStartGate} />);
		fireEvent.click(
			screen.getByRole("button", { name: "Start Boulder gate →" })
		);
		expect(onStartGate).toHaveBeenCalledTimes(1);
	});

	it("offers the back-to-shop shortcut beside the stake while the shop is open", () => {
		const onClick = vi.fn();
		render(
			<PrepScreen
				{...base}
				minConfigs={2}
				shopAction={{ label: "← Back to shop", onClick }}
			/>
		);
		fireEvent.click(screen.getByRole("button", { name: "← Back to shop" }));
		expect(onClick).toHaveBeenCalledTimes(1);
	});

	it("leaves the shortcut out when no shop sits behind prep", () => {
		render(<PrepScreen {...base} minConfigs={2} />);
		expect(
			screen.queryByRole("button", { name: "← Back to shop" })
		).not.toBeInTheDocument();
	});

	it("locks the start button behind the wait copy until the next polls open", () => {
		const onStartGate = vi.fn();
		render(
			<PrepScreen
				{...base}
				startLock="New polls in 7h 23m"
				onStartGate={onStartGate}
			/>
		);
		const locked = screen.getByRole("button", { name: "New polls in 7h 23m" });
		expect(locked).toBeDisabled();
		expect(
			screen.queryByRole("button", { name: /Start .* gate/ })
		).not.toBeInTheDocument();
	});
});
