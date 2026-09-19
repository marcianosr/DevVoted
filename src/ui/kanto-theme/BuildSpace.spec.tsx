import { describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import {
	BuildSpace,
	buildSpaceLineOf,
	type BuildSpaceProps,
} from "./BuildSpace.ui";

const RUNGS = [
	{ weight: 4, kb: 0 },
	{ weight: 6, kb: 16 },
	{ weight: 8, kb: 32 },
	{ weight: 12, kb: 64 },
	{ weight: 16, kb: 128 },
];

const spaceAt = (
	held: number,
	weight: number,
	onPick?: () => void
): BuildSpaceProps => ({
	held,
	weight,
	rungs: RUNGS.map((rung) => ({
		...rung,
		onPick: rung.weight === held ? undefined : onPick,
	})),
});

const rungNamed = (name: string) => screen.getByRole("button", { name });

describe("BuildSpace", () => {
	it("draws one chip per rung, the free one included", () => {
		const { container } = render(<BuildSpace {...spaceAt(8, 5)} />);

		expect(container.querySelectorAll(".rounded-lg")).toHaveLength(
			RUNGS.length
		);
		expect(screen.getByText("free")).toBeInTheDocument();
	});

	it("bills the rung it holds, not the weight in use", () => {
		render(<BuildSpace {...spaceAt(8, 5)} />);

		expect(screen.getByText("↻ 32 KB a gate")).toBeInTheDocument();
	});

	it("says a free rung costs nothing rather than quoting it 0 KB", () => {
		render(<BuildSpace {...spaceAt(4, 3)} />);

		expect(screen.getByText("↻ free")).toBeInTheDocument();
	});

	it("lights the held rung and leaves every other one dim", () => {
		const { container } = render(<BuildSpace {...spaceAt(8, 5)} />);

		expect(
			container.querySelectorAll(".border-theme:not(.opacity-60)")
		).toHaveLength(1);
		expect(container.querySelectorAll(".opacity-60")).toHaveLength(
			RUNGS.length - 1
		);
	});

	it("offers no press on the rung already held", () => {
		render(<BuildSpace {...spaceAt(8, 5, () => {})} />);

		expect(screen.queryByRole("button", { name: /^8 weight/ })).toBeNull();
	});

	it("picks the rung its chip is pressed on", async () => {
		const onPick = vi.fn();
		render(<BuildSpace {...spaceAt(8, 5, onPick)} />);

		await userEvent.click(rungNamed("12 weight · 64 KB"));

		expect(onPick).toHaveBeenCalledOnce();
	});

	it("leaves a rung inert when no press is handed to it", () => {
		render(<BuildSpace {...spaceAt(8, 5)} />);

		expect(screen.queryAllByRole("button")).toHaveLength(0);
	});

	it("counts the room left and names what going past it costs", () => {
		render(<BuildSpace {...spaceAt(8, 5)} />);

		expect(
			screen.getByText(
				(_, element) =>
					element?.tagName === "P" &&
					element.textContent ===
						"Sitting at the 8 mark. 3 weight of room before 12 takes it to 64 KB a gate."
			)
		).toBeInTheDocument();
	});

	it("names the overshoot instead of the room once the build is too heavy", () => {
		expect(buildSpaceLineOf(spaceAt(4, 6))).toBe(
			"2 weight over the 4 mark. Drop it, or take more room."
		);
	});

	it("stops promising a next rung at the top of the ladder", () => {
		expect(buildSpaceLineOf(spaceAt(16, 12))).toBe(
			"Sitting at the 16 mark. 4 weight of room before the ladder runs out."
		);
	});

	it("marks the weight in cinnabar only while the build is over its space", () => {
		const { container, rerender } = render(<BuildSpace {...spaceAt(8, 5)} />);
		expect(
			container.querySelector('[data-screen-theme="cinnabar"]')
		).toBeNull();

		rerender(<BuildSpace {...spaceAt(4, 6)} />);
		expect(
			container.querySelector('[data-screen-theme="cinnabar"]')
		).toBeInTheDocument();
	});

	it("heads the panel with the weight the build actually carries", () => {
		const { container } = render(<BuildSpace {...spaceAt(8, 5)} />);
		const header = container.querySelector("header");
		if (!header) throw new Error("No panel header rendered");

		expect(within(header).getByText("5 weight")).toBeInTheDocument();
	});

	it("counts the rungs it could not draw", () => {
		render(<BuildSpace {...spaceAt(8, 5)} more={2} />);

		expect(screen.getByText("+2")).toBeInTheDocument();
	});
});
