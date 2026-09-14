import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { Fold } from "./Fold.ui";

describe("Fold", () => {
	it("opens shut, so a debrief is read from its summaries first", () => {
		const { container } = render(
			<Fold title="Storage bonus">
				<p>gate cleared</p>
			</Fold>
		);

		expect(container.querySelector("details")).not.toHaveAttribute("open");
	});

	it("opens when the caller says this panel is the one to read", () => {
		const { container } = render(
			<Fold title="Storage bonus" open>
				<p>gate cleared</p>
			</Fold>
		);

		expect(container.querySelector("details")).toHaveAttribute("open");
	});

	it("stacks its badges under the title rather than running off a phone", () => {
		const { container } = render(
			<Fold
				title="Build"
				summary="15 configs"
				badges={[{ label: "2 usable" }, { label: "7 running" }]}
			>
				<p>chips</p>
			</Fold>
		);

		expect(container.querySelector("summary")).toHaveClass("flex-wrap");
	});

	it("lets the badge strip narrow so its own badges can wrap", () => {
		render(
			<Fold title="Build" badges={[{ label: "2 usable" }]}>
				<p>chips</p>
			</Fold>
		);

		const meta = screen.getByText("2 usable").parentElement;
		expect(meta).toHaveClass("flex-wrap");
		expect(meta).not.toHaveClass("shrink-0");
	});

	it("titles itself at the rung its sibling panels use", () => {
		render(
			<Fold title="Build changes">
				<p>Telemetry</p>
			</Fold>
		);

		const title = screen.getByRole("heading", { name: "Build changes" });

		expect(title.nodeName).toBe("H3");
		expect(title).toHaveClass("text-base", "font-extrabold");
	});

	it("states its own tally on the strip, so shut is still readable", () => {
		render(
			<Fold
				title="The five answers"
				summary="4 categories"
				badges={[
					{ label: "4 passed", color: "viridian" },
					{ label: "1 failed", color: "cinnabar" },
				]}
			>
				<p>hidden until opened</p>
			</Fold>
		);

		expect(screen.getByText("4 categories")).toHaveClass("text-theme-muted");
		expect(screen.getByText("4 passed")).toHaveAttribute(
			"data-screen-theme",
			"viridian"
		);
		expect(screen.getByText("1 failed")).toHaveAttribute(
			"data-screen-theme",
			"cinnabar"
		);
	});

	it("wears the same chrome as the panels it sits beside", () => {
		const { container } = render(
			<Fold title="Coverage by category">
				<p>CSS</p>
			</Fold>
		);

		expect(container.querySelector("details")).toHaveClass(
			"rounded-2xl",
			"border",
			"border-theme-faint",
			"bg-theme-faint"
		);
	});

	it("opens no gap under the strip while it is shut", () => {
		const { container } = render(
			<Fold title="Coverage by category">
				<p>CSS</p>
			</Fold>
		);

		expect(container.querySelector("details")).not.toHaveClass("gap-4");
		expect(container.querySelector("details")).not.toHaveClass("gap-3");
		expect(container.querySelector("summary")).not.toHaveClass("border-b");
	});

	it("hides the browser's own marker and turns its caret on open", () => {
		const { container } = render(
			<Fold title="Coverage by category">
				<p>CSS</p>
			</Fold>
		);

		expect(container.querySelector("summary")).toHaveClass("list-none");
		expect(screen.getByText("›")).toHaveClass("group-open/fold:rotate-90");
	});

	it("draws no meta strip when it was given neither summary nor badge", () => {
		const { container } = render(
			<Fold title="Coverage by category">
				<p>CSS</p>
			</Fold>
		);

		expect(container.querySelector(".ml-auto")).toBeNull();
	});

	describe("as a row rather than a section", () => {
		it("leads with the verdict, before the question it belongs to", () => {
			const { container } = render(
				<Fold
					lead="wrong"
					heading="row"
					title="Which property centres a flex child?"
				>
					<p>diff</p>
				</Fold>
			);

			const strip = container.querySelector("summary");

			expect(screen.getByText("FAIL")).toBeInTheDocument();
			expect(strip?.children[1]).toContainElement(screen.getByText("FAIL"));
		});

		it("reads a question at prose weight, not as a shouted section title", () => {
			render(
				<Fold heading="row" title="What does a rebase rewrite?">
					<p>diff</p>
				</Fold>
			);

			const title = screen.getByRole("heading", {
				name: "What does a rebase rewrite?",
			});

			expect(title).toHaveClass("font-normal");
			expect(title).not.toHaveClass("font-extrabold");
		});

		it("keeps a section title extrabold when no heading is asked for", () => {
			render(
				<Fold title="Coverage by category">
					<p>rows</p>
				</Fold>
			);

			expect(
				screen.getByRole("heading", { name: "Coverage by category" })
			).toHaveClass("font-extrabold");
		});

		it("holds two badges that happen to read alike", () => {
			render(
				<Fold
					title="Which of these are built-in utility types?"
					badges={[{ label: "+11.2" }, { label: "+11.2" }]}
				>
					<p>diff</p>
				</Fold>
			);

			expect(screen.getAllByText("+11.2")).toHaveLength(2);
		});
	});
});
