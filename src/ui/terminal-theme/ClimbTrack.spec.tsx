import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";

import { ClimbTrack, type TrackGate } from "./ClimbTrack.ui";

const gate = (
	over: Partial<TrackGate> & Pick<TrackGate, "gate">
): TrackGate => ({
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

const climber = (id: string, you = false) => ({
	id,
	name: id,
	you,
});

describe("ClimbTrack", () => {
	it("stacks the climbers under their own gate", () => {
		render(
			<ClimbTrack
				gates={[
					gate({ gate: 0 }),
					gate({ gate: 1, climbers: [climber("owen"), climber("lisa")] }),
				]}
			/>
		);

		const columns = screen.getAllByRole("listitem");
		expect(within(columns[0]).queryByTitle("owen")).not.toBeInTheDocument();
		expect(within(columns[1]).getByTitle("owen")).toBeInTheDocument();
		expect(within(columns[1]).getByTitle("lisa")).toBeInTheDocument();
	});

	it("folds a crowd behind an overflow count", () => {
		const crowd = ["a", "b", "c", "d", "e", "f"].map((id) => climber(id));
		render(<ClimbTrack gates={[gate({ gate: 2, climbers: crowd })]} />);

		expect(screen.getByText("+2")).toBeInTheDocument();
		expect(screen.queryByTitle("e")).not.toBeInTheDocument();
	});

	it("labels the viewer's chip as you", () => {
		render(
			<ClimbTrack
				gates={[gate({ gate: 3, climbers: [climber("red", true)] })]}
			/>
		);

		expect(screen.getByTitle("you")).toBeInTheDocument();
	});

	it("dims the fallen into their own lane", () => {
		render(
			<ClimbTrack
				gates={[
					gate({
						gate: 4,
						fallen: [{ ...climber("koga"), runKey: "run-11" }],
					}),
				]}
			/>
		);

		const chip = screen.getByTitle("koga");
		expect(chip.className).toContain("grayscale");
	});

	it("marks the viewer's personal best", () => {
		render(<ClimbTrack gates={[gate({ gate: 5, best: true })]} />);

		expect(screen.getByTitle("your best")).toBeInTheDocument();
	});

	it("captions only the first uncharted gate", () => {
		render(
			<ClimbTrack
				gates={[
					gate({ gate: 6 }),
					gate({ gate: 7, uncharted: true }),
					gate({ gate: 8, uncharted: true }),
				]}
			/>
		);

		expect(screen.getAllByText("uncharted")).toHaveLength(1);
	});
});
