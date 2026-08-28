import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { Pipeline, type PipelineRow } from "./Pipeline.ui";

const ONLINE: PipelineRow = {
	id: "intellisense",
	label: "Intellisense",
	rarity: "nibble",
	status: { kind: "online" },
	figure: { kind: "multiplier", value: 1.5 },
};

const SKIPPED: PipelineRow = {
	id: "eslint",
	label: "ESLint",
	rarity: "bit",
	status: {
		kind: "skipped",
		why: { kind: "otherCategories", categories: ["js", "ts"] },
	},
	figure: { kind: "multiplier", value: 1 },
};

const OFFLINE: PipelineRow = {
	id: "ts",
	label: ".ts",
	rarity: "bit",
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

		expect(screen.getByText("1 will apply")).toBeInTheDocument();
		expect(screen.getByText("1 offline")).toBeInTheDocument();
		expect(screen.queryByText("1 skipped")).not.toBeInTheDocument();
	});

	it("leaves out a status nothing is in", () => {
		render(<Pipeline configs={[ONLINE]} />);

		expect(screen.getByText("1 will apply")).toBeInTheDocument();
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

		expect(screen.getByText("js and ts only")).toBeInTheDocument();
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

		expect(screen.getByText("bills at the gate clear")).toBeInTheDocument();
	});

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
			screen.getByText("the run's storage cap is spent")
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

describe("a settled pipeline", () => {
	it("trades the rate for a filled badge naming what was paid", () => {
		render(<Pipeline settled configs={[{ ...ONLINE, fired: 0.5 }, SKIPPED]} />);

		expect(screen.getByText("paid +0.5")).toBeInTheDocument();
		expect(screen.queryByText("×1.5")).not.toBeInTheDocument();
	});

	it("badges the KB a faucet config just paid", () => {
		render(<Pipeline settled configs={[{ ...ONLINE, firedKb: 8 }]} />);

		expect(screen.getByText("paid +8 KB")).toBeInTheDocument();
	});

	it("badges a loss in its own colour rather than hiding it", () => {
		render(<Pipeline settled configs={[{ ...ONLINE, fired: -0.5 }]} />);

		expect(screen.getByText("paid −0.5")).toBeInTheDocument();
	});

	it("counts delivery, not promise: applied against skipped", () => {
		render(
			<Pipeline
				settled
				configs={[{ ...ONLINE, fired: 0.5 }, SKIPPED, { ...ONLINE, id: "x" }]}
			/>
		);

		expect(screen.getByText("1 applied")).toBeInTheDocument();
		expect(screen.getByText("2 skipped")).toBeInTheDocument();
	});

	it("owns up for an online row that paid nothing — it reads unused", () => {
		render(<Pipeline settled configs={[ONLINE]} />);

		expect(screen.getByText("unused")).toBeInTheDocument();
		expect(screen.queryByText("×1.5")).not.toBeInTheDocument();
	});

	it("drops the skipped prefix — the hollow dot already says it", () => {
		render(<Pipeline settled configs={[SKIPPED]} />);

		expect(screen.getByText("js and ts only")).toBeInTheDocument();
		expect(screen.queryByText(/skipped ·/)).not.toBeInTheDocument();
	});

	it("keeps an offline row exactly as the audit left it", () => {
		render(<Pipeline settled configs={[OFFLINE]} />);

		expect(screen.getByText(/offline · Dependency Outage/)).toBeInTheDocument();
		expect(screen.getByText("1 offline")).toBeInTheDocument();
	});
});
