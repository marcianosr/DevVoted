import { clsx } from "clsx";

const TRACK = "flex flex-wrap items-center gap-1.5";
// Every rung carries a border so the dashed one does not stand a pixel taller
// than the filled ones.
const RUNG = "rounded border px-1.5 text-xs tabular-nums";

const HELD = "border-transparent bg-zinc-800 text-zinc-400";
const BEST = "border-transparent bg-pallet font-bold text-zinc-950";
const UNDEALT = "border-dashed border-zinc-700 text-zinc-600";

export type VersionTrackProps = {
	/** The highest version ever dealt to you. Versions climb one rung at a time,
	 * so this one figure splits the whole ladder: below it you have held, above
	 * it you have never seen. Zero means the config is still unseen. */
	best: number;
	maxVersion: number;
};

const rungOf = (version: number, best: number) => {
	if (version === best) return BEST;
	return version < best ? HELD : UNDEALT;
};

export const VersionTrack = ({ best, maxVersion }: VersionTrackProps) => (
	<span className={TRACK}>
		{Array.from({ length: maxVersion }, (_, index) => {
			const version = index + 1;
			return (
				<span key={version} className={clsx(RUNG, rungOf(version, best))}>
					v{version}
				</span>
			);
		})}
	</span>
);
