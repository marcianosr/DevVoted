import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import {
	gateRoster,
	pollPayoutRows,
	pollScoreRows,
} from "~/test/swatchTrack.factory";

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

	it("marks the gate in front by its swatch alone, with no word beside it", () => {
		render(<PollScores rows={ROWS} />);

		expect(screen.queryByText("this gate")).toBeNull();
		expect(screen.queryByText("today")).toBeNull();
	});

	it("wears each gate's own theme, so a row paints in its swatch colour", () => {
		render(<PollScores rows={ROWS} />);

		expect(rowFor(gateRoster[0].gateName)).toHaveAttribute(
			"data-gate-theme",
			gateRoster[0].theme
		);
	});

	describe("with what each poll paid", () => {
		const PAID = pollPayoutRows([
			[1, 2, 0, 0, 1],
			[1, 0.5, 0, 1.5, undefined],
		]);

		it("counts the polls the gate has answered instead of naming it again", () => {
			render(<PollScores rows={PAID} />);

			expect(screen.getByText("5 out of 5")).toBeInTheDocument();
			expect(screen.getByText("4 out of 5")).toBeInTheDocument();
		});

		it("drops the gate name, which the screen above the table already states", () => {
			render(<PollScores rows={PAID} />);

			expect(screen.queryByText(gateRoster[0].gateName)).toBeNull();
		});

		it("boxes what every poll paid rather than whether it was right", () => {
			render(<PollScores rows={PAID} />);

			expect(screen.getByText("1.5")).toBeInTheDocument();
			expect(screen.getByText("0.5")).toBeInTheDocument();
		});

		it("closes each row with the units that gate earned", () => {
			render(<PollScores rows={PAID} />);

			expect(screen.getByText("4.0")).toBeInTheDocument();
			expect(screen.getByText("3.0")).toBeInTheDocument();
		});

		it("greens a full answer, ambers a part and reddens a miss", () => {
			const { container } = render(
				<PollScores rows={pollPayoutRows([[1, 0.5, 0]])} />
			);

			const track = container.querySelector("[aria-hidden]") as HTMLElement;
			const themeOf = (index: number) =>
				track.children[index].getAttribute("data-screen-theme");

			expect(themeOf(0)).toBe("viridian");
			expect(themeOf(1)).toBe("saffron");
			expect(themeOf(2)).toBe("cinnabar");
		});

		it("numbers a slot still to come and dashes it, because it can be filled today", () => {
			const { container } = render(
				<PollScores rows={pollPayoutRows([[1, undefined, undefined]])} />
			);

			const track = container.querySelector("[aria-hidden]") as HTMLElement;
			const open = track.querySelectorAll(".border-dashed");

			expect(open).toHaveLength(2);
			expect(open[0]).toHaveTextContent("2");
			expect(open[1]).toHaveTextContent("3");
		});

		it("reads the row to a screen reader as what it paid, not as a tally", () => {
			render(<PollScores rows={PAID} />);

			expect(rowFor(gateRoster[0].gateName)).toHaveAccessibleName(
				`${gateRoster[0].gateName} — paid 4.0`
			);
		});

		it("names the gate when the caller hands it a label, instead of counting answers", () => {
			render(
				<PollScores
					rows={PAID.map((row) => ({ ...row, label: row.swatch.gateName }))}
				/>
			);

			expect(screen.getByText(gateRoster[0].gateName)).toBeInTheDocument();
		});

		it("flags a tagged row and says the tag out loud beside the payout", () => {
			const [first, ...rest] = PAID;

			render(
				<PollScores rows={[{ ...first, tag: { label: "best" } }, ...rest]} />
			);

			expect(screen.getByText("best")).toBeInTheDocument();
			expect(rowFor(gateRoster[0].gateName)).toHaveAccessibleName(
				`${gateRoster[0].gateName} — paid 4.0 — best`
			);
		});
	});
});
