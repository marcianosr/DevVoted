import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { InstallScale } from "./InstallScale.ui";

describe("InstallScale", () => {
	it("states the rung it crosses and the bill that follows", () => {
		render(<InstallScale from={4} to={6} perGateKb={16} />);

		expect(screen.getByText(/Build space scales 4 → 6/)).toBeInTheDocument();
		expect(screen.getByText(/Upkeep becomes/)).toBeInTheDocument();
	});

	it("states the bill alone when the rung does not move", () => {
		render(<InstallScale from={12} to={12} perGateKb={48} />);

		expect(screen.queryByText(/Build space scales/)).not.toBeInTheDocument();
		expect(screen.getByText(/Upkeep becomes/)).toBeInTheDocument();
	});
});
