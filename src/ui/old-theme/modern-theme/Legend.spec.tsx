import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { Dot } from "./Dot.ui";
import { Legend } from "./Legend.ui";

describe("Legend", () => {
	it("lists an item per key it was given", () => {
		render(
			<Legend
				items={[
					{ id: "configs", label: "configs 224 KB" },
					{ id: "free", label: "free 272 KB" },
				]}
			/>
		);

		expect(screen.getAllByRole("listitem")).toHaveLength(2);
	});

	it("colours a label when the key's name is the colour it explains", () => {
		render(
			<Legend
				items={[
					{ id: "leak", label: "leaking", labelClassName: "text-cinnabar" },
				]}
			/>
		);

		expect(screen.getByText("leaking")).toHaveClass("text-cinnabar");
	});

	it("leaves a label with no colour of its own uncoloured", () => {
		render(<Legend items={[{ id: "audit", label: "audit" }]} />);

		expect(screen.getByText("audit")).not.toHaveAttribute("class");
	});

	it("keys a column with its name alone, since a column has no swatch", () => {
		render(
			<Legend
				items={[
					{ id: "coverage", label: "coverage needed" },
					{
						id: "audit",
						marker: <Dot shape="box" tone="saffron" />,
						label: "audit",
					},
				]}
			/>
		);
		const [column, chip] = screen.getAllByRole("listitem");

		expect(column.querySelector("span[aria-hidden]")).toBeNull();
		expect(chip.querySelector("span[aria-hidden]")).not.toBeNull();
	});
});
