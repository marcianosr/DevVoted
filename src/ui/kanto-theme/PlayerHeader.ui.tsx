import { clsx } from "clsx";
import type { ReactNode } from "react";

import { Badge } from "./Badge.ui";
import {
	COPY as CONTRIBUTION_COPY,
	type ContributionProps,
} from "./Contribution.ui";
import type { KantoColor } from "./colors";
import { Link } from "./Link.ui";
import type { SwatchFill } from "./Swatch.ui";
import { SwatchTrack } from "./SwatchTrack.ui";
import { Typography } from "./Typography.ui";
import { WornTitles } from "./WornTitles.ui";

const HEADER = "flex w-full min-w-0 flex-col gap-4";
const IDENTITY = "flex w-full min-w-0 items-center gap-4";
const NAMING = "flex min-w-0 flex-1 flex-col gap-1";
const NAME = {
	card: "text-lg font-extrabold break-words text-theme-soft",
	hero: "text-2xl font-extrabold break-words text-theme-soft sm:text-4xl",
} as const;
const ROLE = "flex items-center gap-2 text-sm font-bold text-theme-soft";
const ROLE_DOT = "size-2 shrink-0 rounded-full bg-current";
const TRAILING = "ml-auto flex shrink-0 self-start";
const STRIP =
	"grid w-full overflow-hidden rounded-xl border border-theme-faint divide-x divide-theme-faint";
const STRIP_COLUMNS = { 1: "grid-cols-1", 2: "grid-cols-2" } as const;
const CELL = "flex min-w-0 flex-col gap-0.5 px-4 py-3";
const FIGURE = "text-xl font-extrabold tabular-nums text-theme-soft";
const SWATCHES = "flex flex-wrap items-center gap-x-4 gap-y-2";
const SWATCH_HEAD = "flex items-center gap-2";

const GITHUB = "https://github.com";

export type PlayerHeaderSize = keyof typeof NAME;

export type PlayerHeaderSwatches = {
	fills: readonly SwatchFill[];
	label?: string;
	value?: string;
};

export type PlayerHeaderProps = {
	face: ReactNode;
	name: string;
	nameHref?: string;
	nameAs?: "h1" | "span";
	size?: PlayerHeaderSize;
	handle?: string;
	titles?: readonly string[];
	titleRest?: KantoColor;
	contribution?: ContributionProps;
	swatches?: PlayerHeaderSwatches;
	trailing?: ReactNode;
};

type StatCell = { figure: string; words: string };

const statCellsOf = ({ answered, authored }: ContributionProps): StatCell[] => [
	...(authored === undefined
		? []
		: [CONTRIBUTION_COPY.published(authored.published)]),
	CONTRIBUTION_COPY.answered(answered),
];

const StatStrip = ({ contribution }: { contribution: ContributionProps }) => {
	const cells = statCellsOf(contribution);

	return (
		<div
			className={clsx(
				STRIP,
				cells.length > 1 ? STRIP_COLUMNS[2] : STRIP_COLUMNS[1]
			)}
		>
			{cells.map((cell) => (
				<span key={cell.words} className={CELL}>
					<span className={FIGURE}>{cell.figure}</span>
					<Typography variant="hint" as="span">
						{cell.words}
					</Typography>
				</span>
			))}
		</div>
	);
};

const Swatches = ({ fills, label, value }: PlayerHeaderSwatches) => (
	<div className={SWATCHES}>
		{label === undefined ? null : (
			<span className={SWATCH_HEAD}>
				<Typography variant="hint" as="span">
					{label}
				</Typography>
				{value === undefined ? null : <Badge>{value}</Badge>}
			</span>
		)}
		<SwatchTrack swatches={fills} size="small" />
	</div>
);

const Byline = ({ role, handle }: { role?: string; handle?: string }) =>
	role === undefined && handle === undefined ? null : (
		<span className={ROLE}>
			{role === undefined ? null : (
				<>
					<span aria-hidden className={ROLE_DOT} />
					{role}
				</>
			)}
			{handle === undefined ? null : (
				<Typography variant="hint" as="span">
					<Link href={`${GITHUB}/${handle}`} external>
						{`@${handle}`}
					</Link>
				</Typography>
			)}
		</span>
	);

export const PlayerHeader = ({
	face,
	name,
	nameHref,
	nameAs = "span",
	size = "card",
	handle,
	titles = [],
	titleRest,
	contribution,
	swatches,
	trailing,
}: PlayerHeaderProps) => {
	const Name = nameAs;

	return (
		<div className={HEADER}>
			<div className={IDENTITY}>
				{face}
				<span className={NAMING}>
					<Name className={NAME[size]}>
						{nameHref === undefined ? (
							name
						) : (
							<Link href={nameHref}>{name}</Link>
						)}
					</Name>
					<Byline role={contribution?.authored?.role} handle={handle} />
				</span>
				{trailing === undefined ? null : (
					<span className={TRAILING}>{trailing}</span>
				)}
			</div>
			{titles.length === 0 ? null : (
				<WornTitles titles={titles} rest={titleRest} />
			)}
			{contribution === undefined ? null : (
				<StatStrip contribution={contribution} />
			)}
			{swatches === undefined ? null : <Swatches {...swatches} />}
		</div>
	);
};
