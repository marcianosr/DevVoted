import { clsx } from "clsx";

import { Link } from "./Link.ui";
import { Typography } from "./Typography.ui";

/**
 * `gap-4` to match the gutter a panel region gives its sides, because the
 * avatar sits between the two. An equipped border is drawn at `scale-120`, so
 * it overflows its own box by a tenth on each side — with a narrower gap the
 * frame ate into the space before the credit while the panel's padding kept
 * its own, and the avatar read as pushed against the text.
 */
const AUTHOR = "flex min-w-0 items-center gap-4";
const RULED = "w-full border-t border-edge pt-3";
const FACE =
	"absolute inset-0 flex items-center justify-center overflow-hidden rounded-sm border border-edge-strong bg-surface text-xs text-pewter";
const PHOTO = "absolute inset-0 size-full object-cover";
const FRAME = "pointer-events-none absolute inset-0 size-full scale-120";
const CREDIT = "min-w-0";
const TITLE = "block";

const AVATAR = "relative shrink-0";
const AVATAR_SIZE = {
	sm: "size-9",
	md: "size-12",
} as const;

const CREATED_BY = "Created by";
const ROLE_SEPARATOR = "·";
const GITHUB = "https://github.com";

const handleOf = (handle: string) => handle.replace(/^@/, "");

const initialOf = (handle: string) =>
	(handleOf(handle)[0] ?? "?").toUpperCase();

export type AuthorSize = keyof typeof AVATAR_SIZE;

export type AuthorProps = {
	handle: string;
	/** Account authority, on the handle line. Assigned, never earned. */
	role?: string;
	/** The earned title, on its own line beneath (ADR-109). */
	title?: string;
	photoUrl?: string;
	borderUrl?: string;
	size?: AuthorSize;
	rule?: boolean;
};

export const Author = ({
	handle,
	role,
	title,
	photoUrl,
	borderUrl,
	size = "md",
	rule = true,
}: AuthorProps) => (
	<div className={clsx(AUTHOR, rule && RULED)}>
		<span className={clsx(AVATAR, AVATAR_SIZE[size])}>
			<span aria-hidden className={FACE}>
				{initialOf(handle)}
				{photoUrl === undefined ? null : (
					<img src={photoUrl} alt="" className={PHOTO} />
				)}
			</span>
			{borderUrl === undefined ? null : (
				<img src={borderUrl} alt="" aria-hidden className={FRAME} />
			)}
		</span>
		<span className={CREDIT}>
			<Typography variant="hint" as="span">
				{`${CREATED_BY} `}
				<Link href={`${GITHUB}/${handleOf(handle)}`} external>
					{`@${handleOf(handle)}`}
				</Link>
				{role === undefined ? null : ` ${ROLE_SEPARATOR} ${role}`}
			</Typography>
			{title === undefined ? null : (
				<span className={TITLE}>
					<Typography variant="accent" as="span">
						{title}
					</Typography>
				</span>
			)}
		</span>
	</div>
);
