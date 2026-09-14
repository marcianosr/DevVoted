import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { gateSwatchAt } from "~/test/swatchTrack.factory";

import { Ledger } from "./Ledger.ui";

const ROWS = [
	{ label: "coverage to pass", figures: [{ label: "60%" }] },
] as const;

describe("Ledger", () => {
	it("titles itself at the rung its siblings use, under the screen", () => {
		render(<Ledger title="What it asks" rows={ROWS} />);

		const title = screen.getByRole("heading", { name: "What it asks" });

		expect(title.nodeName).toBe("H3");
		expect(title).toHaveClass("text-base", "font-extrabold");
	});

	it("reads a row as its label and its figures", () => {
		render(<Ledger title="What it asks" rows={ROWS} />);

		expect(screen.getByText("coverage to pass")).toBeInTheDocument();
		expect(screen.getByText("60%")).toHaveClass("badge-theme");
	});

	it("quiets the second half of a label", () => {
		render(
			<Ledger
				title="Billed on a clear"
				rows={[{ label: "storage plan", detail: "2 MB cap" }]}
			/>
		);

		expect(screen.getByText("2 MB cap")).toHaveClass("text-theme-muted");
	});

	it("leads with a headline figure and keeps words out of a badge", () => {
		render(
			<Ledger
				title="What it asks"
				rows={[
					{
						label: "coverage to pass",
						figures: [
							{ label: "92.5", tone: "headline" },
							{ label: "of", tone: "quiet" },
							{ label: "375%" },
						],
					},
				]}
			/>
		);

		expect(screen.getByText("92.5")).toHaveClass("text-lg", "font-bold");
		expect(screen.getByText("of")).not.toHaveClass("badge-theme");
		expect(screen.getByText("375%")).toHaveClass("badge-theme");
	});

	it("colours a figure that costs", () => {
		render(
			<Ledger
				title="Billed on a clear"
				rows={[
					{
						label: "storage plan",
						figures: [{ label: "−224 KB", color: "cinnabar" }],
					},
				]}
			/>
		);

		expect(screen.getByText("−224 KB")).toHaveAttribute(
			"data-screen-theme",
			"cinnabar"
		);
	});

	it("withholds a whole value with the full token", () => {
		render(
			<Ledger
				title="The five polls"
				rows={[{ label: "answer types", figures: [{ locked: true }] }]}
			/>
		);

		expect(screen.getByText("???")).toBeInTheDocument();
	});

	it("withholds one item of a known-length list with the short token", () => {
		render(
			<Ledger
				title="The five polls"
				rows={[
					{
						label: "categories",
						figures: [
							{ locked: true },
							{ locked: true },
							{ locked: true },
							{ locked: true },
							{ locked: true },
						],
					},
				]}
			/>
		);

		expect(screen.getAllByText("?")).toHaveLength(5);
		expect(screen.queryByText("???")).not.toBeInTheDocument();
	});

	it("names a withheld figure for a reader who cannot see it", () => {
		render(
			<Ledger
				title="The five polls"
				rows={[{ label: "answer types", figures: [{ locked: true }] }]}
			/>
		);

		expect(
			screen.getByText("Withheld until something reveals it")
		).toBeInTheDocument();
	});

	it("draws a swatch beside what a clear pays in colour", () => {
		const swatch = gateSwatchAt(4);
		render(
			<Ledger
				title="How it ends"
				rows={[
					{
						label: "cleared",
						figures: [
							{
								label: "Lavender swatch",
								swatch: { state: "current", swatch },
							},
						],
					},
				]}
			/>
		);

		const chip = screen.getByText("Lavender swatch");
		expect(chip.querySelector("[data-swatch-theme='lavender']")).not.toBeNull();
	});

	it("tags a row beside its label rather than out among the figures", () => {
		render(
			<Ledger
				title="Coverage by category"
				rows={[
					{
						label: "CSS",
						tags: [{ label: "1 poll" }],
						figures: [{ label: "−4.4", color: "cinnabar" }],
					},
				]}
			/>
		);

		const identity = screen.getByText("CSS").parentElement;

		expect(screen.getByText("1 poll")).toHaveClass("badge-theme");
		expect(identity).toContainElement(screen.getByText("1 poll"));
		expect(identity).not.toContainElement(screen.getByText("−4.4"));
	});

	it("leads an answer row with its verdict as a word", () => {
		render(
			<Ledger
				title="The five answers"
				rows={[
					{
						verdict: "wrong",
						tags: [{ label: "CSS", color: "cerulean" }],
						detail: "which property centres a flex child",
						figures: [{ label: "−4.4", color: "cinnabar" }],
					},
				]}
			/>
		);

		expect(screen.getByText("FAIL")).toBeInTheDocument();
		expect(screen.queryByText("✗")).not.toBeInTheDocument();
	});

	it("carries a row whose tag is its whole name", () => {
		render(
			<Ledger
				title="The five answers"
				rows={[{ tags: [{ label: "Git" }], detail: "what a rebase rewrites" }]}
			/>
		);

		expect(screen.getByText("Git")).toBeInTheDocument();
		expect(screen.getByText("what a rebase rewrites")).toHaveClass(
			"text-theme-muted"
		);
	});

	it("sets the summing row apart from the rows it sums", () => {
		render(
			<Ledger
				title="Billed on a clear"
				rows={[
					{ label: "storage plan", figures: [{ label: "−224 KB" }] },
					{ label: "total", total: true, figures: [{ label: "−224 KB" }] },
				]}
			/>
		);

		expect(screen.getByText("total")).toHaveClass("font-bold");
		expect(screen.getByText("storage plan")).not.toHaveClass("font-bold");
	});

	it("rules each row off the one above, but not the first", () => {
		const { container } = render(
			<Ledger
				title="Billed on a clear"
				rows={[
					{ label: "storage plan" },
					{ label: "Freemium" },
					{ label: "total", total: true },
				]}
			/>
		);

		expect(container.querySelectorAll(".border-t")).toHaveLength(2);
	});

	it("credits what is answering for its rows", () => {
		render(<Ledger title="The five polls" badge="Prefetch" rows={ROWS} />);

		expect(screen.getByText("Prefetch")).toHaveClass("badge-theme");
	});

	it("carries a bar when the rows describe a climb toward something", () => {
		const { container } = render(
			<Ledger title="What it asks" rows={ROWS} meter={{ value: 15, max: 60 }} />
		);

		expect(container.querySelector("[aria-hidden] > span")).toHaveStyle({
			width: "25%",
		});
	});

	it("draws no bar and no note when it was given neither", () => {
		const { container } = render(<Ledger title="What it asks" rows={ROWS} />);

		expect(container.querySelector("[aria-hidden] > span")).toBeNull();
	});

	it("closes on the note it was given", () => {
		render(
			<Ledger title="How it ends" rows={ROWS} note="Drop configs or minify." />
		);

		expect(screen.getByText("Drop configs or minify.")).toBeInTheDocument();
	});
	it("heads itself with the panel glyph, the title reading as it was given", () => {
		const { container } = render(<Ledger title="What it asks" rows={ROWS} />);

		expect(
			screen.getByRole("heading", { name: "What it asks" })
		).toBeInTheDocument();
		expect(container.querySelector("header [aria-hidden]")).toHaveClass(
			"bg-theme-muted"
		);
	});
});
