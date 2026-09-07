import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { PrepScreen, type PrepScreenProps } from "./PrepScreen.ui";

const base: PrepScreenProps = {
	header: { title: "Gate 1 · Boulder", value: "96 KB", caption: "balance" },
	ready: { note: "today's 5 polls are ready" },
	build: { slots: 4, slotsUsed: 1, rows: [] },
	window: {
		title: "Boulder gate",
		target: { reading: "0 of 10%", held: 0, demand: 10 },
		polls: "0 / 5 answered",
		pollCount: 5,
		audits: [],
	},
	onClear: {
		reward: "+96 KB",
		swatchLabel: "Boulder",
		missPenalty: "ends the run",
	},
	footer: {
		changeLabel: "Back to shop",
		communityLabel: "Community",
		startLabel: "Start Boulder →",
	},
};

describe(PrepScreen, () => {
	it("draws one blank per poll while the categories are hidden", () => {
		render(<PrepScreen {...base} />);

		expect(screen.getAllByText("?")).toHaveLength(5);
	});

	it("keeps the readings it cannot count as a single redaction", () => {
		render(<PrepScreen {...base} />);

		expect(screen.getAllByText("???")).toHaveLength(2);
	});

	it("names the categories instead of blanking them once revealed", () => {
		render(
			<PrepScreen
				{...base}
				window={{
					...base.window,
					categories: [
						{ label: "typescript", count: 3 },
						{ label: "javascript", count: 2 },
					],
				}}
			/>
		);

		expect(screen.getByText("typescript")).toBeInTheDocument();
		expect(screen.queryByText("?")).not.toBeInTheDocument();
	});
});
