import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { Meter } from "./Meter.ui";

describe("Meter", () => {
	it("reports the held value, not the projection, as its progress", () => {
		render(<Meter held={38.6} projected={23.1} max={100} label="Coverage" />);

		const bar = screen.getByRole("progressbar", { name: "Coverage" });

		expect(bar).toHaveAttribute("aria-valuenow", "38.6");
		expect(bar).toHaveAttribute("aria-valuemax", "100");
	});

	it("sizes each slice against the maximum", () => {
		const { container } = render(
			<Meter held={40} projected={20} max={100} label="Coverage" />
		);
		const [held, projected] = container.querySelectorAll("span");

		expect(held).toHaveStyle({ width: "40%" });
		expect(projected).toHaveStyle({ width: "20%" });
	});

	it("clamps a projection that would overshoot the track", () => {
		const { container } = render(
			<Meter held={80} projected={40} max={100} label="Coverage" />
		);
		const [, projected] = container.querySelectorAll("span");

		expect(projected).toHaveStyle({ width: "20%" });
	});

	it("draws nothing projected when the build adds nothing", () => {
		const { container } = render(
			<Meter held={38.6} max={100} label="Coverage" />
		);
		const [, projected] = container.querySelectorAll("span");

		expect(projected).toHaveStyle({ width: "0%" });
	});
});
