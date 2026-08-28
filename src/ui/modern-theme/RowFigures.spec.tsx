import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { RowFigures } from "./RowFigures.ui";

describe("RowFigures", () => {
	it("names the grade, which is also the size", () => {
		render(<RowFigures grade="nibble" />);

		expect(screen.getByText("nibble")).toBeInTheDocument();
	});

	it("states nothing in spots, which would be the same fact a third time", () => {
		render(<RowFigures grade="nibble" />);

		expect(screen.queryByText(/spot/)).not.toBeInTheDocument();
	});

	it("carries the rate beside the grade", () => {
		render(<RowFigures grade="bit" figure={<span>×1.25</span>} />);

		expect(screen.getByText("×1.25")).toBeInTheDocument();
		expect(screen.getByText("bit")).toBeInTheDocument();
	});

	it("says nothing about the grade where it is not given one", () => {
		render(<RowFigures figure={<span>128 KB</span>} />);

		expect(screen.getByText("128 KB")).toBeInTheDocument();
		expect(screen.queryByText("bit")).not.toBeInTheDocument();
		expect(screen.queryByText("byte")).not.toBeInTheDocument();
	});

	it("holds a press as readily as a figure", () => {
		render(
			<RowFigures
				grade="byte"
				figure={<button type="button">install</button>}
			/>
		);

		expect(screen.getByRole("button", { name: "install" })).toBeInTheDocument();
	});
});
