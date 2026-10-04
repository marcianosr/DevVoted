const CODE_SPAN = /(`+[^`]*`+)/g;
const CODE_FENCE = /^`+|`+$/g;

export type CodeSpan = { kind: "text" | "code"; text: string };

export const splitCodeSpans = (text: string): readonly CodeSpan[] =>
	text
		.split(CODE_SPAN)
		.map((segment, index): CodeSpan => ({
			kind: index % 2 === 0 ? "text" : "code",
			text: segment,
		}))
		.filter((span) => span.text !== "");

export const stripCodeFence = (span: string): string =>
	span.replace(CODE_FENCE, "");

const FENCED_BLOCK = /^```([\w-]+)?[ \t]*\r?\n([\s\S]*?)\r?\n?^```[ \t]*$/gm;

export type CodeBlockPart =
	| { kind: "prose"; text: string }
	| { kind: "block"; code: string; lang?: string };

type Fence = {
	start: number;
	end: number;
	code: string;
	lang: string | undefined;
};

const fencesOf = (text: string): readonly Fence[] =>
	[...text.matchAll(FENCED_BLOCK)].map((match) => ({
		start: match.index,
		end: match.index + match[0].length,
		code: match[2] ?? "",
		lang: match[1],
	}));

const proseOf = (text: string): readonly CodeBlockPart[] =>
	text.trim() === "" ? [] : [{ kind: "prose", text: text.trim() }];

const blockOf = ({ code, lang }: Fence): CodeBlockPart =>
	lang === undefined ? { kind: "block", code } : { kind: "block", code, lang };

export const splitCodeBlocks = (text: string): readonly CodeBlockPart[] => {
	const fences = fencesOf(text);
	return [
		...fences.flatMap((fence, index) => [
			...proseOf(text.slice(fences[index - 1]?.end ?? 0, fence.start)),
			blockOf(fence),
		]),
		...proseOf(text.slice(fences.at(-1)?.end ?? 0)),
	];
};

export const hasCodeBlock = (text: string): boolean =>
	splitCodeBlocks(text).some((part) => part.kind === "block");
