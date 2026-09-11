import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";

import { highlightOptions } from "~/shared/lib/syntaxHighlight";

const escapeOutsideCodeSpans = (
	text: string,
	transform: (segment: string) => string
): string =>
	text
		.split(/(`+[^`]*`+)/g)
		.map((segment, index) => (index % 2 === 0 ? transform(segment) : segment))
		.join("");

const escapeMarkdownSyntax = (text: string): string =>
	escapeOutsideCodeSpans(text, (segment) =>
		segment
			.replace(/&/g, "&amp;")
			.replace(/^>/gm, "\\>")
			.replace(/^([-+*])\s*$/gm, "\\$1")
			.replace(/</g, "&lt;")
			.replace(/(?<!\\)>/g, "&gt;")
	);

export const QuestionMarkdown = ({ children }: { children: string }) => (
	<ReactMarkdown rehypePlugins={[[rehypeHighlight, highlightOptions]]}>
		{children}
	</ReactMarkdown>
);

export const MarkdownText = ({ children }: { children: string }) => (
	<ReactMarkdown rehypePlugins={[rehypeHighlight]}>
		{escapeMarkdownSyntax(children)}
	</ReactMarkdown>
);

export const CodeBlockMarkdown = ({ children }: { children: string }) => (
	<ReactMarkdown rehypePlugins={[[rehypeHighlight, highlightOptions]]}>
		{`\`\`\`\n${children}\n\`\`\``}
	</ReactMarkdown>
);
