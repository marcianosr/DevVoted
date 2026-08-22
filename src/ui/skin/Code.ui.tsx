import type { ReactNode } from "react";

import { clsx } from "clsx";

import { SKIN_TONE, type SkinTone } from "./tones";

const BLOCK = "overflow-x-auto bg-zinc-950 px-2 py-2 text-xs";
const LINE = "flex gap-4";
const NUMBER = "w-4 shrink-0 text-right text-pewter tabular-nums select-none";
const SOURCE = "whitespace-pre text-zinc-100";

export type CodeProps = {
	lines: readonly ReactNode[];
};

export const Code = ({ lines }: CodeProps) => (
	<pre className={BLOCK}>
		{lines.map((line, index) => (
			<div key={index} className={LINE}>
				<span className={NUMBER}>{index + 1}</span>
				<code className={SOURCE}>{line}</code>
			</div>
		))}
	</pre>
);

export const Token = ({
	tone,
	children,
}: {
	tone: SkinTone;
	children: ReactNode;
}) => <span className={clsx(SKIN_TONE[tone])}>{children}</span>;
