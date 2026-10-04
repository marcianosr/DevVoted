import type { ReactNode } from "react";

import { clsx } from "clsx";

import { Climber } from "./Climber.ui";
import { Contribution } from "./Contribution.ui";
import { Link } from "./Link.ui";
import { PANEL_SURFACE } from "./Panel.ui";
import type { ProfileCardProps } from "./ProfileCard.ui";
import { Typography } from "./Typography.ui";
import { WornTitles } from "./WornTitles.ui";

const GITHUB = "https://github.com";

const HERO = clsx(PANEL_SURFACE, "w-full");
const HEAD = "flex w-full flex-wrap items-center gap-5 px-6 py-6";
const NAMING = "flex min-w-0 flex-1 flex-col gap-2";
const NAME = "text-2xl font-extrabold break-words text-theme-soft sm:text-4xl";
const TRAILING = "shrink-0 self-start";

const TROPHIES = "grid w-full grid-cols-3 border-t border-theme-faint";
const TROPHY =
	"flex min-w-0 flex-col gap-1 border-l border-theme-faint px-6 py-4 first:border-l-0";
const FIGURE_ROW = "flex items-baseline gap-1.5";
const FIGURE = "text-3xl font-extrabold tabular-nums text-theme sm:text-4xl";
const OUT_OF = "text-sm font-bold tabular-nums text-theme-muted";
const YOURS = "text-xs tabular-nums text-theme-faint";

export type Trophy = {
	label: string;
	figure: string;
	outOf?: string;
	yours?: string;
};

export type ProfileHeroProps = Omit<ProfileCardProps, "href" | "trailing"> & {
	trophies: readonly Trophy[];
	trailing?: ReactNode;
};

const TrophyFigure = ({ label, figure, outOf, yours }: Trophy) => (
	<div className={TROPHY}>
		<Typography variant="hint" as="span">
			{label}
		</Typography>
		<span className={FIGURE_ROW}>
			<span className={FIGURE}>{figure}</span>
			{outOf === undefined ? null : <span className={OUT_OF}>{outOf}</span>}
		</span>
		{yours === undefined ? null : <span className={YOURS}>{yours}</span>}
	</div>
);

export const ProfileHero = ({
	name,
	handle,
	photoUrl,
	borderUrl,
	titles = [],
	contribution,
	you = false,
	trailing,
	trophies,
}: ProfileHeroProps) => (
	<section className={HERO}>
		<div className={HEAD}>
			<Climber
				name={name}
				photoUrl={photoUrl}
				borderUrl={borderUrl}
				you={you}
				size="xl"
			/>
			<div className={NAMING}>
				<h1 className={NAME}>{name}</h1>
				{handle === undefined ? null : (
					<Typography variant="hint" as="span">
						<Link href={`${GITHUB}/${handle}`} external>
							{`@${handle}`}
						</Link>
					</Typography>
				)}
				<WornTitles titles={titles} />
				{contribution === undefined ? null : <Contribution {...contribution} />}
			</div>
			{trailing === undefined ? null : (
				<span className={TRAILING}>{trailing}</span>
			)}
		</div>
		<div className={TROPHIES}>
			{trophies.map((trophy) => (
				<TrophyFigure key={trophy.label} {...trophy} />
			))}
		</div>
	</section>
);
