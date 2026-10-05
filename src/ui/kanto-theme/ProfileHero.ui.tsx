import { clsx } from "clsx";

import { Climber } from "./Climber.ui";
import { PlayerHeader, type PlayerHeaderSwatches } from "./PlayerHeader.ui";
import type { ProfileCardProps } from "./ProfileCard.ui";
import { StatTiles, type StatTile } from "./StatTiles.ui";

const HERO =
	"relative flex w-full flex-col overflow-hidden rounded-2xl border border-theme-faint bg-theme-raised";
const HERO_PREVIEW = "ring-2 ring-saffron";
const PREVIEW = "absolute top-3 right-5 text-xs font-bold text-saffron";
const HEAD =
	"w-full bg-linear-to-br from-theme/20 via-theme/5 to-transparent px-4 py-5 sm:px-6 sm:py-6";
const RECORD = "border-t border-theme-faint px-4 py-5 sm:px-6";

export type HeroRecord = {
	stats: readonly StatTile[];
};

export type ProfileHeroProps = Omit<ProfileCardProps, "href" | "trailing"> & {
	swatches?: PlayerHeaderSwatches;
	record?: HeroRecord;
	preview?: string;
};

export const ProfileHero = ({
	name,
	handle,
	photoUrl,
	borderUrl,
	titles = [],
	contribution,
	swatches,
	you = false,
	record,
	preview,
}: ProfileHeroProps) => (
	<section className={clsx(HERO, preview !== undefined && HERO_PREVIEW)}>
		{preview === undefined ? null : <span className={PREVIEW}>{preview}</span>}
		<div className={HEAD}>
			<PlayerHeader
				face={
					<Climber
						name={name}
						photoUrl={photoUrl}
						borderUrl={borderUrl}
						you={you}
						size="xl"
					/>
				}
				name={name}
				nameAs="h1"
				size="hero"
				handle={handle}
				titles={titles}
				contribution={contribution}
				swatches={swatches}
			/>
		</div>
		{record === undefined ? null : (
			<div className={RECORD}>
				<StatTiles stats={record.stats} />
			</div>
		)}
	</section>
);
