import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { AppFooter, type AppFooterProps } from "./AppFooter.ui";

const PROPS: AppFooterProps = {
	pollCount: 96,
	categoryCount: 12,
	configCount: 46,
	lastCommitDate: "26 Sep 2026",
	lastCommitAuthor: "marciano",
	wikiHref: "/wiki",
};

describe("AppFooter", () => {
	it("leads with the brand mark and the wordmark", () => {
		const { container } = render(<AppFooter {...PROPS} />);

		expect(screen.getByText("devvoted")).toBeVisible();
		expect(container.querySelector("svg")).toHaveClass("text-brand-sand");
	});

	it("stacks the tagline and the counts under the wordmark", () => {
		render(<AppFooter {...PROPS} />);

		const column = screen.getByText("devvoted").parentElement;
		expect(column).toContainElement(
			screen.getByText(
				"a roguelite obsession, built with craftsmanship, passion ♥ & TanStack Start"
			)
		);
		expect(column).toContainElement(screen.getByText("96 polls"));
	});

	it("spells the ampersand as a character rather than as its escape", () => {
		render(<AppFooter {...PROPS} />);

		expect(screen.queryByText(/&amp;/)).not.toBeInTheDocument();
	});

	it("states every count once the poll total has landed", () => {
		render(<AppFooter {...PROPS} />);

		expect(screen.getByText("96 polls")).toBeVisible();
		expect(screen.getByText("12 categories")).toBeVisible();
		expect(screen.getByText("46 configs")).toBeVisible();
	});

	it("badges each total rather than writing it into prose", () => {
		render(<AppFooter {...PROPS} />);

		for (const count of ["96 polls", "12 categories", "46 configs"]) {
			expect(screen.getByText(count)).toHaveClass("badge-theme");
		}
	});

	it("separates the totals by their badges instead of punctuation", () => {
		render(<AppFooter {...PROPS} />);

		expect(screen.queryAllByText("·")).toHaveLength(0);
	});

	it("leaves the badged totals on the footer's own pewter", () => {
		render(<AppFooter {...PROPS} />);

		expect(screen.getByText("96 polls")).not.toHaveAttribute(
			"data-screen-theme"
		);
	});

	it("drops the poll count while the total is unknown", () => {
		render(<AppFooter {...PROPS} pollCount={null} />);

		expect(screen.queryByText("96 polls")).not.toBeInTheDocument();
		expect(screen.getByText("12 categories")).toBeVisible();
	});

	it("names who made the last change and when", () => {
		render(<AppFooter {...PROPS} />);

		expect(screen.getByText("26 Sep 2026")).toBeVisible();
		expect(screen.getByText("@marciano")).toBeVisible();
	});

	it("prints the commit date in lowercase without restating it", () => {
		render(<AppFooter {...PROPS} />);

		expect(screen.getByText("26 Sep 2026")).toHaveClass("lowercase");
	});

	it("points the bug report at the issue tracker in a new tab", () => {
		render(<AppFooter {...PROPS} />);

		const report = screen.getByRole("link", { name: "report a bug" });
		expect(report).toHaveAttribute(
			"href",
			"https://github.com/marcianosr/DevVoted/issues"
		);
		expect(report).toHaveAttribute("target", "_blank");
		expect(report).toHaveAttribute("rel", "noreferrer");
	});

	it("keeps the footer neutral instead of taking the screen's theme", () => {
		const { container } = render(<AppFooter {...PROPS} />);

		expect(container.querySelector("[data-screen-theme]")).toHaveAttribute(
			"data-screen-theme",
			"pewter"
		);
	});

	it("hides the wiki link without a wiki address", () => {
		render(<AppFooter {...PROPS} wikiHref={undefined} />);

		expect(screen.queryByText("wiki")).not.toBeInTheDocument();
	});

	it("links to the wiki", () => {
		render(<AppFooter {...PROPS} />);

		expect(screen.getByRole("link", { name: /wiki/ })).toHaveAttribute(
			"href",
			"/wiki"
		);
	});

	it("opens the wiki in place on a plain click", async () => {
		const onNavigate = vi.fn();
		render(<AppFooter {...PROPS} onNavigate={onNavigate} />);

		await userEvent.click(screen.getByRole("link", { name: /wiki/ }));

		expect(onNavigate).toHaveBeenCalledWith("/wiki");
	});
});
