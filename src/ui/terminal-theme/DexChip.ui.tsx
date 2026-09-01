import { clsx } from "clsx";

import type { ConfigFamily } from "~/modules/run/config/domain/config.model";

import { FamilyDot } from "./FamilyDot.ui";
import { VersionFigure } from "./VersionFigure.ui";

const CHIP =
	"inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-sm whitespace-nowrap";
const SEEN = "border-zinc-700 text-zinc-200";
const SELECTED = "border-zinc-300 bg-zinc-100/5 text-zinc-100";
const UNSEEN = "border-dashed border-zinc-800 text-zinc-600";
const PRESSABLE = "transition-[filter] hover:brightness-150";

export const REDACTED = "???";

/** An unseen config hands over its family and nothing else. The union is the
 * guard: a caller with no name to pass cannot pass one and trust the chip to
 * cover it. */
export type DexChipProps = {
	selected?: boolean;
	onSelect?: () => void;
	className?: string;
} & (
	| {
			seen?: true;
			family: ConfigFamily;
			label: string;
			version: number;
			maxVersion: number;
	  }
	| {
			seen: false;
			family: ConfigFamily;
			label?: never;
			version?: never;
			maxVersion?: never;
	  }
);

const stateOf = (seen: boolean, selected: boolean) => {
	if (!seen) return UNSEEN;
	return selected ? SELECTED : SEEN;
};

export const DexChip = ({
	family,
	label,
	version,
	maxVersion,
	seen = true,
	selected = false,
	onSelect,
	className,
}: DexChipProps) => {
	const body = (
		<>
			<FamilyDot family={family} dim={!seen} />
			<span>{label ?? REDACTED}</span>
			{version === undefined || maxVersion === undefined ? null : (
				<VersionFigure version={version} maxVersion={maxVersion} />
			)}
		</>
	);
	const style = clsx(CHIP, stateOf(seen, selected), className);

	if (onSelect === undefined) return <span className={style}>{body}</span>;

	return (
		<button
			type="button"
			aria-pressed={selected}
			onClick={onSelect}
			className={clsx(style, PRESSABLE)}
		>
			{body}
		</button>
	);
};
