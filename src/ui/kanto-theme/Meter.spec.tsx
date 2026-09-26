import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";

import { Meter } from "./Meter.ui";

const fillOf = (container: HTMLElement) =>
	container.querySelector<HTMLElement>("div > span");

describe("Meter", () => {
	it("fills the share of the demand the run has earned", () => {
		const { container } = render(<Meter value={15} max={60} />);

		expect(fillOf(container)).toHaveStyle({ width: "25%" });
	});

	it("draws nothing at all before a gate has earned anything", () => {
		const { container } = render(<Meter value={0} max={60} />);

		expect(fillOf(container)).toHaveStyle({ width: "0%" });
	});

	it("stops at full when the run has earned more than the gate asks", () => {
		const { container } = render(<Meter value={92.5} max={60} />);

		expect(fillOf(container)).toHaveStyle({ width: "100%" });
	});

	it("reads full against a demand of nothing", () => {
		const { container } = render(<Meter value={0} max={0} />);

		expect(fillOf(container)).toHaveStyle({ width: "100%" });
	});

	it("keeps itself out of the reading, since the row above states it", () => {
		const { container } = render(<Meter value={15} max={60} />);

		expect(container.firstElementChild).toHaveAttribute("aria-hidden");
	});
});
