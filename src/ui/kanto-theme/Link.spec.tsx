import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Link } from "./Link.ui";

const HREF = "https://github.com/matthijsgroen";

describe("Link", () => {
	it("wears the screen's own theme colour, so a link belongs to the screen it sits on", () => {
		render(<Link href={HREF}>@matthijsgroen</Link>);

		expect(screen.getByRole("link")).toHaveClass(
			"text-theme-soft",
			"underline"
		);
	});

	it("draws its underline from its own ink, so the two cannot drift apart", () => {
		render(<Link href={HREF}>@matthijsgroen</Link>);

		expect(screen.getByRole("link")).toHaveClass("decoration-current/40");
	});

	it("stays in the tab for an in-app destination", () => {
		render(<Link href="/dex">the Dex</Link>);

		const link = screen.getByRole("link");

		expect(link).not.toHaveAttribute("target");
		expect(link).not.toHaveAttribute("rel");
	});

	it("opens an external destination away from the run, without a referrer", () => {
		render(
			<Link href={HREF} external>
				@matthijsgroen
			</Link>
		);

		const link = screen.getByRole("link");

		expect(link).toHaveAttribute("target", "_blank");
		expect(link).toHaveAttribute("rel", "noreferrer");
	});
});
