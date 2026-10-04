import { clsx } from "clsx";

import { Badge } from "./Badge.ui";
import { Climber } from "./Climber.ui";
import { Contribution } from "./Contribution.ui";
import { Link } from "./Link.ui";
import type { ProfileCardProps } from "./ProfileCard.ui";
import { StatTiles, type StatTile } from "./StatTiles.ui";
import type { SwatchFill } from "./Swatch.ui";
import { SwatchTrack } from "./SwatchTrack.ui";
import { Typography } from "./Typography.ui";
import { WornTitles } from "./WornTitles.ui";

const GITHUB = "https://github.com";

const HERO =
	"relative flex w-full flex-col overflow-hidden rounded-2xl border border-theme-faint bg-theme-raised";
const HERO_PREVIEW = "ring-2 ring-saffron";
const PREVIEW = "absolute top-3 right-5 text-xs font-bold text-saffron";
const HEAD =
	"flex w-full flex-wrap items-center gap-x-6 gap-y-4 bg-linear-to-br from-theme/20 via-theme/5 to-transparent px-6 py-6";
const NAMING = "flex min-w-0 flex-1 flex-col gap-2";
const NAME = "text-2xl font-extrabold break-words text-theme-soft sm:text-4xl";
const WEARING = "flex flex-wrap items-center gap-x-3 gap-y-2";
const RECORD = "border-t border-theme-faint px-6 py-5";
const SWATCH_ROW = "flex flex-wrap items-center gap-x-4 gap-y-2";
const SWATCH_HEAD = "flex items-center gap-2";

export type HeroRecord = {
	stats: readonly StatTile[];
	swatches: { label: string; value: string; fills: readonly SwatchFill[] };
};

export type ProfileHeroProps = Omit<ProfileCardProps, "href" | "trailing"> & {
	record?: HeroRecord;
	preview?: string;
};

const SwatchRow = ({ label, value, fills }: HeroRecord["swatches"]) => (
	<div className={SWATCH_ROW}>
		<span className={SWATCH_HEAD}>
			<Typography variant="hint" as="span">
				{label}
			</Typography>
			<Badge>{value}</Badge>
		</span>
		<SwatchTrack swatches={fills} size="small" />
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
	record,
	preview,
}: ProfileHeroProps) => (
	<section className={clsx(HERO, preview !== undefined && HERO_PREVIEW)}>
		{preview === undefined ? null : <span className={PREVIEW}>{preview}</span>}
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
				<div className={WEARING}>
					<WornTitles titles={titles} />
					{contribution === undefined ? null : (
						<Contribution {...contribution} />
					)}
				</div>
			</div>
		</div>
		{record === undefined ? null : (
			<div className={RECORD}>
				<StatTiles stats={record.stats}>
					<SwatchRow {...record.swatches} />
				</StatTiles>
			</div>
		)}
	</section>
);
