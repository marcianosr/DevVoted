import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

import { RunSummary } from "./RunSummary.ui";

describe("RunSummary", () => {
	it("celebrates a summit and shows the final stats", () => {
		render(
			<RunSummary
				won
				gatesCleared={5}
				coverage={24}
				storage={640}
				onRestart={() => {}}
			/>
		);
		expect(
			screen.getByRole("heading", { name: /You summited/ })
		).toBeInTheDocument();
		expect(screen.getByText("5")).toBeInTheDocument();
		expect(screen.getByText("640KB")).toBeInTheDocument();
	});

	it("marks a dead run", () => {
		render(
			<RunSummary
				won={false}
				gatesCleared={2}
				coverage={9}
				storage={120}
				onRestart={() => {}}
			/>
		);
		expect(
			screen.getByRole("heading", { name: /Run over/ })
		).toBeInTheDocument();
	});

	it("restarts on click", () => {
		const onRestart = vi.fn();
		render(
			<RunSummary
				won
				gatesCleared={5}
				coverage={24}
				storage={640}
				onRestart={onRestart}
			/>
		);
		fireEvent.click(screen.getByRole("button", { name: /Play again/ }));
		expect(onRestart).toHaveBeenCalledTimes(1);
	});
});
