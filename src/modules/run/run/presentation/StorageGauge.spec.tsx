import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { StorageGauge } from "~/modules/run/run/presentation/StorageGauge.ui";

describe(StorageGauge, () => {
	it("reads the balance in the unit every price is quoted in", () => {
		render(<StorageGauge usedKb={64} />);

		expect(screen.getByText("64 KB")).toBeInTheDocument();
		expect(screen.getByText("balance")).toBeInTheDocument();
	});

	it("draws no bar, because there is nothing left to fill", () => {
		render(<StorageGauge usedKb={128} />);

		expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
	});

	it("prints a balance no ceiling would once have allowed", () => {
		render(<StorageGauge usedKb={2048} />);

		expect(screen.getByText("2048 KB")).toBeInTheDocument();
	});

	it("reads zero on a spent-out run", () => {
		render(<StorageGauge usedKb={0} />);

		expect(screen.getByText("0 KB")).toBeInTheDocument();
	});
});
