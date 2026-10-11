import { Fragment } from "react";

import {
	splitCodeBlocks,
	splitCodeSpans,
	stripCodeFence,
} from "~/shared/lib/codeSpans";

import { CodeBlock } from "./CodeBlock.ui";

const PROSE = "whitespace-pre-line";
const CODE = "rounded-xs bg-theme-raised px-1 text-theme";
const CODE_TEXT = "flex min-w-0 flex-col gap-2";

export const CodeSpans = ({ text }: { text: string }) => (
	<span className={PROSE}>
		{splitCodeSpans(text).map((span, index) =>
			span.kind === "code" ? (
				<code key={`${index}-${span.text}`} className={CODE}>
					{stripCodeFence(span.text)}
				</code>
			) : (
				<Fragment key={`${index}-${span.text}`}>{span.text}</Fragment>
			)
		)}
	</span>
);

export const CodeText = ({ text }: { text: string }) => (
	<span className={CODE_TEXT}>
		{splitCodeBlocks(text).map((part, index) =>
			part.kind === "block" ? (
				<CodeBlock key={`${part.kind}-${index}`} lang={part.lang}>
					{part.code}
				</CodeBlock>
			) : (
				<CodeSpans key={`${part.kind}-${index}`} text={part.text} />
			)
		)}
	</span>
);
