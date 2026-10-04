import type { ReactNode } from "react";

import { Badge } from "./Badge.ui";
import type { KantoColor } from "./colors";
import { Typography } from "./Typography.ui";

const NEUTRAL: KantoColor = "pewter";

const FRAME = "w-full overflow-hidden rounded-xl border border-theme-faint";
const TILES =
	"-mt-px -ml-px grid grid-cols-[repeat(auto-fit,minmax(8rem,1fr))]";
const TILE =
	"flex min-w-0 flex-col items-start gap-1 border-t border-l border-theme-faint px-3 py-2";
const WIDE = "col-span-full";

export type StatTile = { label: string; value: string; color?: KantoColor };

export type StatTilesProps = {
	stats: readonly StatTile[];
	children?: ReactNode;
};

export const StatTiles = ({ stats, children }: StatTilesProps) => (
	<div className={FRAME}>
		<div className={TILES}>
			{stats.map((stat) => (
				<div key={stat.label} className={TILE}>
					<Typography variant="hint" as="span">
						{stat.label}
					</Typography>
					<Badge color={stat.color ?? NEUTRAL}>{stat.value}</Badge>
				</div>
			))}
			{children === undefined ? null : (
				<div className={`${TILE} ${WIDE}`}>{children}</div>
			)}
		</div>
	</div>
);
