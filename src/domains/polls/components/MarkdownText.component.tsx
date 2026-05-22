import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";

type MarkdownTextProps = {
	children: string;
};

const escapeMarkdownSyntax = (text: string): string =>
	text
		.replace(/^>/gm, "\\>") // blockquote
		.replace(/^([-+*])\s*$/gm, "\\$1") // standalone list markers (no content after)
		.replace(/</g, "&lt;") // HTML tags
		.replace(/(?<!\\)>/g, "&gt;"); // remaining > not at line start

const MarkdownText = ({ children }: MarkdownTextProps) => (
	<ReactMarkdown rehypePlugins={[rehypeHighlight]}>
		{escapeMarkdownSyntax(children)}
	</ReactMarkdown>
);

export default MarkdownText;
