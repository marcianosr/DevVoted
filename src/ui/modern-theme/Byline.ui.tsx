import { Text } from "./Text.ui";

const BYLINE = "flex items-center gap-2";

// Initial only: the handle sits beside it in text, so the disc is decoration.
const AVATAR =
	"inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-surface-raised text-xs font-bold text-zinc-300";

export type BylineProps = {
	author: string;
	role?: string;
};

export const Byline = ({ author, role }: BylineProps) => (
	<p className={BYLINE}>
		<span aria-hidden className={AVATAR}>
			{author.charAt(0).toUpperCase()}
		</span>
		<Text size="meta" tone="muted">
			Created by
		</Text>
		<Text size="meta">@{author}</Text>
		{role ? (
			<Text size="meta" tone="muted">
				· {role}
			</Text>
		) : null}
	</p>
);
