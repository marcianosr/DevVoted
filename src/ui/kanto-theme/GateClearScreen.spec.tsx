import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";

import {
	GATE_COMMUNITY_LABEL,
	GATE_REVIEW_LABEL,
	GATE_SHOP_LABEL,
	kantoGateClear,
	kantoGateClearFlawless,
	kantoGateClearOpen,
} from "~/test/kantoGate.factory";

import { GateClearScreen } from "./GateClearScreen.ui";

const props = kantoGateClear();

const panelOf = (title: string) =>
	screen.getByRole("heading", { name: title }).closest("details");

describe("GateClearScreen", () => {
	it("names the swatch the clear awarded, and the gate ahead", () => {
		render(<GateClearScreen {...props} />);

		expect(
			screen.getByRole("heading", { name: "Lavender earned" })
		).toBeInTheDocument();
		expect(
			screen.getByText(/gate 4 of 12 cleared · next up Rainbow/)
		).toBeInTheDocument();
	});

	it("wears the colour of the gate it just cleared", () => {
		const { container } = render(<GateClearScreen {...props} />);

		expect(container.firstElementChild).toHaveAttribute(
			"data-gate-theme",
			"lavender"
		);
	});

	it("stands every panel shut, so the strips are what is read first", () => {
		const { container } = render(<GateClearScreen {...props} />);

		const panels = container.querySelectorAll("details");

		expect(panels).toHaveLength(4);
		for (const panel of panels) {
			expect(panel).not.toHaveAttribute("open");
		}
	});

	it("states each panel's tally on its shut strip", () => {
		render(<GateClearScreen {...props} />);

		expect(
			within(panelOf("Coverage by category")!).getByText("4 categories")
		).toBeInTheDocument();
		expect(
			within(panelOf("The five answers")!).getByText("3 passed")
		).toHaveAttribute("data-screen-theme", "viridian");
		expect(
			within(panelOf("The five answers")!).getByText("1 part")
		).toHaveAttribute("data-screen-theme", "saffron");
		expect(
			within(panelOf("The five answers")!).getByText("1 failed")
		).toHaveAttribute("data-screen-theme", "cinnabar");
	});

	it("calls a config it earned green, not a warning colour", () => {
		render(<GateClearScreen {...props} />);

		expect(
			within(panelOf("Build changes")!).getByText("1 unlocked")
		).toHaveAttribute("data-screen-theme", "viridian");
		expect(
			within(panelOf("Build changes")!).getByText("1 faded")
		).toHaveAttribute("data-screen-theme", "saffron");
	});

	it("reads each answer as a runner's verdict rather than a tick", () => {
		render(<GateClearScreen {...kantoGateClearOpen()} />);

		const answers = panelOf("The five answers")!;

		expect(within(answers).getAllByText("PASS")).toHaveLength(3);
		expect(within(answers).getByText("PART")).toBeInTheDocument();
		expect(within(answers).getByText("FAIL")).toBeInTheDocument();
		expect(within(answers).queryByText("✓")).not.toBeInTheDocument();
	});

	it("prices every category against the gate's own demand", () => {
		render(<GateClearScreen {...kantoGateClearOpen()} />);

		const coverage = panelOf("Coverage by category")!;

		expect(within(coverage).getByText("this gate")).toHaveClass("font-bold");
		expect(within(coverage).getByText("of 60% needed")).toBeInTheDocument();
	});

	it("closes the storage column on the balance it produced", () => {
		render(<GateClearScreen {...kantoGateClearOpen()} />);

		const storage = panelOf("Storage bonus")!;

		expect(within(storage).getByText("102 →")).toHaveClass("text-theme-muted");
		expect(within(storage).getByText("balance")).toHaveClass("font-bold");
	});

	it("says why each build change happened, inside its chip", () => {
		render(<GateClearScreen {...kantoGateClearOpen()} />);

		expect(
			within(panelOf("Build changes")!).getByText(
				"earned: peeked the community split 5 times"
			)
		).toBeInTheDocument();
	});

	it("offers the answers for review from inside their own panel", () => {
		render(<GateClearScreen {...kantoGateClearOpen()} />);

		expect(
			within(panelOf("The five answers")!).getByRole("button", {
				name: GATE_REVIEW_LABEL,
			})
		).toBeInTheDocument();
	});

	it("leaves for the shop, and says how long it stays open", () => {
		render(<GateClearScreen {...props} />);

		expect(
			screen.getByRole("button", { name: GATE_SHOP_LABEL })
		).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: GATE_COMMUNITY_LABEL })
		).toBeInTheDocument();
		expect(
			screen.getByText("the shop stays open until Rainbow starts")
		).toBeInTheDocument();
	});

	it("signs both footer presses rather than pointing an arrow", () => {
		render(<GateClearScreen {...props} />);

		expect(
			screen.getByRole("button", { name: GATE_SHOP_LABEL }).querySelector("svg")
		).not.toBeNull();
	});

	it("names no failures at all on a flawless gate", () => {
		render(<GateClearScreen {...kantoGateClearFlawless()} />);

		expect(screen.getByText("5 passed")).toBeInTheDocument();
		expect(screen.queryByText(/failed/)).not.toBeInTheDocument();
	});
});
