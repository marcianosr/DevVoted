import css from "highlight.js/lib/languages/css";
import java from "highlight.js/lib/languages/java";
import javascript from "highlight.js/lib/languages/javascript";
import typescript from "highlight.js/lib/languages/typescript";
import xml from "highlight.js/lib/languages/xml";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";

const highlightOptions = {
	detect: true,
	languages: {
		css,
		java,
		javascript,
		js: javascript,
		typescript,
		ts: typescript,
		html: xml,
		vue: xml,
		xml,
	},
};

const escapeOutsideCodeSpans = (
	text: string,
	transform: (segment: string) => string
): string =>
	text
		.split(/(`+[^`]*`+)/g)
		.map((segment, index) => (index % 2 === 0 ? transform(segment) : segment))
		.join("");

const escapeMarkdownSyntax = (text: string): string =>
	escapeOutsideCodeSpans(
		text,
		(segment) =>
			segment
				.replace(/&/g, "&amp;") // must run first so pre-existing entities (e.g. "&lt;") survive markdown's entity-decoding step
				.replace(/^>/gm, "\\>") // blockquote
				.replace(/^([-+*])\s*$/gm, "\\$1") // standalone list markers (no content after)
				.replace(/</g, "&lt;") // HTML tags
				.replace(/(?<!\\)>/g, "&gt;") // remaining > not at line start
	);

/**
 * Renders question markdown with language-aware syntax highlighting. Question
 * source is authored markdown, so it is passed through untouched.
 */
export const QuestionMarkdown = ({ children }: { children: string }) => (
	<ReactMarkdown rehypePlugins={[[rehypeHighlight, highlightOptions]]}>
		{children}
	</ReactMarkdown>
);

/**
 * Renders free-text markdown (poll options, explanations) where stray markdown
 * and HTML syntax must be escaped so user content renders literally.
 */
export const MarkdownText = ({ children }: { children: string }) => (
	<ReactMarkdown rehypePlugins={[rehypeHighlight]}>
		{escapeMarkdownSyntax(children)}
	</ReactMarkdown>
);
