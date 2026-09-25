import { BUILD } from "~/shared/lib/copy";
import { type Ref, useEffect, useState } from "react";

import { clsx } from "clsx";

import { Build, configCountOf, type BuildProps } from "./Build.ui";
import type { KantoColor } from "./colors";
import { Fold, type FoldBadge } from "./Fold.ui";

/**
 * `mt-auto` drops the sheet to the screen's floor, so a short poll does not
 * strand it mid-page. It draws no ground of its own: `Fold` wears the panel
 * surface, which is opaque and self-contained, so the footer's box is exactly
 * the bar you can see — and that is the box the screen above measures.
 */
const FOOTER = "build-footer mt-auto w-full";
/**
 * Pinned only once the screen has measured it. The send above it is seated off
 * this bar's height, and that number does not exist until an effect has run —
 * so until it does the sheet stays in the flow and the send holds the floor
 * alone. Pinning first would put an unmeasured bar over the press.
 *
 * `z-20` is above the send's `z-10` on purpose: sticky makes this a stacking
 * context, so the config popups inside the fold ride at this level too, and
 * they must be able to open over the send row rather than under it.
 */
const PINNED = "sticky bottom-0 z-20";

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
	/** Rides the viewport floor. Off until the screen above has measured it. */
	pinned?: boolean;
	/**
	 * Addresses the sheet's own element. The poll screen measures it to seat its
	 * send row clear of this bar, which is a height only the DOM knows: the fold
	 * opens without telling React.
	 */
	ref?: Ref<HTMLElement>;
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
	pinned = false,
	ref,
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
			ref={ref}
			data-flash={lit ? "true" : undefined}
			className={clsx(FOOTER, pinned && PINNED)}
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
