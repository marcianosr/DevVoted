import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { ClimbTrack, type TrackClimber, type TrackGate } from "./ClimbTrack.ui";

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

const climber = (
	id: string,
	you = false,
	over: Partial<TrackClimber> = {}
): TrackClimber => ({
	id,
	name: id,
	you,
	...over,
});

const MISTY_BUILD = [
	{ name: ".ts", slots: 1, version: 4 },
	{ name: "Cache", slots: 4, locked: true },
];
const MISTY_WORDS = "misty · .ts v4, Cache · 5 weight";

const bubbleOf = (press: HTMLElement) =>
	press.parentElement?.querySelector(':scope > [aria-hidden="true"]');

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

	it("names the build for readers on the chip itself", () => {
		render(
			<ClimbTrack
				gates={[
					gate({
						gate: 3,
						climbers: [climber("misty", false, { build: MISTY_BUILD })],
					}),
				]}
			/>
		);

		expect(screen.getByRole("button", { name: MISTY_WORDS })).toHaveAttribute(
			"aria-expanded",
			"false"
		);
	});

	it("opens a climber's build on press and closes it on the next", async () => {
		render(
			<ClimbTrack
				gates={[
					gate({
						gate: 3,
						climbers: [climber("misty", false, { build: MISTY_BUILD })],
					}),
				]}
			/>
		);
		const press = screen.getByRole("button", { name: MISTY_WORDS });

		expect(bubbleOf(press)?.className).toContain("invisible");
		await userEvent.click(press);
		expect(press).toHaveAttribute("aria-expanded", "true");
		expect(bubbleOf(press)?.className).not.toContain("invisible");
		expect(screen.getByText("Cache")).toBeInTheDocument();
		expect(screen.getByText("5 weight")).toBeInTheDocument();

		await userEvent.click(press);
		expect(press).toHaveAttribute("aria-expanded", "false");
	});

	it("opens one build at a time", async () => {
		render(
			<ClimbTrack
				gates={[
					gate({
						gate: 3,
						climbers: [
							climber("misty", false, { build: MISTY_BUILD }),
							climber("brock", false, { build: [] }),
						],
					}),
				]}
			/>
		);
		const misty = screen.getByRole("button", { name: MISTY_WORDS });
		const brock = screen.getByRole("button", {
			name: "brock · nothing installed",
		});

		await userEvent.click(misty);
		await userEvent.click(brock);

		expect(misty).toHaveAttribute("aria-expanded", "false");
		expect(brock).toHaveAttribute("aria-expanded", "true");
	});

	it("reveals a fallen run's build too, still dimmed", () => {
		render(
			<ClimbTrack
				gates={[
					gate({
						gate: 4,
						fallen: [
							{
								...climber("koga", false, { build: MISTY_BUILD }),
								runKey: "run-11",
							},
						],
					}),
				]}
			/>
		);

		expect(
			screen.getByRole("button", { name: "koga · .ts v4, Cache · 5 weight" })
		).toBeInTheDocument();
		expect(screen.getByTitle("koga").className).toContain("grayscale");
	});

	it("draws a plain chip when no build is known", () => {
		render(
			<ClimbTrack gates={[gate({ gate: 1, climbers: [climber("owen")] })]} />
		);

		expect(screen.queryByRole("button")).not.toBeInTheDocument();
	});
});
