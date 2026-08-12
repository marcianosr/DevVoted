import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { MetaStorageBar } from "./MetaStorageBar.ui";

describe(MetaStorageBar, () => {
	it("splits leftover storage into carried, share, and lost", () => {
		render(<MetaStorageBar carriedKb={41} totalKb={137} />);
		expect(screen.getByText(/41KB carried/)).toBeInTheDocument();
		expect(screen.getByText(/30% of 137KB/)).toBeInTheDocument();
		expect(screen.getByText("96KB lost")).toBeInTheDocument();
	});

	it("reports nothing lost when the whole run carries over", () => {
		render(<MetaStorageBar carriedKb={640} totalKb={640} />);
		expect(screen.getByText(/100% of 640KB/)).toBeInTheDocument();
		expect(screen.getByText("0KB lost")).toBeInTheDocument();
	});

	it("stays at zero percent when there is no leftover storage", () => {
		render(<MetaStorageBar carriedKb={0} totalKb={0} />);
		expect(screen.getByText(/0% of 0KB/)).toBeInTheDocument();
	});
});
