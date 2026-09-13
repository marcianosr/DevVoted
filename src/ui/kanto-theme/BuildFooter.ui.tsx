import { useState } from "react";

import { Build, configCountOf, type BuildProps } from "./Build.ui";
import type { KantoColor } from "./colors";
import { Fold, type FoldBadge } from "./Fold.ui";

const STICKY = "sticky bottom-0 z-20 -mx-4 mt-auto bg-theme-faint px-4 pb-4";

const TITLE = "Build";
const DESKTOP = "(min-width: 640px)";

export type BuildCounts = {
	applies: number;
	ready: number;
	offline: number;
	changing: number;
};

const READINGS = [
	{ key: "ready", word: "ready", color: "cerulean" },
	{ key: "applies", word: "applies", color: "viridian" },
	{ key: "offline", word: "offline", color: "cinnabar" },
	{ key: "changing", word: "changing", color: "vermillion" },
] as const satisfies readonly {
	key: keyof BuildCounts;
	word: string;
	color: KantoColor;
}[];

const badgesOf = (counts: BuildCounts): readonly FoldBadge[] =>
	READINGS.filter((reading) => counts[reading.key] > 0).map((reading) => ({
		label: `${counts[reading.key]} ${reading.word}`,
		color: reading.color,
	}));

const startsOpen = (): boolean =>
	typeof window === "undefined" ||
	typeof window.matchMedia !== "function" ||
	window.matchMedia(DESKTOP).matches;

export type BuildFooterProps = {
	build: BuildProps;
	counts: BuildCounts;
	open?: boolean;
};

export const BuildFooter = ({ build, counts, open }: BuildFooterProps) => {
	const [defaultOpen] = useState(startsOpen);
	const total = build.configs.length + (build.skipped?.length ?? 0);

	return (
		<footer className={STICKY}>
			<Fold
				title={TITLE}
				summary={configCountOf(total)}
				badges={badgesOf(counts)}
				open={open ?? defaultOpen}
			>
				<Build {...build} heading={false} />
			</Fold>
		</footer>
	);
};
