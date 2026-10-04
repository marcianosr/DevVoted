import { NO_TITLE_YET } from "~/shared/lib/copy";

import { Badge } from "./Badge.ui";
import type { KantoColor } from "./colors";

export const COPY = {
	noTitle: NO_TITLE_YET,
} as const;

const ROW = "flex flex-wrap items-center gap-1.5";
const EMPTY =
	"rounded-md border border-dashed border-theme-faint px-2 py-0.5 text-xs text-theme-muted";

export type WornTitlesProps = {
	titles: readonly string[];
	rest?: KantoColor;
};

const PRIMARY = 0;

export const WornTitles = ({ titles, rest }: WornTitlesProps) => (
	<span className={ROW}>
		{titles.length === 0 ? (
			<span className={EMPTY}>{COPY.noTitle}</span>
		) : (
			titles.map((title, index) => (
				<Badge key={title} color={index === PRIMARY ? undefined : rest}>
					{title}
				</Badge>
			))
		)}
	</span>
);
