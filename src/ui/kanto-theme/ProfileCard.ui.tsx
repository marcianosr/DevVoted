import type { ReactNode } from "react";

import { clsx } from "clsx";

import { Climber } from "./Climber.ui";
import { Link } from "./Link.ui";
import { PANEL_SURFACE } from "./Panel.ui";
import { Typography } from "./Typography.ui";

export const COPY = {
	noTitle: "no title yet",
} as const;

const GITHUB = "https://github.com";

const CARD = clsx(PANEL_SURFACE, "w-full");
const CARD_LINK = "transition-colors hover:bg-theme-raised";
const HEAD = "flex w-full items-center gap-4 px-4 py-4";
const NAMING = "flex min-w-0 flex-col gap-1.5";
const NAME = "truncate text-lg font-extrabold text-theme-soft";
const TITLES = "flex flex-wrap items-center gap-1.5";
const TRAILING = "ml-auto shrink-0";

const TITLE_CHIP =
	"rounded-md border border-theme-faint bg-theme-raised px-2 py-0.5 text-xs font-bold text-theme-soft";
const NO_TITLE_CHIP =
	"rounded-md border border-dashed border-theme-faint px-2 py-0.5 text-xs text-theme-muted";

export type ProfileCardProps = {
	name: string;
	handle?: string;
	photoUrl?: string;
	borderUrl?: string;
	titles?: readonly string[];
	you?: boolean;
	href?: string;
	trailing?: ReactNode;
};

type WornTitlesProps = { titles: readonly string[] };

const WornTitles = ({ titles }: WornTitlesProps) => (
	<span className={TITLES}>
		{titles.length === 0 ? (
			<span className={NO_TITLE_CHIP}>{COPY.noTitle}</span>
		) : (
			titles.map((title) => (
				<span key={title} className={TITLE_CHIP}>
					{title}
				</span>
			))
		)}
	</span>
);

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
				<WornTitles titles={titles} />
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
