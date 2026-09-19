import { useEffect, useState } from "react";

import { Build, configCountOf, type BuildProps } from "./Build.ui";
import type { KantoColor } from "./colors";
import { Fold, type FoldBadge } from "./Fold.ui";

const STICKY =
	"build-footer sticky bottom-0 z-20 -mx-4 mt-auto bg-theme-faint px-4 pb-4";

const TITLE = "Build";
const DESKTOP = "(min-width: 640px)";

export const BUILD_FLASH_HOLD_MS = 1200;

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
	/** Changes to a new answer's identity to raise the flash; undefined is quiet. */
	flash?: string;
};

/**
 * The flash lives here, not on the chip, because the fold may be shut when an
 * answer lands: the sheet reads `data-flash` against the shut summary as well as
 * against the credited chips, and a `<details>` body the player closed is simply
 * not there to light up.
 */
export const BuildFooter = ({
	build,
	counts,
	open,
	flash,
}: BuildFooterProps) => {
	const [defaultOpen] = useState(startsOpen);
	const [credited, setCredited] = useState(flash);
	const [lit, setLit] = useState(false);

	if (credited !== flash) {
		setCredited(flash);
		setLit(flash !== undefined);
	}

	useEffect(() => {
		if (!lit) return;

		const hold = setTimeout(() => setLit(false), BUILD_FLASH_HOLD_MS);
		return () => clearTimeout(hold);
	}, [lit, credited]);

	const total = build.configs.length + (build.skipped?.length ?? 0);

	return (
		<footer data-flash={lit ? "true" : undefined} className={STICKY}>
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
