import type { SwatchTheme } from "~/modules/run/gate/domain/swatch.model";

import { Meter } from "./Meter.ui";
import { Swatch } from "./Swatch.ui";
import { SwatchTrack, type TrackSwatch } from "./SwatchTrack.ui";
import { Text } from "./Text.ui";

const TOP = "flex items-center justify-between gap-4";
const NAMING = "flex min-w-0 items-center gap-3";
const BOTTOM =
	"flex flex-wrap items-center justify-between gap-x-6 gap-y-2 @max-md:flex-col @max-md:items-stretch";
const GATES =
	"flex items-center gap-3 @max-md:flex-col-reverse @max-md:items-start @max-md:gap-1";
const COVERAGE = "flex items-center gap-3 @max-md:w-full";
const BALANCE = "flex shrink-0 flex-col items-end gap-1";

export type RunHeaderProps = {
	title: string;
	swatch?: SwatchTheme;
	balance: string;
	gauge?: {
		label: string;
		percent: number;
	};
	swatches: readonly TrackSwatch[];
	gateLabel: string;
	coverage: {
		label: string;
		reading: string;
		percent: number;
	};
};

export const RunHeader = ({
	title,
	swatch,
	balance,
	gauge,
	swatches,
	gateLabel,
	coverage,
}: RunHeaderProps) => (
	<header className="flex flex-col gap-2 border-b border-edge pb-3">
		<div className={TOP}>
			<span className={NAMING}>
				{swatch === undefined ? null : <Swatch theme={swatch} size="badge" />}
				<Text size="title" className="truncate font-bold">
					{title}
				</Text>
			</span>
			<span className={BALANCE}>
				<Text tone="muted" className="shrink-0">
					{balance}
				</Text>
				{gauge === undefined ? null : (
					<Meter percent={gauge.percent} label={gauge.label} className="w-20" />
				)}
			</span>
		</div>
		<div className={BOTTOM}>
			<span className={GATES}>
				<SwatchTrack swatches={swatches} />
				<Text tone="muted" size="caption">
					{gateLabel}
				</Text>
			</span>
			<span className={COVERAGE}>
				<Text tone="muted">{coverage.label}</Text>
				<Text className="font-bold whitespace-nowrap">{coverage.reading}</Text>
				<Meter
					percent={coverage.percent}
					label={coverage.label}
					className="w-28 @max-md:flex-1"
				/>
			</span>
		</div>
	</header>
);
