import { clsx } from "clsx";

import { plural } from "./format";
import { type Rarity, RARITY_TONE } from "./rarity";
import { Text } from "./Text.ui";
import { Tooltip } from "./Tooltip.ui";

const TRACK = "flex h-7 w-full items-stretch gap-0.5";

const SEGMENT =
	"flex min-w-0 items-center justify-center overflow-hidden rounded border px-1";
const INSTALLED = "border-current bg-zinc-800/80";
const MINIFIED = "border-dotted border-current bg-zinc-800/40";
const A_BYTE_BAR = "border-transparent legendary-ring bg-zinc-800/80";
const UNGRADED = "text-zinc-400";
const FREE = "border-dashed border-zinc-700";
const UNGRANTED =
	"border-edge bg-hatched transition-colors hover:border-edge-strong";
const OVERFLOW = "border-cinnabar bg-cinnabar/15 text-cinnabar";

const UNLOCK_HINT = "Clear a gate for more room, or rent a spot now";
const STUB = "flex min-w-0";
const FILL = "size-full";

const NAME = "truncate text-xxs";

export type SpotTrackConfig = {
	readonly id: string;
	readonly label: string;
	readonly spots: number;
	readonly minified?: boolean;
	readonly rarity?: Rarity;
};

export type SpotTrackProps = {
	configs: readonly SpotTrackConfig[];
	spots: number;
	maxSpots?: number;
	fits?: Rarity | null;
};

const A_BYTE = 8;

type Occupancy = {
	readonly used: number;
	readonly free: number;
	readonly overflow: number;
	readonly ungranted: number;
};

const occupancyOf = (
	configs: readonly SpotTrackConfig[],
	spots: number,
	maxSpots: number
): Occupancy => {
	const used = configs.reduce((total, config) => total + config.spots, 0);
	return {
		used,
		free: Math.max(0, spots - used),
		overflow: Math.max(0, used - spots),
		ungranted: Math.max(0, maxSpots - Math.max(spots, used)),
	};
};

const captionFor = (
	fits: Rarity | null | undefined,
	{ free, overflow }: Occupancy
): string => {
	if (overflow > 0)
		return `over capacity by ${overflow} · minify, uninstall, or rent more room`;
	if (free === 0) return "full · minify or uninstall to make room";

	const room = `${plural(free, "spot")} free`;
	if (fits === undefined) return room;
	return fits === null ? `${room} · nothing fits` : `${room} · a ${fits} fits`;
};

type Cell = {
	readonly key: string;
	readonly spots: number;
	readonly tone: string;
	readonly label?: string;
	readonly hint?: string;
};

const barShape = (config: SpotTrackConfig): string => {
	if (config.minified === true) return MINIFIED;
	return config.rarity === "byte" ? A_BYTE_BAR : INSTALLED;
};

const barTone = (config: SpotTrackConfig, isExcess: boolean): string => {
	if (isExcess) return OVERFLOW;

	return clsx(
		barShape(config),
		config.rarity ? RARITY_TONE[config.rarity] : UNGRADED
	);
};

const cellsFor = (
	configs: readonly SpotTrackConfig[],
	{ free, overflow, ungranted }: Occupancy
): readonly Cell[] => [
	...configs.map((config, index) => ({
		key: config.id,
		spots: config.spots,
		tone: barTone(config, overflow > 0 && index === configs.length - 1),
		label: config.label,
	})),
	...(free > 0 ? [{ key: "free", spots: free, tone: FREE }] : []),
	...(ungranted > 0
		? [{ key: "ungranted", spots: 1, tone: UNGRANTED, hint: UNLOCK_HINT }]
		: []),
];

const Segment = ({ cell, width }: { cell: Cell; width: number }) => {
	const style = { width: `${(cell.spots / width) * 100}%` };

	if (cell.hint === undefined)
		return (
			<span style={style} className={clsx(SEGMENT, cell.tone)}>
				{cell.label ? <span className={NAME}>{cell.label}</span> : null}
			</span>
		);

	return (
		<span style={style} className={STUB}>
			<Tooltip hint={cell.hint} className={FILL} align="right">
				<span aria-hidden className={clsx(SEGMENT, cell.tone, FILL)} />
				<span className="sr-only">{cell.hint}</span>
			</Tooltip>
		</span>
	);
};

export const SpotTrack = ({
	configs,
	spots,
	maxSpots = A_BYTE,
	fits,
}: SpotTrackProps) => {
	const occupancy = occupancyOf(configs, spots, maxSpots);
	const cells = cellsFor(configs, occupancy);
	const width = cells.reduce((total, cell) => total + cell.spots, 0) || 1;

	return (
		<div className="flex flex-col gap-1">
			<div
				className={TRACK}
				role="meter"
				aria-label={`${occupancy.used} of ${spots} spots used`}
				aria-valuenow={occupancy.used}
				aria-valuemin={0}
				aria-valuemax={spots}
			>
				{cells.map((cell) => (
					<Segment key={cell.key} cell={cell} width={width} />
				))}
			</div>
			<Text size="xxs" tone={occupancy.overflow > 0 ? "cinnabar" : "muted"}>
				{captionFor(fits, occupancy)}
			</Text>
		</div>
	);
};
