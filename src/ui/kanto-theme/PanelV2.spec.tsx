import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { PanelV2 } from "./PanelV2.ui";

const Full = () => (
	<PanelV2>
		<PanelV2.Header label="build" meta="0 of 4 slots" />
		<PanelV2.Body>nothing installed yet</PanelV2.Body>
		<PanelV2.Footer trailing={<button type="button">buy</button>}>
			+ buy slot 5
		</PanelV2.Footer>
	</PanelV2>
);

describe("PanelV2", () => {
	it("lets a popup escape, rounding the tinted regions itself instead", () => {
		const { container } = render(
			<PanelV2>
				<PanelV2.Header label="Coverage" />
				<PanelV2.Body>body</PanelV2.Body>
			</PanelV2>
		);

		expect(container.firstElementChild).not.toHaveClass("overflow-hidden");
		expect(container.querySelector("header")).toHaveClass(
			"first:rounded-t-2xl"
		);
	});

	it("renders the header label beside its meta", () => {
		render(<Full />);

		expect(screen.getByRole("heading", { name: "build" })).toBeInTheDocument();
		expect(screen.getByText("0 of 4 slots")).toBeInTheDocument();
	});

	it("sits on the screen's own ground, edged rather than filled", () => {
		const { container } = render(<Full />);

		expect(container.firstChild).toHaveClass(
			"bg-theme-faint",
			"border-theme-faint",
			"rounded-2xl"
		);
		expect(container.firstChild).not.toHaveClass("bg-theme-raised");
	});

	it("pads each region rather than the surface, so the rules reach the edges", () => {
		const { container } = render(<Full />);

		expect(container.firstChild).not.toHaveClass("px-4");
		expect(container.querySelector("header")).toHaveClass("px-4");
		expect(screen.getByText("nothing installed yet")).toHaveClass("px-4");
		expect(container.querySelector("footer")).toHaveClass("px-4");
	});

	it("cuts the header off below and the footer off above", () => {
		const { container } = render(<Full />);

		expect(container.querySelector("header")).toHaveClass(
			"border-b",
			"border-theme-faint"
		);
		expect(container.querySelector("footer")).toHaveClass(
			"border-t",
			"border-theme-faint"
		);
	});

	it("stacks the body in a column at the kit's gap", () => {
		render(<Full />);

		expect(screen.getByText("nothing installed yet")).toHaveClass(
			"flex",
			"flex-col",
			"gap-4"
		);
	});

	it("pushes the header meta and the footer trailing to the right", () => {
		render(<Full />);

		expect(screen.getByText("0 of 4 slots")).toHaveClass("ml-auto");
		expect(
			screen.getByRole("button", { name: "buy" }).parentElement
		).toHaveClass("ml-auto");
	});

	it("rules every row but the first, so the header's own rule is not doubled", () => {
		const { container } = render(
			<PanelV2>
				<PanelV2.Header label="registry" />
				<PanelV2.Rows>
					<PanelV2.Row>Unit Tests</PanelV2.Row>
					<PanelV2.Row>IndexedDB</PanelV2.Row>
					<PanelV2.Row>Cold Start</PanelV2.Row>
				</PanelV2.Rows>
			</PanelV2>
		);

		expect(screen.getByText("Unit Tests")).toHaveClass("first:border-t-0");
		expect(
			container.querySelectorAll(".border-t.border-theme-faint")
		).toHaveLength(3);
	});

	it("pads each row rather than the list, so a row rule reaches the edges", () => {
		const { container } = render(
			<PanelV2>
				<PanelV2.Rows>
					<PanelV2.Row>Unit Tests</PanelV2.Row>
				</PanelV2.Rows>
			</PanelV2>
		);

		expect(screen.getByText("Unit Tests")).toHaveClass("px-4", "py-2");
		expect(container.querySelector(".flex.w-full.flex-col")).not.toHaveClass(
			"px-4"
		);
	});

	it("pushes a row's trailing block to the right", () => {
		render(
			<PanelV2>
				<PanelV2.Rows>
					<PanelV2.Row trailing={<button type="button">install</button>}>
						Unit Tests
					</PanelV2.Row>
				</PanelV2.Rows>
			</PanelV2>
		);

		expect(
			screen.getByRole("button", { name: "install" }).parentElement
		).toHaveClass("ml-auto");
	});

	it("sets a badge with the label, not out with the meta", () => {
		const { container } = render(
			<PanelV2>
				<PanelV2.Header
					label="Poll 4 out of 5"
					badge={{ label: "TypeScript", color: "cinnabar" }}
					meta="3 options"
				/>
			</PanelV2>
		);

		const badge = screen.getByText("TypeScript");

		expect(badge).toHaveAttribute("data-screen-theme", "cinnabar");
		expect(badge).not.toHaveClass("ml-auto");
		expect(container.querySelector("header .ml-auto")).toHaveTextContent(
			"3 options"
		);
	});

	it("wraps a crowded meta strip rather than running it off the edge", () => {
		const { container } = render(
			<PanelV2>
				<PanelV2.Header label="Build" meta="15 configs" />
			</PanelV2>
		);

		expect(container.querySelector("header .ml-auto")).toHaveClass("flex-wrap");
	});

	it("renders a body with no header and no footer", () => {
		const { container } = render(
			<PanelV2>
				<PanelV2.Body>a bar</PanelV2.Body>
			</PanelV2>
		);

		expect(screen.getByText("a bar")).toBeInTheDocument();
		expect(container.querySelector("header")).toBeNull();
		expect(container.querySelector("footer")).toBeNull();
	});

	it("omits the meta and the trailing block when neither is given", () => {
		const { container } = render(
			<PanelV2>
				<PanelV2.Header label="registry" />
				<PanelV2.Footer>the hand costs no storage</PanelV2.Footer>
			</PanelV2>
		);

		expect(container.querySelector("header .ml-auto")).toBeNull();
		expect(container.querySelector("footer .ml-auto")).toBeNull();
	});

	it("takes a width from the call site without shedding the chrome", () => {
		const { container } = render(
			<PanelV2 className="w-80">
				<PanelV2.Body>body</PanelV2.Body>
			</PanelV2>
		);

		expect(container.firstChild).toHaveClass(
			"w-80",
			"bg-theme-faint",
			"rounded-2xl"
		);
	});
});
