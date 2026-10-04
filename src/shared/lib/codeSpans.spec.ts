import { describe, expect, it } from "vitest";

import {
	hasCodeBlock,
	splitCodeBlocks,
	splitCodeSpans,
	stripCodeFence,
} from "./codeSpans";

describe("splitCodeSpans", () => {
	it("returns one text span for a question without code", () => {
		expect(splitCodeSpans("Which selectors beat a single class?")).toEqual([
			{ kind: "text", text: "Which selectors beat a single class?" },
		]);
	});

	it("marks a backtick span as code and keeps its fence", () => {
		expect(splitCodeSpans("What does `flex: 1` expand to?")).toEqual([
			{ kind: "text", text: "What does " },
			{ kind: "code", text: "`flex: 1`" },
			{ kind: "text", text: " expand to?" },
		]);
	});

	it("splits two spans in one question", () => {
		expect(splitCodeSpans("Is `==` looser than `===`?")).toEqual([
			{ kind: "text", text: "Is " },
			{ kind: "code", text: "`==`" },
			{ kind: "text", text: " looser than " },
			{ kind: "code", text: "`===`" },
			{ kind: "text", text: "?" },
		]);
	});

	it("starts with a code span without an empty text span before it", () => {
		expect(splitCodeSpans("`transform` skips layout")).toEqual([
			{ kind: "code", text: "`transform`" },
			{ kind: "text", text: " skips layout" },
		]);
	});

	it("leaves an unbalanced backtick as text", () => {
		expect(splitCodeSpans("a `b")).toEqual([{ kind: "text", text: "a `b" }]);
	});

	it("joins back to the input", () => {
		const question =
			"In `grid-template-columns: repeat(auto-fill, minmax(200px, 1fr))`, what does `auto-fill` do?";
		expect(
			splitCodeSpans(question)
				.map((span) => span.text)
				.join("")
		).toBe(question);
	});
});

describe("stripCodeFence", () => {
	it("removes the backticks around a code span", () => {
		expect(stripCodeFence("`flex: 1`")).toBe("flex: 1");
	});
});

describe("splitCodeBlocks", () => {
	it("returns one prose part for a question without a fence", () => {
		expect(splitCodeBlocks("What does `flex: 1` expand to?")).toEqual([
			{ kind: "prose", text: "What does `flex: 1` expand to?" },
		]);
	});

	it("splits a fenced block with its language off the prose around it", () => {
		expect(
			splitCodeBlocks(
				"What does this log?\n```js\nconsole.log(0.1 + 0.2)\n```\nBe honest."
			)
		).toEqual([
			{ kind: "prose", text: "What does this log?" },
			{ kind: "block", code: "console.log(0.1 + 0.2)", lang: "js" },
			{ kind: "prose", text: "Be honest." },
		]);
	});

	it("takes a fence without a language", () => {
		expect(splitCodeBlocks("```\n.box { flex: 1 }\n```")).toEqual([
			{ kind: "block", code: ".box { flex: 1 }" },
		]);
	});

	it("keeps two blocks apart", () => {
		expect(splitCodeBlocks("```js\na\n```\nversus\n```ts\nb\n```")).toEqual([
			{ kind: "block", code: "a", lang: "js" },
			{ kind: "prose", text: "versus" },
			{ kind: "block", code: "b", lang: "ts" },
		]);
	});

	it("leaves an unclosed fence as prose", () => {
		expect(
			splitCodeBlocks("What does this log?\n```js\nconsole.log(1)")
		).toEqual([
			{ kind: "prose", text: "What does this log?\n```js\nconsole.log(1)" },
		]);
	});

	it("keeps a multi-line block whole", () => {
		expect(splitCodeBlocks("```css\n.a {\n  color: red;\n}\n```")).toEqual([
			{ kind: "block", code: ".a {\n  color: red;\n}", lang: "css" },
		]);
	});
});

describe("hasCodeBlock", () => {
	it("is true only for a closed fence", () => {
		expect(hasCodeBlock("```js\n1\n```")).toBe(true);
		expect(hasCodeBlock("What does `flex: 1` expand to?")).toBe(false);
		expect(hasCodeBlock("```js\n1")).toBe(false);
	});
});
