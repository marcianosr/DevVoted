import { Typography } from "./Typography.ui";

const AUTHOR = "flex w-full items-center gap-3 border-t border-edge pt-3";
const AVATAR = "relative size-8 shrink-0";
const FACE =
	"absolute inset-0 flex items-center justify-center overflow-hidden rounded-sm border border-edge-strong bg-surface text-xs text-pewter";
const PHOTO = "absolute inset-0 size-full object-cover";
const FRAME = "pointer-events-none absolute inset-0 size-full scale-120";
const CREDIT = "min-w-0 opacity-60";

const CREATED_BY = "Created by";
const TITLE_SEPARATOR = "·";

const GITHUB_AVATAR_HOST = "https://github.com";

const handleOf = (handle: string) => handle.replace(/^@/, "");

export const githubAvatarUrl = (handle: string) =>
	`${GITHUB_AVATAR_HOST}/${handleOf(handle)}.png`;

const initialOf = (handle: string) =>
	(handleOf(handle)[0] ?? "?").toUpperCase();

export type AuthorProps = {
	handle: string;
	title?: string;
	borderUrl?: string;
};

export const Author = ({ handle, title, borderUrl }: AuthorProps) => (
	<div className={AUTHOR}>
		<span className={AVATAR}>
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
