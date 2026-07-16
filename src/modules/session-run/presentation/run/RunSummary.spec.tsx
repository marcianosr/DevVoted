import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { RunSummary } from "./RunSummary.ui";

describe(RunSummary, () => {
	it("celebrates a summit and shows the final stats", () => {
		render(<RunSummary won gatesCleared={5} coverage={24} storage={640} />);
		expect(
			screen.getByRole("heading", { name: /You summited/ })
		).toBeInTheDocument();
		expect(screen.getByText("5")).toBeInTheDocument();
		expect(screen.getByText("640KB")).toBeInTheDocument();
	});

	it("marks a dead run", () => {
		render(
			<RunSummary won={false} gatesCleared={2} coverage={9} storage={120} />
		);
		expect(
			screen.getByRole("heading", { name: /Run over/ })
		).toBeInTheDocument();
	});
});
