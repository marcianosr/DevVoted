import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import {
	createKantoBuildFooterProps,
	createKantoBuildProps,
	kantoRunningConfigs,
	kantoSkippedConfigs,
} from "~/test/kantoPoll.factory";

import { BuildFooter } from "./BuildFooter.ui";

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

	it("sits at the bottom of the screen as the page scrolls under it", () => {
		const { container } = render(<BuildFooter {...props} />);

		expect(container.firstChild).toHaveClass("sticky", "bottom-0");
	});

	it("paints an opaque ground so the poll cannot show through it", () => {
		const { container } = render(<BuildFooter {...props} />);

		expect(container.firstChild).toHaveClass("bg-theme-faint");
	});
});
