import { clsx } from "clsx";

import { profilePathFor } from "~/shared/lib/profilePath";

import { PlayerFaceLink } from "./Climber.ui";
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

const handleOf = (handle: string) => handle.replace(/^@/, "");

type Credited =
	{ handle: string; name?: never } | { name: string; handle?: never };

const creditOf = (credited: Credited) =>
	credited.handle === undefined
		? credited.name
		: `@${handleOf(credited.handle)}`;

const initialOf = (credit: string) =>
	(handleOf(credit)[0] ?? "?").toUpperCase();

export type AuthorSize = keyof typeof AVATAR_SIZE;

type FaceProps = {
	credit: string;
	photoUrl?: string;
	borderUrl?: string;
	userId?: string;
	size: AuthorSize;
};

const Face = ({ credit, photoUrl, borderUrl, userId, size }: FaceProps) => {
	const drawn = (
		<>
			<span aria-hidden className={FACE}>
				{initialOf(credit)}
				{photoUrl === undefined ? null : (
					<img src={photoUrl} alt="" className={PHOTO} />
				)}
			</span>
			{borderUrl === undefined ? null : (
				<img src={borderUrl} alt="" aria-hidden className={FRAME} />
			)}
		</>
	);

	if (userId === undefined)
		return <span className={clsx(AVATAR, AVATAR_SIZE[size])}>{drawn}</span>;

	return (
		<PlayerFaceLink
			userId={userId}
			name={credit}
			className={clsx(AVATAR, AVATAR_SIZE[size])}
		>
			{drawn}
		</PlayerFaceLink>
	);
};

const Credit = ({ credit, userId }: { credit: string; userId?: string }) =>
	userId === undefined ? (
		<>{credit}</>
	) : (
		<Link href={profilePathFor(userId)}>{credit}</Link>
	);

export type AuthorProps = Credited & {
	role?: string;
	title?: string;
	photoUrl?: string;
	borderUrl?: string;
	userId?: string;
	size?: AuthorSize;
	rule?: boolean;
};

export const Author = ({
	role,
	title,
	photoUrl,
	borderUrl,
	userId,
	size = "md",
	rule = true,
	...credited
}: AuthorProps) => (
	<div className={clsx(AUTHOR, rule && RULED)}>
		<Face
			credit={creditOf(credited)}
			photoUrl={photoUrl}
			borderUrl={borderUrl}
			userId={userId}
			size={size}
		/>
		<span className={CREDIT}>
			<Typography variant="hint" as="span">
				{`${CREATED_BY} `}
				<Credit credit={creditOf(credited)} userId={userId} />
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
