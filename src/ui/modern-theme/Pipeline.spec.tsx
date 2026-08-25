import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { Pipeline, type PipelineRow } from "./Pipeline.ui";

const ONLINE: PipelineRow = {
	id: "intellisense",
	label: "Intellisense",
	rarity: "rare",
	status: { kind: "online" },
	figure: { kind: "multiplier", value: 1.5 },
};

const SKIPPED: PipelineRow = {
	id: "eslint",
	label: "ESLint",
	rarity: "common",
	status: {
		kind: "skipped",
		why: { kind: "otherCategories", categories: ["js", "ts"] },
	},
	figure: { kind: "multiplier", value: 1 },
};

const OFFLINE: PipelineRow = {
	id: "ts",
	label: ".ts",
	rarity: "common",
	status: { kind: "offline", audit: "Dependency Outage" },
	figure: { kind: "multiplier", value: 1.25 },
};

describe("Pipeline", () => {
	it("names every installed config, whatever its status", () => {
		render(<Pipeline configs={[ONLINE, SKIPPED, OFFLINE]} />);

		expect(screen.getByText("Intellisense")).toBeInTheDocument();
		expect(screen.getByText("ESLint")).toBeInTheDocument();
		expect(screen.getByText(".ts")).toBeInTheDocument();
	});

	it("counts the build by status rather than against its slots", () => {
		render(<Pipeline configs={[ONLINE, SKIPPED, OFFLINE]} />);

		expect(screen.getByText("1 online")).toBeInTheDocument();
		expect(screen.getByText("1 skipped")).toBeInTheDocument();
		expect(screen.getByText("1 offline")).toBeInTheDocument();
	});

	// A zero is not a state the build is in, and three counters with two zeroes
	// read as a legend for the dots instead of a reading of the pipeline.
	it("leaves out a status nothing is in", () => {
		render(<Pipeline configs={[ONLINE]} />);

		expect(screen.getByText("1 online")).toBeInTheDocument();
		expect(screen.queryByText("0 skipped")).not.toBeInTheDocument();
		expect(screen.queryByText("0 offline")).not.toBeInTheDocument();
	});

	it("shows the figure only where it is being earned", () => {
		render(<Pipeline configs={[ONLINE, SKIPPED]} />);

		expect(screen.getByText("×1.5")).toBeInTheDocument();
		expect(screen.queryByText("×1")).not.toBeInTheDocument();
	});

	it("says which categories a skipped config was waiting for", () => {
		render(<Pipeline configs={[SKIPPED]} />);

		expect(screen.getByText("skipped · js and ts only")).toBeInTheDocument();
	});

	it("states the timing when a config pays somewhere other than this poll", () => {
		render(
			<Pipeline
				configs={[
					{
						...SKIPPED,
						id: "freemium",
						label: "Freemium",
						status: { kind: "skipped", why: { kind: "billsAtGateClear" } },
					},
				]}
			/>
		);

		expect(
			screen.getByText("skipped · bills at the gate clear")
		).toBeInTheDocument();
	});

	// Struck through and blamed, never dimmed: the name is what the player came
	// to the rail to read.
	it("strikes an offline config through and names the audit holding it", () => {
		const { container } = render(<Pipeline configs={[OFFLINE]} />);

		expect(screen.getByText(".ts")).toHaveClass("line-through");
		expect(screen.getByText("offline · Dependency Outage")).toBeInTheDocument();
		expect(container.querySelector(".opacity-50")).not.toBeInTheDocument();
	});

	it("announces the status of a row that says nothing in text", () => {
		render(<Pipeline configs={[ONLINE]} />);

		expect(screen.getByText("online")).toBeInTheDocument();
	});

	// The rate is a fact about the config; the budget is a fact about the run.
	// Showing only the rate reads as a faucet that never runs dry.
	it("counts down the budget a figure is drawn from, beside the figure", () => {
		render(
			<Pipeline
				configs={[
					{
						...ONLINE,
						id: "indexed-db",
						label: "IndexedDB",
						figure: { kind: "kb", value: 8 },
						remainingKb: 312,
					},
				]}
			/>
		);

		expect(screen.getByText("312 KB left")).toBeInTheDocument();
		expect(screen.getByText("+8 KB")).toBeInTheDocument();
	});

	it("leaves a config with no budget of its own unqualified", () => {
		render(<Pipeline configs={[ONLINE]} />);

		expect(screen.queryByText(/left$/)).not.toBeInTheDocument();
	});

	it("blames the run's cap when a spent faucet sits a poll out", () => {
		render(
			<Pipeline
				configs={[
					{
						...ONLINE,
						id: "indexed-db",
						label: "IndexedDB",
						status: { kind: "skipped", why: { kind: "runCapReached" } },
						figure: { kind: "kb", value: 8 },
					},
				]}
			/>
		);

		expect(
			screen.getByText("skipped · the run's storage cap is spent")
		).toBeInTheDocument();
		expect(screen.queryByText("+8 KB")).not.toBeInTheDocument();
	});

	it("hands an online config's paid action the trailing slot", () => {
		render(
			<Pipeline
				configs={[
					{
						...SKIPPED,
						status: { kind: "online" },
						action: {
							label: "cross out",
							on: "ESLint",
							cost: "8 KB",
							onUse: () => undefined,
						},
					},
				]}
			/>
		);

		expect(
			screen.getByRole("button", { name: /cross out/ })
		).toBeInTheDocument();
	});
});
