import type { ReactNode } from "react";

import { clsx } from "clsx";

import { MODERN_TONE, type ModernTone } from "./tones";

const BLOCK =
	"overflow-x-auto rounded-xl bg-zinc-950 px-5 py-4 text-sm leading-7 text-zinc-100";
const LINE = "block whitespace-pre";

export type CodeProps = {
	lines: readonly ReactNode[];
};

export const Code = ({ lines }: CodeProps) => (
	<pre className={BLOCK}>
		<code>
			{lines.map((line, index) => (
				<span key={index} className={LINE}>
					{line}
				</span>
			))}
		</code>
	</pre>
);

export type TokenProps = {
	tone: ModernTone;
	children: ReactNode;
};

export const Token = ({ tone, children }: TokenProps) => (
	<span className={clsx(MODERN_TONE[tone])}>{children}</span>
);
