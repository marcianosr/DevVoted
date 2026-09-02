import { Text } from "./Text.ui";

const BYLINE = "flex items-center gap-2 border-t border-edge pt-3";
const AVATAR =
	"flex size-6 shrink-0 items-center justify-center rounded-full border border-edge-strong text-xs text-zinc-400";

export type BylineProps = {
	author: string;
	role?: string;
};

export const Byline = ({ author, role }: BylineProps) => (
	<div className={BYLINE}>
		<span aria-hidden className={AVATAR}>
			{author.charAt(0).toUpperCase()}
		</span>
		<Text tone="muted" size="caption">
			Created by {author}
			{role === undefined ? null : ` · ${role}`}
		</Text>
	</div>
);
