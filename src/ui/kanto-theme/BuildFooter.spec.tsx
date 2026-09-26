import { describe, expect, it, vi } from "vitest";
import { act, render, screen } from "@testing-library/react";

import {
	createKantoBuildFooterProps,
	createKantoBuildProps,
	kantoRunningConfigs,
	kantoSkippedConfigs,
} from "~/test/kantoPoll.factory";

import { BuildFooter, BUILD_FLASH_HOLD_MS } from "./BuildFooter.ui";

const props = createKantoBuildFooterProps();

const TOTAL = kantoRunningConfigs.length + kantoSkippedConfigs.length;

describe("BuildFooter", () => {
	it("names the band it holds", () => {
		render(<BuildFooter {...props} />);

		expect(screen.getByRole("heading", { name: "Build" })).toBeInTheDocument();
	});

	it("counts the skipped configs into its total, not just the visible ones", () => {
		render(<BuildFooter {...props} />);

		expect(screen.getByText(`${TOTAL} configs`)).toBeInTheDocument();
	});

	it("reads every state the build is in", () => {
		render(<BuildFooter {...props} />);

		expect(screen.getByText("2 ready")).toBeInTheDocument();
		expect(screen.getByText("7 applies")).toBeInTheDocument();
		expect(screen.getByText("1 offline")).toBeInTheDocument();
		expect(screen.getByText("2 changing")).toBeInTheDocument();
	});

	it("colours each state so the row scans without reading it", () => {
		render(<BuildFooter {...props} />);

		expect(screen.getByText("2 ready")).toHaveAttribute(
			"data-screen-theme",
			"cerulean"
		);
		expect(screen.getByText("7 applies")).toHaveAttribute(
			"data-screen-theme",
			"viridian"
		);
		expect(screen.getByText("1 offline")).toHaveAttribute(
			"data-screen-theme",
			"cinnabar"
		);
		expect(screen.getByText("2 changing")).toHaveAttribute(
			"data-screen-theme",
			"vermillion"
		);
	});

	it("draws no badge for a state nothing is in", () => {
		render(
			<BuildFooter
				{...props}
				counts={{ ready: 0, applies: 7, offline: 0, changing: 0 }}
			/>
		);

		expect(screen.getByText("7 applies")).toBeInTheDocument();
		expect(screen.queryByText("0 ready")).not.toBeInTheDocument();
		expect(screen.queryByText("0 offline")).not.toBeInTheDocument();
		expect(screen.queryByText("0 changing")).not.toBeInTheDocument();
	});

	it("still reads its total when the build is bare", () => {
		render(
			<BuildFooter
				build={createKantoBuildProps({ configs: [], skipped: [] })}
				counts={{ ready: 0, applies: 0, offline: 0, changing: 0 }}
			/>
		);

		expect(screen.getByText("0 configs")).toBeInTheDocument();
	});

	it("shuts on request, whatever the viewport would have chosen", () => {
		const { container } = render(<BuildFooter {...props} open={false} />);

		expect(container.querySelector("details")).not.toHaveAttribute("open");
	});

	it("opens on request, whatever the viewport would have chosen", () => {
		const { container } = render(<BuildFooter {...props} open />);

		expect(container.querySelector("details")).toHaveAttribute("open");
	});

	it("holds the whole band, chips and all, once it is open", () => {
		render(<BuildFooter {...props} open />);

		expect(screen.getAllByText("Cache").length).toBeGreaterThan(0);
		expect(screen.getAllByText("ESLint").length).toBeGreaterThan(0);
		expect(
			screen.getByText(`${kantoSkippedConfigs.length} skipped`, {
				exact: false,
			})
		).toBeInTheDocument();
	});

	it("lets the band name the build once rather than twice", () => {
		render(<BuildFooter {...props} open />);

		expect(screen.getAllByText("Build")).toHaveLength(1);
		expect(screen.getAllByText(`${TOTAL} configs`)).toHaveLength(1);
	});

	it("sits in the flow at the screen's floor while the press beneath it is unmeasured", () => {
		const { container } = render(<BuildFooter {...props} />);

		expect(container.firstChild).not.toHaveClass("sticky");
		expect(container.firstChild).toHaveClass("mt-auto");
		expect(container.firstElementChild).not.toHaveAttribute("style");
	});

	it("rides on the press beneath it once that press has been measured", () => {
		const { container } = render(<BuildFooter {...props} seat={72} />);

		expect(container.firstChild).toHaveClass("sticky", "z-20");
		expect(container.firstElementChild).toHaveStyle({ bottom: "72px" });
	});

	it("takes the floor itself where the press beneath it measures nothing", () => {
		const { container } = render(<BuildFooter {...props} seat={0} />);

		expect(container.firstChild).toHaveClass("sticky");
		expect(container.firstElementChild).toHaveStyle({ bottom: "0px" });
	});
});

describe("BuildFooter's flash", () => {
	const flashing = (flash?: string) => (
		<BuildFooter {...props} open={false} flash={flash} />
	);

	it("sits quiet while no answer has landed", () => {
		const { container } = render(flashing());

		expect(container.firstChild).not.toHaveAttribute("data-flash");
	});

	it("raises the flash when an answer credits the build", () => {
		const { container, rerender } = render(flashing());

		rerender(flashing("q1"));

		expect(container.firstChild).toHaveAttribute("data-flash", "true");
	});

	it("drops the flash again once the hold is spent", () => {
		vi.useFakeTimers();
		try {
			const { container, rerender } = render(flashing());

			rerender(flashing("q1"));
			act(() => {
				vi.advanceTimersByTime(BUILD_FLASH_HOLD_MS);
			});

			expect(container.firstChild).not.toHaveAttribute("data-flash");
		} finally {
			vi.useRealTimers();
		}
	});

	it("flashes again for the next answer, not only the first", () => {
		vi.useFakeTimers();
		try {
			const { container, rerender } = render(flashing());

			rerender(flashing("q1"));
			act(() => {
				vi.advanceTimersByTime(BUILD_FLASH_HOLD_MS);
			});
			rerender(flashing(undefined));
			rerender(flashing("q2"));

			expect(container.firstChild).toHaveAttribute("data-flash", "true");
		} finally {
			vi.useRealTimers();
		}
	});

	it("carries the class the sheet hangs the flash on", () => {
		const { container } = render(flashing());

		expect(container.firstChild).toHaveClass("build-footer");
	});
});
