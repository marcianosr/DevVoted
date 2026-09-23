import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { Modal } from "./Modal.ui";
import { Panel } from "./Panel.ui";

const Full = () => (
	<Panel>
		<Panel.Header label="build" meta="0 of 4 slots" />
		<Panel.Body>nothing installed yet</Panel.Body>
		<Panel.Footer trailing={<button type="button">buy</button>}>
			+ buy slot 5
		</Panel.Footer>
	</Panel>
);

describe("Panel", () => {
	it("lets a popup escape, rounding the tinted regions itself instead", () => {
		const { container } = render(
			<Panel>
				<Panel.Header label="Coverage" />
				<Panel.Body>body</Panel.Body>
			</Panel>
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
			<Panel>
				<Panel.Header label="registry" />
				<Panel.Rows>
					<Panel.Row>Unit Tests</Panel.Row>
					<Panel.Row>IndexedDB</Panel.Row>
					<Panel.Row>Cold Start</Panel.Row>
				</Panel.Rows>
			</Panel>
		);

		expect(screen.getByText("Unit Tests")).toHaveClass("first:border-t-0");
		expect(
			container.querySelectorAll(".border-t.border-theme-faint")
		).toHaveLength(3);
	});

	it("pads each row rather than the list, so a row rule reaches the edges", () => {
		const { container } = render(
			<Panel>
				<Panel.Rows>
					<Panel.Row>Unit Tests</Panel.Row>
				</Panel.Rows>
			</Panel>
		);

		expect(screen.getByText("Unit Tests")).toHaveClass("px-4", "py-2");
		expect(container.querySelector(".flex.w-full.flex-col")).not.toHaveClass(
			"px-4"
		);
	});

	it("pushes a row's trailing block to the right", () => {
		render(
			<Panel>
				<Panel.Rows>
					<Panel.Row trailing={<button type="button">install</button>}>
						Unit Tests
					</Panel.Row>
				</Panel.Rows>
			</Panel>
		);

		expect(
			screen.getByRole("button", { name: "install" }).parentElement
		).toHaveClass("ml-auto");
	});

	it("makes the whole row the link when it is given a destination", () => {
		render(
			<Panel>
				<Panel.Rows>
					<Panel.Row href="/runs/7" trailing={<span>56%</span>}>
						Unit Tests
					</Panel.Row>
				</Panel.Rows>
			</Panel>
		);

		const row = screen.getByRole("link", { name: /Unit Tests/ });

		expect(row).toHaveAttribute("href", "/runs/7");
		expect(row).toHaveClass("px-4", "py-2");
		expect(row).toHaveTextContent("56%");
	});

	it("stays a plain row when no destination is given", () => {
		render(
			<Panel>
				<Panel.Rows>
					<Panel.Row>Unit Tests</Panel.Row>
				</Panel.Rows>
			</Panel>
		);

		expect(screen.queryByRole("link")).not.toBeInTheDocument();
	});

	it("sets a badge with the label, not out with the meta", () => {
		const { container } = render(
			<Panel>
				<Panel.Header
					label="Poll 4 out of 5"
					badge={{ label: "TypeScript", color: "cinnabar" }}
					meta="3 options"
				/>
			</Panel>
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
			<Panel>
				<Panel.Header label="Build" meta="15 configs" />
			</Panel>
		);

		expect(container.querySelector("header .ml-auto")).toHaveClass("flex-wrap");
	});

	it("renders a body with no header and no footer", () => {
		const { container } = render(
			<Panel>
				<Panel.Body>a bar</Panel.Body>
			</Panel>
		);

		expect(screen.getByText("a bar")).toBeInTheDocument();
		expect(container.querySelector("header")).toBeNull();
		expect(container.querySelector("footer")).toBeNull();
	});

	it("omits the meta and the trailing block when neither is given", () => {
		const { container } = render(
			<Panel>
				<Panel.Header label="registry" />
				<Panel.Footer>the hand costs no storage</Panel.Footer>
			</Panel>
		);

		expect(container.querySelector("header .ml-auto")).toBeNull();
		expect(container.querySelector("footer .ml-auto")).toBeNull();
	});

	it("takes a width from the call site without shedding the chrome", () => {
		const { container } = render(
			<Panel className="w-80">
				<Panel.Body>body</Panel.Body>
			</Panel>
		);

		expect(container.firstChild).toHaveClass(
			"w-80",
			"bg-theme-faint",
			"rounded-2xl"
		);
	});

	it("claims no width of its own, so the call site's width is the one that lands", () => {
		const { container } = render(
			<Panel className="w-80">
				<Panel.Body>body</Panel.Body>
			</Panel>
		);

		expect(container.firstChild).not.toHaveClass("w-full");
	});

	it("is the surface a modal's dialog wears", () => {
		render(<Modal label="Uninstall">body</Modal>);

		expect(screen.getByRole("dialog")).toHaveClass(
			"bg-theme-faint",
			"border-theme-faint",
			"rounded-2xl"
		);
	});
});
