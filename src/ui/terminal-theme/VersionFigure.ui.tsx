import { clsx } from "clsx";

const FIGURE = "shrink-0 tabular-nums text-zinc-400";
const CEILING = "text-zinc-600";

/** The version you hold against the version that exists, as plain text. The
 * boxed rung in Version.ui says where a config sits mid-run; this says how much
 * of it you have collected, which is a catalogue's question. */
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
