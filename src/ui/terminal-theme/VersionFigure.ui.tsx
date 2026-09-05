import { clsx } from "clsx";

const FIGURE = "shrink-0 tabular-nums text-zinc-400";
const CEILING = "text-zinc-600";

/** The version you hold against the version that exists, as plain text. This
 * says how much of a config you have collected, which is a catalogue's
 * question; the boxed rung in Version.ui says which version is installed, and
 * that is the one every run screen draws — a mid-run chip has no ceiling worth
 * comparing against. */
export type VersionFigureProps = {
	version: number;
	maxVersion: number;
	className?: string;
};

export const VersionFigure = ({
	version,
	maxVersion,
	className,
}: VersionFigureProps) => (
	<span className={clsx(FIGURE, className)}>
		v{version}
		<span className={CEILING}>/{maxVersion}</span>
	</span>
);
