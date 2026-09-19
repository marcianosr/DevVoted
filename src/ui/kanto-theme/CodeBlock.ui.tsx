import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";

import { highlightOptions } from "~/shared/lib/syntaxHighlight";

import { Panel } from "./Panel.ui";

const CODE =
	"w-full overflow-x-auto text-sm [&_code]:bg-transparent [&_pre]:bg-transparent [&_pre]:m-0 [&_pre]:p-0";

const FENCE = "```";

export type CodeBlockProps = {
	children: string;
};

export const CodeBlock = ({ children }: CodeBlockProps) => (
	<Panel className={CODE}>
		<Panel.Body>
			<ReactMarkdown rehypePlugins={[[rehypeHighlight, highlightOptions]]}>
				{`${FENCE}\n${children}\n${FENCE}`}
			</ReactMarkdown>
		</Panel.Body>
	</Panel>
);
