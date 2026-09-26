import { clsx } from "clsx";

import { Link } from "./Link.ui";
import { Typography } from "./Typography.ui";

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
const PROFILE_OF = (handle: string) => `${handle}'s profile`;

const handleOf = (handle: string) => handle.replace(/^@/, "");

const initialOf = (handle: string) =>
	(handleOf(handle)[0] ?? "?").toUpperCase();

export type AuthorSize = keyof typeof AVATAR_SIZE;

type FaceProps = {
	handle: string;
	photoUrl?: string;
	borderUrl?: string;
	profileHref?: string;
	size: AuthorSize;
};

const Face = ({
	handle,
	photoUrl,
	borderUrl,
	profileHref,
	size,
}: FaceProps) => {
	const drawn = (
		<>
			<span aria-hidden className={FACE}>
				{initialOf(handle)}
				{photoUrl === undefined ? null : (
					<img src={photoUrl} alt="" className={PHOTO} />
				)}
			</span>
			{borderUrl === undefined ? null : (
				<img src={borderUrl} alt="" aria-hidden className={FRAME} />
			)}
		</>
	);

	if (profileHref === undefined)
		return <span className={clsx(AVATAR, AVATAR_SIZE[size])}>{drawn}</span>;

	return (
		<a
			href={profileHref}
			aria-label={PROFILE_OF(`@${handleOf(handle)}`)}
			className={clsx(AVATAR, AVATAR_SIZE[size])}
		>
			{drawn}
		</a>
	);
};

export type AuthorProps = {
	handle: string;
	role?: string;
	title?: string;
	photoUrl?: string;
	borderUrl?: string;
	profileHref?: string;
	size?: AuthorSize;
	rule?: boolean;
};

export const Author = ({
	handle,
	role,
	title,
	photoUrl,
	borderUrl,
	profileHref,
	size = "md",
	rule = true,
}: AuthorProps) => (
	<div className={clsx(AUTHOR, rule && RULED)}>
		<Face
			handle={handle}
			photoUrl={photoUrl}
			borderUrl={borderUrl}
			profileHref={profileHref}
			size={size}
		/>
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
