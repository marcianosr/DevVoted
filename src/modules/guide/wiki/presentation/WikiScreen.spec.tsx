import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { wikiScreenFor } from "~/modules/guide/wiki/application/wikiArticles.viewmodel";

import { COPY, WikiScreen } from "./WikiScreen.ui";

const contents = () =>
	within(screen.getByRole("navigation", { name: COPY.title }));

describe("WikiScreen", () => {
	it("lists every article as a link in the contents", () => {
		const view = wikiScreenFor("gates");
		render(<WikiScreen {...view} />);

		expect(contents().getAllByRole("link")).toHaveLength(view.contents.length);
	});

	it("marks the article you are reading as the current page", () => {
		render(<WikiScreen {...wikiScreenFor("gates")} />);

		expect(contents().getByRole("link", { current: "page" })).toHaveAttribute(
			"href",
			"/wiki/gates"
		);
	});

	it("titles the article and heads each of its sections", () => {
		const view = wikiScreenFor("gates");
		render(<WikiScreen {...view} />);

		const article = within(screen.getByRole("article"));

		expect(article.getByRole("heading", { name: "Gates" })).toBeInTheDocument();
		expect(
			article
				.getAllByRole("heading", { level: 3 })
				.map((heading) => heading.textContent)
		).toEqual([
			"Gates",
			...view.article.sections.map((section) => section.heading),
		]);
	});

	it("draws a table block as a table with its column headers", () => {
		render(<WikiScreen {...wikiScreenFor("gates")} />);

		expect(
			screen.getByRole("columnheader", { name: "A clear pays" })
		).toBeInTheDocument();
	});

	it("draws the glossary as terms and their meanings", () => {
		render(<WikiScreen {...wikiScreenFor("glossary")} />);

		expect(screen.getByText("Gate").tagName).toBe("DT");
	});
});

describe("WikiScreen spoilers", () => {
	it("folds the all-gates table closed behind its note and a spoiler badge", () => {
		render(<WikiScreen {...wikiScreenFor("gates")} />);

		const note = screen.getByText(
			"Each gate's place, its demands, what a clear pays and its audits."
		);
		const fold = note.closest("details");

		expect(fold).not.toBeNull();
		expect(fold).not.toHaveAttribute("open");
		expect(screen.getByText("spoiler")).toBeInTheDocument();
	});

	it("leaves a section without a spoiler open as a plain section", () => {
		render(<WikiScreen {...wikiScreenFor("gates")} />);

		expect(
			screen.getByRole("heading", { name: "The bands" }).closest("details")
		).toBeNull();
	});
});
