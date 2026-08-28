import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { Storage } from "./Storage.ui";

describe("Storage", () => {
	it("reads the balance in the unit every price is quoted in", () => {
		render(<Storage balanceKb={320} />);

		expect(screen.getByText("320 KB")).toBeInTheDocument();
		expect(screen.getByText("balance")).toBeInTheDocument();
	});

	it("draws no meter, because there is no ceiling to fill", () => {
		render(<Storage balanceKb={320} />);

		expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
	});

	it("prints a balance the old cap would have burned", () => {
		render(<Storage balanceKb={2048} />);

		expect(screen.getByText("2048 KB")).toBeInTheDocument();
	});

	it("reads zero on a spent-out run", () => {
		render(<Storage balanceKb={0} />);

		expect(screen.getByText("0 KB")).toBeInTheDocument();
	});
});
