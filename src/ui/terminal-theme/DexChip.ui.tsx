import { clsx } from "clsx";

import { prismaticStep } from "~/ui/sizes";

import { VersionDots } from "./VersionDots.ui";
import { Weight } from "./Weight.ui";

const CHIP =
	"inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs whitespace-nowrap";
const SEEN = "border-zinc-700 text-zinc-200";
const SELECTED = "border-zinc-300 bg-zinc-100/5 text-zinc-100";
const UNSEEN = "border-dashed border-zinc-800 text-zinc-600";
const RING =
	"border-transparent legendary-ring legendary-ring-flow text-zinc-100";

// Additive, so each rung keeps everything the one below it wears: 8 takes the
// drifting ring, 12 adds the wash, 16 runs both at half the period. Intensity
// rather than colour, since the bars are prismatic from 8 up and no longer say
// lavender/fuchsia/cinnabar apart.
const PRISMATIC = [
	"",
	RING,
	`${RING} legendary-shimmer`,
	`${RING} legendary-shimmer legendary-quick`,
] as const;
const PRESSABLE = "transition-[filter] hover:brightness-150";
const DIM = "opacity-40";

export const REDACTED = "???";

export type DexChipProps = {
	selected?: boolean;
	onSelect?: () => void;
	className?: string;
} & (
	| {
			seen?: true;
			slots: number;
			label: string;
			version: number;
			maxVersion: number;
	  }
	| {
			seen: false;
			slots: number;
			label?: never;
			version?: never;
			maxVersion?: never;
	  }
);

const stateOf = (slots: number, seen: boolean, selected: boolean) => {
	if (!seen) return UNSEEN;
	const step = prismaticStep(slots);
	if (step > 0) return PRISMATIC[step];
	return selected ? SELECTED : SEEN;
};

export const DexChip = ({
	slots,
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
			<Weight slots={slots} className={clsx(!seen && DIM)} />
			<span>{label ?? REDACTED}</span>
			{version === undefined || maxVersion === undefined ? null : (
				<VersionDots version={version} maxVersion={maxVersion} />
			)}
		</>
	);
	const style = clsx(CHIP, stateOf(slots, seen, selected), className);

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
