import type { SwatchTheme } from "~/modules/run/gate/domain/swatch.model";

import { Meter } from "./Meter.ui";
import { Swatch, type SwatchState } from "./Swatch.ui";
import { Text } from "./Text.ui";

const HEADER = "flex flex-col gap-2 border-b border-edge pb-3";
const TOP = "flex flex-wrap items-start justify-between gap-4";
const NAMING = "flex min-w-0 items-start gap-3";
const TITLES = "flex min-w-0 flex-col gap-0.5";
const FIGURE = "flex shrink-0 flex-col items-end gap-0.5 text-right";
const COVERAGE =
	"flex min-w-0 flex-1 items-center gap-3 self-center @max-md:w-full";

export type HeaderProps = {
	title: string;
	subtitle?: string;
	swatch?: SwatchTheme;
	swatchState?: SwatchState;
	value?: string;
	caption?: string;
	gauge?: {
		label: string;
		percent: number;
	};
	coverage?: {
		label: string;
		reading: string;
		percent: number;
	};
};

export const Header = ({
	title,
	subtitle,
	swatch,
	swatchState = "earned",
	value,
	caption,
	gauge,
	coverage,
}: HeaderProps) => (
	<header className={HEADER}>
		<div className={TOP}>
			<div className={NAMING}>
				{swatch === undefined && swatchState === "earned" ? null : (
					<Swatch
						theme={swatch}
						state={swatchState}
						size="badge"
						className="mt-1"
					/>
				)}
				<div className={TITLES}>
					<Text size="title" className="font-bold">
						{title}
					</Text>
					{subtitle === undefined ? null : <Text tone="muted">{subtitle}</Text>}
				</div>
			</div>
			{coverage === undefined ? null : (
				<span className={COVERAGE}>
					<Text tone="muted">{coverage.label}</Text>
					<Text className="font-bold whitespace-nowrap">
						{coverage.reading}
					</Text>
					<Meter
						percent={coverage.percent}
						label={coverage.label}
						className="flex-1"
					/>
				</span>
			)}
			{value === undefined ? null : (
				<div className={FIGURE}>
					<Text size="title" className="font-bold">
						{value}
					</Text>
					{caption === undefined ? null : <Text tone="muted">{caption}</Text>}
					{gauge === undefined ? null : (
						<Meter
							percent={gauge.percent}
							label={gauge.label}
							className="w-24"
						/>
					)}
				</div>
			)}
		</div>
	</header>
);
