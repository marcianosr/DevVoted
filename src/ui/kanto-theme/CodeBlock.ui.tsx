import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";

import { highlightOptions } from "~/shared/lib/syntaxHighlight";

const CODE = "w-full overflow-x-auto text-sm [&_pre]:m-0";

const FENCE = "```";

export type CodeBlockProps = {
	children: string;
	lang?: string;
};

export const CodeBlock = ({ children, lang = "" }: CodeBlockProps) => (
	<div className={CODE}>
		<ReactMarkdown rehypePlugins={[[rehypeHighlight, highlightOptions]]}>
			{`${FENCE}${lang}\n${children}\n${FENCE}`}
		</ReactMarkdown>
	</div>
);
