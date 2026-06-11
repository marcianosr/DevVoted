import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";

type MarkdownTextProps = {
	children: string;
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

const MarkdownText = ({ children }: MarkdownTextProps) => (
	<ReactMarkdown rehypePlugins={[rehypeHighlight]}>
		{escapeMarkdownSyntax(children)}
	</ReactMarkdown>
);

export default MarkdownText;
