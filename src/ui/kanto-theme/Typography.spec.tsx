import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { Typography, type TypographyVariant } from "./Typography.ui";

const appCss = readFileSync("src/styles/app.css", "utf8");

const VARIANTS = [
	"headline",
	"title",
	"subtitle",
	"paragraph",
	"caption",
	"label",
	"hint",
	"accent",
] as const satisfies readonly TypographyVariant[];

const HEADING_TAGS = ["H1", "H2"];

describe("Typography", () => {
	it.each([
		["headline", "H1"],
		["title", "H2"],
		["subtitle", "H2"],
		["paragraph", "P"],
		["caption", "SPAN"],
		["label", "SPAN"],
		["hint", "P"],
		["accent", "SPAN"],
	] as const)("emits a %s as a %s by default", (variant, tag) => {
		const { container } = render(
			<Typography variant={variant}>Kanto</Typography>
		);

		expect(container.firstChild?.nodeName).toBe(tag);
	});

	it.each([
		["headline", ["text-display", "font-extrabold"]],
		["title", ["text-base", "font-extrabold", "tracking-wide"]],
		["subtitle", ["text-sm", "font-bold"]],
		["paragraph", ["text-base", "font-normal"]],
		["caption", ["text-sm", "font-normal"]],
		["label", ["text-xs", "font-bold"]],
		["hint", ["text-xs", "font-normal"]],
		["accent", ["text-sm", "font-bold"]],
	] as const)("dresses a %s in its own grouped style", (variant, classes) => {
		const { container } = render(
			<Typography variant={variant}>Kanto</Typography>
		);

		expect(container.firstChild).toHaveClass(...classes);
	});

	it("offers three heading rungs and no more", () => {
		const headings = VARIANTS.filter((variant) => {
			const { container } = render(
				<Typography variant={variant}>Kanto</Typography>
			);
			return HEADING_TAGS.includes(container.firstChild?.nodeName ?? "");
		});

		expect(headings).toEqual(["headline", "title", "subtitle"]);
	});

	it("keeps the style when the tag is overridden", () => {
		const { container } = render(
			<Typography variant="caption" as="h2">
				Kanto
			</Typography>
		);

		expect(container.firstChild?.nodeName).toBe("H2");
		expect(container.firstChild).toHaveClass("text-sm", "font-normal");
		expect(container.firstChild).not.toHaveClass("text-base", "font-extrabold");
	});

	it("emits an h3 when a call site asks for one", () => {
		const { container } = render(
			<Typography variant="title" as="h3">
				Registry control
			</Typography>
		);

		expect(container.firstChild?.nodeName).toBe("H3");
		expect(container.firstChild).toHaveClass("text-base", "font-extrabold");
	});

	it("keeps the tag when a paragraph is asked to look like a headline", () => {
		const { container } = render(
			<Typography variant="headline" as="p">
				Kanto
			</Typography>
		);

		expect(container.firstChild?.nodeName).toBe("P");
		expect(container.firstChild).toHaveClass("text-display", "font-extrabold");
	});

	it("widens tracking on title, not on the line that wraps", () => {
		const { container: title } = render(
			<Typography variant="title">Kanto</Typography>
		);
		const { container: headline } = render(
			<Typography variant="headline">Kanto</Typography>
		);
		const { container: paragraph } = render(
			<Typography variant="paragraph">Kanto</Typography>
		);

		expect(title.firstChild).toHaveClass("tracking-wide");
		expect(headline.firstChild).not.toHaveClass("tracking-wide");
		expect(paragraph.firstChild).not.toHaveClass("tracking-wide");
	});

	it("sizes a subtitle with the body text it sits among, not with title", () => {
		const { container: subtitle } = render(
			<Typography variant="subtitle">Rebuild the registry</Typography>
		);
		const { container: caption } = render(
			<Typography variant="caption">Planning Poker</Typography>
		);

		expect(subtitle.firstChild).toHaveClass("text-sm");
		expect(caption.firstChild).toHaveClass("text-sm");
		expect(subtitle.firstChild).not.toHaveClass("text-base", "tracking-wide");
	});

	it("sizes headline off a token that carries its own line-height", () => {
		expect(appCss).toContain("--text-display: 1.375rem;");
		expect(appCss).toContain("--text-display--line-height: 1.35;");
	});

	it("ships no margin of its own, so a parent owns the spacing", () => {
		for (const variant of VARIANTS) {
			const { container } = render(
				<Typography variant={variant}>Kanto</Typography>
			);

			expect(container.firstElementChild?.className).not.toMatch(
				/\bm[bltrxy]?-/
			);
		}
	});

	it("renders its children", () => {
		render(<Typography variant="paragraph">Kanto region</Typography>);

		expect(screen.getByText("Kanto region")).toBeInTheDocument();
	});

	it.each(["headline", "title", "subtitle", "paragraph"] as const)(
		"tints %s with the shared faint tone rather than a hardcoded white",
		(variant) => {
			const { container } = render(
				<Typography variant={variant}>Kanto</Typography>
			);

			expect(container.firstChild).toHaveClass("text-theme-faint");
			expect(container.firstChild).not.toHaveClass("text-white");
		}
	);

	it.each([
		["caption", "text-theme-soft"],
		["label", "text-theme-soft"],
		["hint", "text-theme-muted"],
		["accent", "text-theme"],
	] as const)(
		"gives %s a tone of its own, not the shared one",
		(variant, tone) => {
			const { container } = render(
				<Typography variant={variant}>Kanto</Typography>
			);

			expect(container.firstChild).toHaveClass(tone);
			expect(container.firstChild).not.toHaveClass("text-theme-faint");
		}
	);

	it("sets the prose that explains a step below the prose that is read", () => {
		const { container: paragraph } = render(
			<Typography variant="paragraph">Kanto</Typography>
		);
		const { container: caption } = render(
			<Typography variant="caption">Kanto</Typography>
		);

		expect(paragraph.firstChild).toHaveClass("text-base", "text-theme-faint");
		expect(caption.firstChild).toHaveClass("text-sm", "text-theme-soft");
	});

	it("separates a label from a hint by weight and tone, not by size", () => {
		const { container: label } = render(
			<Typography variant="label">installed</Typography>
		);
		const { container: hint } = render(
			<Typography variant="hint">press to buy v3</Typography>
		);

		expect(label.firstChild).toHaveClass("text-xs", "font-bold");
		expect(hint.firstChild).toHaveClass("text-xs", "font-normal");
		expect(label.firstChild).not.toHaveClass("text-theme-muted");
	});

	it("hands accent the theme colour at full strength", () => {
		const { container } = render(
			<Typography variant="accent">balance</Typography>
		);

		expect(container.firstChild).toHaveClass("text-theme");
		expect(container.firstChild).not.toHaveClass("text-theme-soft");
	});

	it.each(["text-theme-faint", "text-theme-soft", "text-theme-muted"] as const)(
		"resolves %s to a utility app.css declares",
		(tone) => {
			expect(appCss).toContain(`@utility ${tone} {`);
		}
	);

	it("resolves the full tone to the registered colour, not a hand-written utility", () => {
		expect(appCss).not.toContain("@utility text-theme {");
		expect(appCss).toContain("@theme inline {");
		expect(appCss).toContain("--color-theme: var(--theme-color);");
	});

	it("sits the muted tone below the soft one on the same ladder", () => {
		const lightnessOf = (utility: string) => {
			const block = appCss.slice(appCss.indexOf(`@utility ${utility} {`));
			const body = block.slice(0, block.indexOf("}"));
			return Number(body.match(/var\(--theme-color\) ([\d.]+)/)?.[1]);
		};

		expect(lightnessOf("text-theme-muted")).toBeLessThan(
			lightnessOf("text-theme-soft")
		);
	});
});
