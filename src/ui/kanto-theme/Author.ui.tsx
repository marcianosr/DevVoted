import { clsx } from "clsx";

import { Typography } from "./Typography.ui";

const AUTHOR = "flex min-w-0 items-center gap-3";
const RULED = "w-full border-t border-edge pt-3";
const FACE =
	"absolute inset-0 flex items-center justify-center overflow-hidden rounded-sm border border-edge-strong bg-surface text-xs text-pewter";
const PHOTO = "absolute inset-0 size-full object-cover";
const FRAME = "pointer-events-none absolute inset-0 size-full scale-120";
const CREDIT = "min-w-0 opacity-60";

const AVATAR = "relative shrink-0";
const AVATAR_SIZE = {
	sm: "size-5",
	md: "size-8",
} as const;

const CREATED_BY = "Created by";
const TITLE_SEPARATOR = "·";

const GITHUB_AVATAR_HOST = "https://github.com";

const handleOf = (handle: string) => handle.replace(/^@/, "");

export const githubAvatarUrl = (handle: string) =>
	`${GITHUB_AVATAR_HOST}/${handleOf(handle)}.png`;

const initialOf = (handle: string) =>
	(handleOf(handle)[0] ?? "?").toUpperCase();

export type AuthorSize = keyof typeof AVATAR_SIZE;

export type AuthorProps = {
	handle: string;
	title?: string;
	borderUrl?: string;
	size?: AuthorSize;
	rule?: boolean;
};

export const Author = ({
	handle,
	title,
	borderUrl,
	size = "md",
	rule = true,
}: AuthorProps) => (
	<div className={clsx(AUTHOR, rule && RULED)}>
		<span className={clsx(AVATAR, AVATAR_SIZE[size])}>
			<span aria-hidden className={FACE}>
				{initialOf(handle)}
				<img src={githubAvatarUrl(handle)} alt="" className={PHOTO} />
			</span>
			{borderUrl === undefined ? null : (
				<img src={borderUrl} alt="" aria-hidden className={FRAME} />
			)}
		</span>
		<span className={CREDIT}>
			<Typography variant="caption">
				{`${CREATED_BY} @${handleOf(handle)}`}
				{title === undefined ? "" : ` ${TITLE_SEPARATOR} ${title}`}
			</Typography>
		</span>
	</div>
);
