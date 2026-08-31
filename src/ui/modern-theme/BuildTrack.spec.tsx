import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { BuildTrack } from "./BuildTrack.ui";
import type { BuildRow } from "./Build.ui";

const ts: BuildRow = {
	id: "ts",
	label: ".ts",
	slots: 1,
	status: { kind: "online" },
	figure: { kind: "multiplier", value: 1.25 },
};

const coverage: BuildRow = {
	id: "code-coverage",
	label: "Code Coverage",
	slots: 2,
	status: { kind: "online" },
	figure: { kind: "coverage", value: 0.5 },
};

const js: BuildRow = {
	id: "js",
	label: ".js",
	slots: 1,
	status: {
		kind: "skipped",
		why: { kind: "otherCategories", categories: ["js"] },
	},
	figure: { kind: "multiplier", value: 1.25 },
};

const agents: BuildRow = {
	id: "agents",
	label: "AGENTS.md",
	slots: 1,
	status: { kind: "offline", audit: "Dependency Outage" },
};

const track = () => screen.getByRole("list", { name: /build/i });

const widthsIn = (): string[] =>
	Array.from(track().children).map((cell) =>
		cell instanceof HTMLElement ? cell.style.width : ""
	);

describe("BuildTrack", () => {
	it("gives each config a box as wide as the slots it takes", () => {
		render(<BuildTrack configs={[ts, coverage]} slots={4} maxSlots={4} />);

		expect(widthsIn()).toEqual(["25%", "50%", "25%"]);
	});

	it("quotes an online config's rate, since that is what it pays here", () => {
		render(<BuildTrack configs={[ts, coverage]} slots={4} maxSlots={4} />);

		expect(screen.getByText("×1.25")).toBeInTheDocument();
		expect(screen.getByText("+0.5")).toBeInTheDocument();
	});

	it("says why a skipped config is sitting this poll out", () => {
		render(<BuildTrack configs={[js]} slots={4} maxSlots={4} />);

		expect(screen.getByText("js only")).toBeInTheDocument();
	});

	it("names an online config with no rate rather than leaving the line blank", () => {
		render(
			<BuildTrack
				configs={[{ ...ts, figure: undefined }]}
				slots={4}
				maxSlots={4}
			/>
		);

		expect(screen.getByText("online")).toBeInTheDocument();
	});

	it("strikes an offline config through and names the audit that downed it", () => {
		render(<BuildTrack configs={[agents]} slots={4} maxSlots={4} />);

		expect(screen.getByText("AGENTS.md")).toHaveClass("line-through");
		expect(
			screen.getByText("AGENTS.md · offline · Dependency Outage")
		).toBeInTheDocument();
	});

	it("heads the track with what is broken and names the audit once", () => {
		render(
			<BuildTrack
				configs={[ts, agents, { ...agents, id: "biome", label: "Biome" }]}
				slots={4}
				maxSlots={4}
			/>
		);

		expect(
			screen.getByText("2 offline · Dependency Outage")
		).toBeInTheDocument();
	});

	it("leaves the heading bare when the whole build is standing", () => {
		render(<BuildTrack configs={[ts, js]} slots={4} maxSlots={4} />);

		expect(screen.queryByText(/offline/)).not.toBeInTheDocument();
		expect(screen.getByText("Build")).toBeInTheDocument();
	});

	it("draws one dashed box per free slot, so vacancy is countable", () => {
		render(<BuildTrack configs={[ts]} slots={4} maxSlots={4} />);

		expect(screen.getAllByText("free")).toHaveLength(3);
	});

	it("ends in a one-slot hatched stub while there is room left to buy", () => {
		render(<BuildTrack configs={[ts]} slots={2} maxSlots={8} />);

		expect(track().children).toHaveLength(3);
		expect(new Set(widthsIn()).size).toBe(1);
		expect(
			screen.getAllByText("Buy a slot in the shop for more room")
		).not.toHaveLength(0);
	});

	it("drops the stub once the ladder has nothing left to sell", () => {
		render(<BuildTrack configs={[ts]} slots={2} maxSlots={2} />);

		expect(track().children).toHaveLength(2);
		expect(
			screen.queryByText("Buy a slot in the shop for more room")
		).not.toBeInTheDocument();
	});
});

describe("a track that folds on narrow screens", () => {
	it("offers no press until a caller can remember it was folded", () => {
		render(<BuildTrack configs={[ts]} slots={2} maxSlots={2} />);

		expect(
			screen.queryByRole("button", { name: /build/i })
		).not.toBeInTheDocument();
	});

	it("reports the press rather than folding itself", async () => {
		const onToggle = vi.fn();
		render(
			<BuildTrack
				configs={[ts]}
				slots={2}
				maxSlots={2}
				open={false}
				onToggle={onToggle}
			/>
		);

		const press = screen.getByRole("button", { name: /build/i });
		expect(press).toHaveAttribute("aria-expanded", "false");

		await userEvent.click(press);

		expect(onToggle).toHaveBeenCalledOnce();
	});

	it("keeps a shut track drawn above lg, where there is room for the band", () => {
		render(
			<BuildTrack
				configs={[ts]}
				slots={2}
				maxSlots={2}
				open={false}
				onToggle={vi.fn()}
			/>
		);

		expect(track()).toHaveClass("hidden", "lg:flex");
	});

	it("states what is offline on the press itself, which a shut track hides", () => {
		render(
			<BuildTrack
				configs={[agents]}
				slots={2}
				maxSlots={2}
				open={false}
				onToggle={vi.fn()}
			/>
		);

		expect(
			screen.getByRole("button", {
				name: /1 offline · Dependency Outage/,
			})
		).toBeInTheDocument();
	});
});

describe("a config with a paid action", () => {
	const withAction = (onUse: () => void): BuildRow => ({
		...ts,
		action: { label: "cross out", on: ".ts", cost: "8 KB", onUse },
	});

	it("turns the cell itself into the button, cost on the second line", async () => {
		const onUse = vi.fn();
		render(<BuildTrack configs={[withAction(onUse)]} slots={2} maxSlots={2} />);

		await userEvent.click(screen.getByRole("button", { name: /cross out/ }));

		expect(screen.getByText("cross out 8 KB")).toBeInTheDocument();
		expect(onUse).toHaveBeenCalledOnce();
	});

	it("trades the rate for the action — the cell has one line to spend", () => {
		render(
			<BuildTrack configs={[withAction(vi.fn())]} slots={2} maxSlots={2} />
		);

		expect(screen.queryByText("×1.25")).not.toBeInTheDocument();
	});

	it("disables the press and says what is short when it cannot be paid", () => {
		render(
			<BuildTrack
				configs={[
					{
						...ts,
						action: {
							label: "cross out",
							on: ".ts",
							cost: "8 KB",
							disabled: true,
							hint: "Costs 8KB — you have 3KB",
							onUse: vi.fn(),
						},
					},
				]}
				slots={2}
				maxSlots={2}
			/>
		);

		expect(screen.getByRole("button", { name: /cross out/ })).toBeDisabled();
		expect(screen.getByText(/Costs 8KB — you have 3KB/)).toBeInTheDocument();
	});
});

describe("a settled track", () => {
	it("badges what each config paid rather than what it promised", () => {
		render(
			<BuildTrack
				settled
				configs={[
					{ ...ts, fired: 0.5 },
					{ ...coverage, firedKb: 8 },
				]}
				slots={4}
				maxSlots={4}
			/>
		);

		expect(screen.getByText("paid +0.5")).toBeInTheDocument();
		expect(screen.getByText("paid +8 KB")).toBeInTheDocument();
		expect(screen.queryByText("×1.25")).not.toBeInTheDocument();
	});

	it("owns up for an online config that paid nothing", () => {
		render(<BuildTrack settled configs={[ts]} slots={2} maxSlots={2} />);

		expect(screen.getByText("unused")).toBeInTheDocument();
	});

	it("stops offering the action — the poll is already answered", () => {
		render(
			<BuildTrack
				settled
				configs={[
					{
						...ts,
						fired: 0.5,
						action: {
							label: "cross out",
							on: ".ts",
							cost: "8 KB",
							onUse: vi.fn(),
						},
					},
				]}
				slots={2}
				maxSlots={2}
			/>
		);

		expect(screen.queryByRole("button")).not.toBeInTheDocument();
	});
});
