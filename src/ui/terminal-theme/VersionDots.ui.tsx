import { clsx } from "clsx";

const TRACK = "flex shrink-0 items-center gap-0.5";
const PIP = "size-1.25 rounded-full";
const HELD = "bg-zinc-300";
const UNDEALT = "border border-zinc-600";

export type VersionDotsProps = {
	version: number;
	maxVersion: number;
	className?: string;
};

export const VersionDots = ({
	version,
	maxVersion,
	className,
}: VersionDotsProps) => (
	<span
		role="img"
		aria-label={`version ${version} of ${maxVersion}`}
		className={clsx(TRACK, className)}
	>
		{Array.from({ length: maxVersion }, (_, index) => (
			<span
				key={index}
				className={clsx(PIP, index < version ? HELD : UNDEALT)}
			/>
		))}
	</span>
);
