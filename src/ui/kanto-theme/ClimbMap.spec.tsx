import { describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import type { LadderGate } from "~/modules/run/community/application/climbLadder.viewmodel";

import { ClimbMap, COPY } from "./ClimbMap.ui";
import { COPY as CARD_COPY, type ClimberCardProps } from "./ClimberCard.ui";

const gate = (over: Partial<LadderGate> & { gate: number }): LadderGate => ({
	name: `Gate ${over.gate}`,
	theme: "pallet",
	finish: "flat",
	current: false,
	uncharted: false,
	best: false,
	climbers: [],
	fallen: [],
	...over,
});

const chip = (name: string, over = {}) => ({
	id: name.toLowerCase(),
	name,
	you: false,
	rival: false,
	rescued: false,
	...over,
});

const MISTY_BUILD = [
	{ name: ".ts", slots: 1, version: 4, badges: [] },
	{ name: "Cache", slots: 4, badges: [] },
];

const cardFor = (
	name: string,
	over: Partial<ClimberCardProps> = {}
): ClimberCardProps => ({
	name,
	gate: "gate 6 · Soul",
	weight: "5 of 6 weight",
	build: MISTY_BUILD,
	stats: [],
	...over,
});

const GATES: LadderGate[] = [
	gate({ gate: 0, name: "Pallet" }),
	gate({
		gate: 1,
		name: "Boulder",
		climbers: [chip("Koga"), chip("Brock", { rival: true })],
	}),
	gate({
		gate: 2,
		name: "Cascade",
		current: true,
		climbers: [chip("Marciano", { you: true })],
		fallen: [
			{
				...chip("Blaine"),
				runKey: "77",
				card: cardFor("Blaine", { build: [] }),
			},
		],
	}),
	gate({ gate: 3, name: "Thunder", best: true }),
	gate({ gate: 4, name: "Lavender", uncharted: true }),
];

describe("ClimbMap", () => {
	it("draws every gate of the ladder by number and name", () => {
		render(<ClimbMap gates={GATES} />);

		expect(screen.getByText("Pallet")).toBeInTheDocument();
		expect(screen.getByText("Lavender")).toBeInTheDocument();
		expect(screen.getAllByRole("listitem")).toHaveLength(GATES.length);
	});

	it("stands the viewer on their own gate, so the track knows where to open", () => {
		const { container } = render(<ClimbMap gates={GATES} />);

		const current = container.querySelectorAll("[data-current]");
		expect(current).toHaveLength(1);
		expect(current[0]).toHaveTextContent("Cascade");
	});

	it("dims the gates nobody has charted yet", () => {
		const { container } = render(<ClimbMap gates={GATES} />);

		const uncharted = container.querySelectorAll("[data-uncharted]");
		expect(uncharted).toHaveLength(1);
		expect(uncharted[0]).toHaveTextContent("Lavender");
	});

	it("stars the deepest gate the viewer ever finished on, and only that one", () => {
		render(<ClimbMap gates={GATES} />);

		const best = screen.getAllByTitle(COPY.best);
		expect(best).toHaveLength(1);
	});

	it("stacks everyone standing at a gate under it", () => {
		render(<ClimbMap gates={GATES} />);

		expect(screen.getByTitle("Koga")).toBeInTheDocument();
		expect(screen.getByTitle("Brock")).toBeInTheDocument();
	});

	it("counts the crowd it cannot draw rather than drawing every chip", () => {
		render(
			<ClimbMap
				gates={[
					gate({
						gate: 0,
						climbers: [
							chip("A"),
							chip("B"),
							chip("C"),
							chip("D"),
							chip("E"),
							chip("F"),
						],
					}),
				]}
			/>
		);

		expect(screen.getByText("+2")).toBeInTheDocument();
		expect(screen.queryByTitle("F")).toBeNull();
	});

	it("parks the runs a gate killed today in a lane of their own", () => {
		const { container } = render(<ClimbMap gates={GATES} />);
		const fallen = container.querySelector("[data-fallen]");

		expect(within(fallen as HTMLElement).getByTitle("Blaine")).toBeVisible();
	});

	it("opens a climber's build when their chip is pressed", async () => {
		const user = userEvent.setup();
		const onInspect = vi.fn();
		render(<ClimbMap gates={GATES} onInspect={onInspect} />);

		await user.click(screen.getByRole("button", { name: /Koga/ }));

		expect(onInspect).toHaveBeenCalledWith("koga");
	});

	it("opens the climber's card when their chip is the open one", () => {
		render(
			<ClimbMap
				gates={[
					gate({
						gate: 6,
						name: "Soul",
						climbers: [chip("Misty", { card: cardFor("Misty") })],
					}),
				]}
				openId="misty"
				onInspect={vi.fn()}
			/>
		);

		expect(screen.getByText(".ts")).toBeInTheDocument();
		expect(screen.getByText("gate 6 · Soul")).toBeInTheDocument();
		expect(screen.getByText("5 of 6 weight")).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "Misty" })).toHaveAttribute(
			"aria-pressed",
			"true"
		);
	});

	it("hangs the card off the map rather than inside the scrolling track", () => {
		const { container } = render(
			<ClimbMap
				gates={[
					gate({
						gate: 6,
						name: "Soul",
						climbers: [chip("Misty", { card: cardFor("Misty") })],
					}),
				]}
				openId="misty"
				onInspect={vi.fn()}
			/>
		);

		const panel = container.querySelector(".sm\\:absolute");
		expect(panel).toHaveClass("inset-x-4", "bottom-4");
		expect(panel?.closest("ul")).toBeNull();
	});

	it("draws no card for a climber the map knows nothing more about", () => {
		render(
			<ClimbMap
				gates={[gate({ gate: 6, climbers: [chip("Misty")] })]}
				openId="misty"
				onInspect={vi.fn()}
			/>
		);

		expect(screen.queryByText(CARD_COPY.privately)).toBeNull();
	});

	it("says so when the open climber runs nothing at all", () => {
		render(
			<ClimbMap
				gates={[
					gate({
						gate: 0,
						climbers: [chip("Oak", { card: cardFor("Oak", { build: [] }) })],
					}),
				]}
				openId="oak"
				onInspect={vi.fn()}
			/>
		);

		expect(screen.getByText(CARD_COPY.nothingInstalled)).toBeInTheDocument();
	});

	it("opens a fallen run's build by its own run, not by its player", async () => {
		const user = userEvent.setup();
		const onInspect = vi.fn();
		render(<ClimbMap gates={GATES} onInspect={onInspect} />);

		await user.click(screen.getByRole("button", { name: /Blaine/ }));

		expect(onInspect).toHaveBeenCalledWith("77");
	});

	it("leaves the chips inert when nothing can open a build", () => {
		render(<ClimbMap gates={GATES} />);

		expect(screen.queryAllByRole("button")).toHaveLength(0);
		expect(screen.getByTitle("Koga")).toBeInTheDocument();
	});

	it("reads out what every mark on the track means", () => {
		render(<ClimbMap gates={GATES} />);

		expect(screen.getByText(COPY.you)).toBeInTheDocument();
		expect(screen.getByText(COPY.rival)).toBeInTheDocument();
		expect(screen.getByText(COPY.fallen)).toBeInTheDocument();
		expect(screen.getByText(COPY.marks)).toBeInTheDocument();
	});
});
