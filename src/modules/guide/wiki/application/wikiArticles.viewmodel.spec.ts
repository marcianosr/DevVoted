import { describe, expect, it } from "vitest";

import { AUDIT_IDS, auditAt } from "~/modules/run/gate/domain/audit.model";
import { CONFIG_LIST } from "~/modules/run/config/domain/configRoster.model";
import { GATE_SWATCHES } from "~/modules/run/gate/domain/swatch.model";
import {
	GATE_COUNT,
	GATE_REWARD_KB,
} from "~/modules/run/run/domain/rules.model";
import { leadTextOf } from "~/ui/kanto-theme/Lead.ui";

import {
	WIKI_ARTICLES,
	isWeightCell,
	type WikiArticle,
	type WikiBlock,
	type WikiCell,
	wikiArticleFor,
	wikiScreenFor,
} from "./wikiArticles.viewmodel";

const cellTextOf = (cell: WikiCell): string =>
	isWeightCell(cell) ? `${cell.weight}` : leadTextOf([cell]);

const textOf = (block: WikiBlock): string => {
	if (block.kind === "prose") return block.text;
	if (block.kind === "table")
		return [
			...block.table.columns,
			...block.table.rows.flat().map(cellTextOf),
		].join(" ");
	if (block.kind === "terms")
		return block.terms
			.map(({ term, meaning }) => `${term} ${meaning}`)
			.join(" ");
	if (block.kind === "stats")
		return block.stats.map(({ label, value }) => `${label} ${value}`).join(" ");
	if (block.kind === "meter" || block.kind === "build") return block.caption;
	return "";
};

const articleText = (article: WikiArticle): string =>
	article.sections
		.flatMap((section) => [section.heading, ...section.blocks.map(textOf)])
		.join(" ");

const WHOLE_WIKI = WIKI_ARTICLES.map(articleText).join(" ");

const tableRowsIn = (articleId: string, heading: string) => {
	const block = wikiArticleFor(articleId)
		?.sections.find((section) => section.heading === heading)
		?.blocks.find((candidate) => candidate.kind === "table");
	return block?.kind === "table"
		? block.table.rows.map((row) => row.map(cellTextOf))
		: [];
};

describe("wikiArticleFor", () => {
	it("returns the article with that id", () => {
		expect(wikiArticleFor("gates")?.title).toBe("Gates");
	});

	it("returns undefined for an id no article carries", () => {
		expect(wikiArticleFor("boss-gates")).toBeUndefined();
	});
});

describe("wikiScreenFor", () => {
	it("lists every article in the contents, each linking to its own page", () => {
		const { contents } = wikiScreenFor("gates");

		expect(contents.map(({ href }) => href)).toEqual(
			WIKI_ARTICLES.map(({ id }) => `/wiki/${id}`)
		);
	});

	it("opens how to play when no article is asked for", () => {
		expect(wikiScreenFor(undefined).article.id).toBe("how-to-play");
	});

	it("falls back to how to play for an unknown article", () => {
		expect(wikiScreenFor("nope").article.id).toBe("how-to-play");
	});
});

describe("the gates article", () => {
	it("states one row per gate, named after its swatch", () => {
		const rows = tableRowsIn("gates", "Every gate");

		expect(rows).toHaveLength(GATE_COUNT);
		expect(rows.map((row) => row[1])).toEqual(
			Object.values(GATE_SWATCHES).map((swatch) => swatch.gateName)
		);
	});

	it("quotes the clear payout from the gate reward, growing with the gate", () => {
		const rows = tableRowsIn("gates", "Every gate");

		expect(rows[0][5]).toBe(`${GATE_REWARD_KB} KB`);
		expect(rows[2][5]).toBe(`${GATE_REWARD_KB * 3} KB`);
	});
});

describe("the config roster", () => {
	it("lists every config exactly once", () => {
		const names = tableRowsIn("build-and-configs", "Every config").map(
			(row) => row[0]
		);

		expect(names).toEqual(CONFIG_LIST.map((config) => config.label));
	});
});

describe("redaction", () => {
	it("never names an audit, so the Dex keeps its discoveries", () => {
		const named = AUDIT_IDS.map((id) => auditAt(id, 0).name).filter((name) =>
			WHOLE_WIKI.includes(name)
		);

		expect(named).toEqual([]);
	});
});

describe("percentages", () => {
	it("reads a band line as a whole percent, never with float noise", () => {
		const okColumn = tableRowsIn("gates", "Every gate").map((row) => row[3]);

		expect(okColumn.filter((cell) => cell.endsWith(".0%"))).toEqual([]);
	});
});

describe("visuals", () => {
	it("draws the example build inside the free weight with a slot still open", () => {
		const build = WIKI_ARTICLES.flatMap((article) => article.sections)
			.flatMap((section) => section.blocks)
			.find((block) => block.kind === "build");

		expect(build?.kind).toBe("build");
		if (build?.kind !== "build") return;
		const used = build.track.fills.reduce(
			(total, fill) => total + fill.slots,
			0
		);

		expect(used).toBeGreaterThan(0);
		expect(used).toBeLessThan(build.track.held);
	});

	it("draws the example meter in the band its reading falls in", () => {
		const meter = wikiArticleFor("gates")
			?.sections.flatMap((section) => section.blocks)
			.find((block) => block.kind === "meter");

		expect(meter?.kind === "meter" && meter.meter.band).toBe("healthy");
	});

	it("draws every gate's swatch in how to play", () => {
		const swatches = wikiArticleFor("how-to-play")
			?.sections.flatMap((section) => section.blocks)
			.find((block) => block.kind === "swatches");

		expect(swatches?.kind === "swatches" && swatches.swatches).toHaveLength(
			GATE_COUNT
		);
	});
});
