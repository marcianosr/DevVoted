import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";

import { gateRoster, pollScoreRows } from "~/test/swatchTrack.factory";

import { PollScores } from "./PollScores.ui";

const ROWS = pollScoreRows([3, 2, 0]);

const rowFor = (gateName: string) =>
	screen.getByLabelText(new RegExp(`^${gateName}`));

describe("PollScores", () => {
	it("names every gate the run has reached, in the order it climbed them", () => {
		render(<PollScores rows={ROWS} />);

		const names = gateRoster.slice(0, 3).map((swatch) => swatch.gateName);

		for (const name of names) {
			expect(screen.getByText(name)).toBeInTheDocument();
		}
	});

	it("scores each gate out of the polls it asked", () => {
		render(<PollScores rows={ROWS} />);

		expect(rowFor(gateRoster[0].gateName)).toHaveAccessibleName(
			`${gateRoster[0].gateName} — 3 of 5 correct`
		);
		expect(rowFor(gateRoster[1].gateName)).toHaveAccessibleName(
			`${gateRoster[1].gateName} — 2 of 5 correct`
		);
	});

	it("fills one swatch per right answer and leaves the rest unfilled", () => {
		const { container } = render(<PollScores rows={pollScoreRows([3])} />);

		const track = container.querySelector("[aria-hidden]") as HTMLElement;
		const filled = track.querySelectorAll(".bg-theme");

		expect(track.children).toHaveLength(5);
		expect(filled).toHaveLength(3);
	});

	it("draws the gate being played as dashed, so its polls read as open", () => {
		const { container } = render(<PollScores rows={pollScoreRows([2])} />);

		const track = container.querySelector("[aria-hidden]") as HTMLElement;

		expect(track.querySelectorAll(".border-dashed")).toHaveLength(3);
	});

	it("leaves a cleared gate's misses dark rather than dashed", () => {
		const { container } = render(<PollScores rows={pollScoreRows([2, 0])} />);

		const [cleared] = [...container.querySelectorAll("[aria-hidden]")];

		expect(cleared.querySelectorAll(".border-dashed")).toHaveLength(0);
		expect(cleared.querySelectorAll(".bg-theme-raised")).toHaveLength(3);
	});

	it("marks only the gate in front as the one being played", () => {
		render(<PollScores rows={ROWS} />);

		expect(screen.getAllByText("this gate")).toHaveLength(1);
		expect(
			within(rowFor(gateRoster[2].gateName)).getByText("this gate")
		).toBeInTheDocument();
	});

	it("takes a different word for the gate in front when given one", () => {
		render(<PollScores rows={ROWS} hereLabel="up next" />);

		expect(screen.getByText("up next")).toBeInTheDocument();
		expect(screen.queryByText("this gate")).toBeNull();
	});

	it("wears each gate's own theme, so a row paints in its swatch colour", () => {
		render(<PollScores rows={ROWS} />);

		expect(rowFor(gateRoster[0].gateName)).toHaveAttribute(
			"data-gate-theme",
			gateRoster[0].theme
		);
	});
});
