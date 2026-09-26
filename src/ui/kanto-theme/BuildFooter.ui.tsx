import { BUILD } from "~/shared/lib/copy";
import { useEffect, useState } from "react";

import { clsx } from "clsx";

import { Build, configCountOf, type BuildProps } from "./Build.ui";
import type { KantoColor } from "./colors";
import { Fold, type FoldBadge } from "./Fold.ui";

const FOOTER = "build-footer mt-auto w-full";
const PINNED = "sticky z-20";

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
	flash?: string;
	seat?: number;
};

export const BuildFooter = ({
	build,
	counts,
	open,
	flash,
	seat,
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
		<footer
			data-flash={lit ? "true" : undefined}
			style={seat === undefined ? undefined : { bottom: seat }}
			className={clsx(FOOTER, seat !== undefined && PINNED)}
		>
			<Fold
				title={BUILD}
				summary={configCountOf(total)}
				badges={badgesOf(counts)}
				open={open ?? defaultOpen}
			>
				<Build {...build} heading={false} />
			</Fold>
		</footer>
	);
};
