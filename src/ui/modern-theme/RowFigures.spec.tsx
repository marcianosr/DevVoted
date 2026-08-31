import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { RowFigures } from "./RowFigures.ui";

describe("RowFigures", () => {
	it("names the size in slots, the unit the build is measured in", () => {
		render(<RowFigures slots={4} />);

		expect(screen.getByText("4 slots")).toBeInTheDocument();
	});

	it("writes a one-slot config in the singular", () => {
		render(<RowFigures slots={1} />);

		expect(screen.getByText("1 slot")).toBeInTheDocument();
	});

	it("carries the rate beside the size", () => {
		render(<RowFigures slots={1} figure={<span>×1.25</span>} />);

		expect(screen.getByText("×1.25")).toBeInTheDocument();
		expect(screen.getByText("1 slot")).toBeInTheDocument();
	});

	it("says nothing about the size where it is not given one", () => {
		render(<RowFigures figure={<span>128 KB</span>} />);

		expect(screen.getByText("128 KB")).toBeInTheDocument();
		expect(screen.queryByText(/slot/)).not.toBeInTheDocument();
	});

	it("holds a press as readily as a figure", () => {
		render(
			<RowFigures slots={8} figure={<button type="button">install</button>} />
		);

		expect(screen.getByRole("button", { name: "install" })).toBeInTheDocument();
	});
});
