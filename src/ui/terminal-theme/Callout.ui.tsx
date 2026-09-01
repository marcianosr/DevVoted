import type { ReactNode } from "react";

import { clsx } from "clsx";

import { Text } from "./Text.ui";

const CALLOUT =
	"flex items-start gap-3 rounded-lg border border-theme-soft bg-theme-soft px-3 py-2.5";
const MARK = "pt-0.5 text-theme";
const BODY = "flex min-w-0 flex-col gap-0.5";

export type CalloutProps = {
	title: string;
	detail: string;
	mark?: ReactNode;
	className?: string;
};

export const Callout = ({ title, detail, mark, className }: CalloutProps) => (
	<div className={clsx(CALLOUT, className)}>
		{mark === undefined ? null : <span className={MARK}>{mark}</span>}
		<span className={BODY}>
			<Text className="font-bold">{title}</Text>
			<Text as="p" tone="muted" size="caption">
				{detail}
			</Text>
		</span>
	</div>
);
