import type { ReactNode } from "react";

import { clsx } from "clsx";

import { Climber } from "./Climber.ui";
import { Contribution, type ContributionProps } from "./Contribution.ui";
import { Link } from "./Link.ui";
import { PANEL_SURFACE } from "./Panel.ui";
import { Typography } from "./Typography.ui";
import { WornTitles } from "./WornTitles.ui";

const GITHUB = "https://github.com";

const CARD = clsx(PANEL_SURFACE, "w-full");
const CARD_LINK = "transition-colors hover:bg-theme-raised";
const HEAD = "flex w-full items-center gap-4 px-4 py-4";
const NAMING = "flex min-w-0 flex-col gap-1.5";
const NAME = "truncate text-lg font-extrabold text-theme-soft";
const TRAILING = "ml-auto shrink-0";
const RANK = "truncate text-xs uppercase tracking-wide text-theme-faint";

export type ProfileCardProps = {
	name: string;
	handle?: string;
	photoUrl?: string;
	borderUrl?: string;
	titles?: readonly string[];
	rank?: string;
	contribution?: ContributionProps;
	you?: boolean;
	href?: string;
	trailing?: ReactNode;
};

type HandleProps = { handle: string; linked: boolean };

const Handle = ({ handle, linked }: HandleProps) => (
	<Typography variant="hint" as="span">
		{linked ? (
			<Link href={`${GITHUB}/${handle}`} external>
				{`@${handle}`}
			</Link>
		) : (
			`@${handle}`
		)}
	</Typography>
);

export const ProfileCard = ({
	name,
	handle,
	photoUrl,
	borderUrl,
	titles = [],
	rank,
	contribution,
	you = false,
	href,
	trailing,
}: ProfileCardProps) => {
	const head = (
		<span className={HEAD}>
			<Climber
				name={name}
				photoUrl={photoUrl}
				borderUrl={borderUrl}
				you={you}
				size="lg"
			/>
			<span className={NAMING}>
				<span className={NAME}>{name}</span>
				{handle === undefined ? null : (
					<Handle handle={handle} linked={href === undefined} />
				)}
				{rank === undefined ? null : <span className={RANK}>{rank}</span>}
				<WornTitles titles={titles} />
				{contribution === undefined ? null : <Contribution {...contribution} />}
			</span>
			{trailing === undefined ? null : (
				<span className={TRAILING}>{trailing}</span>
			)}
		</span>
	);

	if (href === undefined) return <section className={CARD}>{head}</section>;

	return (
		<a href={href} className={clsx(CARD, CARD_LINK)}>
			{head}
		</a>
	);
};
