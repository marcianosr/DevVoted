import { useId } from "react";

import { clsx } from "clsx";

import { STORAGE_UNITS, formatStorage } from "~/shared/lib/storage";

import { plural } from "./format";
import { Text } from "./Text.ui";

const HEADER = "flex items-center gap-3";
const RULE = "min-w-4 flex-1 border-t border-edge";
const BAR = "flex h-3 w-full";
const HELD = "bg-viridian";
const DOOMED = "bg-saffron/70";
const HEADROOM = "bg-viridian/25";
const TICK = "w-0.5 shrink-0 bg-zinc-200";
const NEXT_ZONE = "flex-1 border border-dashed border-edge-strong";
const ROW = "flex min-h-7 flex-wrap items-center gap-3";
const ACTION =
	"shrink-0 rounded-lg border px-2 py-0.5 text-xs whitespace-nowrap transition-colors disabled:cursor-not-allowed disabled:opacity-40";

type ActionTone = "zinc" | "viridian" | "saffron";

const ACTION_TONE = {
	zinc: "border-edge-strong text-zinc-200 enabled:hover:bg-zinc-100/5",
	viridian: "border-viridian/40 text-celadon enabled:hover:bg-viridian/10",
	saffron: "border-saffron/50 text-saffron enabled:hover:bg-saffron/10",
} satisfies Record<ActionTone, string>;

export const kbLabel = (kb: number) => formatStorage(kb * STORAGE_UNITS.KB);

export type StorageRung = {
	capKb: number;
	rentKb: number;
};

export type StoragePlanDrop = {
	toKb: number;
	victim?: string;
	onDrop?: () => void;
};

export type StoragePlanProps = {
	heldKb: number;
	current: StorageRung;
	next?: StorageRung;
	drop?: StoragePlanDrop;
	moreRungs?: number;
	topCapKb?: number;
	onUpgrade?: () => void;
	className?: string;
};

export const RentText = ({ rentKb }: { rentKb: number }) =>
	rentKb === 0 ? (
		<Text tone="viridian">free</Text>
	) : (
		<Text tone="muted">
			<Text tone="saffron">{kbLabel(rentKb)}</Text> a gate
		</Text>
	);

const HeaderMeta = ({
	heldKb,
	current,
}: {
	heldKb: number;
	current: StorageRung;
}) => (
	<Text tone="muted" className="shrink-0">
		{kbLabel(heldKb)} held · {kbLabel(current.capKb)} cap ·{" "}
		{current.rentKb === 0 ? (
			"free"
		) : (
			<>
				bills <Text tone="saffron">{kbLabel(current.rentKb)}</Text> a gate
			</>
		)}
	</Text>
);

const Action = ({
	label,
	tone = "zinc",
	describedBy,
	onUse,
}: {
	label: string;
	tone?: ActionTone;
	describedBy?: string;
	onUse?: () => void;
}) => (
	<button
		type="button"
		disabled={onUse === undefined}
		aria-describedby={describedBy}
		onClick={onUse}
		className={clsx(ACTION, ACTION_TONE[tone])}
	>
		{label}
	</button>
);

type MeterZones = {
	heldKb: number;
	capKb: number;
	nextCapKb?: number;
	doomedFromKb?: number;
};

const meterLabel = ({ heldKb, capKb, nextCapKb }: MeterZones) =>
	[
		`${kbLabel(heldKb)} held`,
		`${kbLabel(Math.max(0, capKb - heldKb))} headroom to the ${kbLabel(capKb)} cap`,
		nextCapKb === undefined
			? "at the ceiling"
			: `next rung adds ${kbLabel(nextCapKb - capKb)}`,
	].join(" · ");

const CapMeter = ({ heldKb, capKb, nextCapKb, doomedFromKb }: MeterZones) => {
	const totalKb = nextCapKb ?? capKb;
	const width = (kb: number) => ({ width: `${(kb / totalKb) * 100}%` });
	const heldOnBar = Math.min(heldKb, capKb);
	const keptKb =
		doomedFromKb === undefined ? heldOnBar : Math.min(heldOnBar, doomedFromKb);
	const doomedKb = heldOnBar - keptKb;

	return (
		<div
			role="img"
			aria-label={meterLabel({ heldKb, capKb, nextCapKb })}
			className={BAR}
		>
			<span className={HELD} style={width(keptKb)} />
			{doomedKb > 0 ? (
				<span className={DOOMED} style={width(doomedKb)} />
			) : null}
			<span
				className={clsx(HEADROOM, nextCapKb === undefined && "flex-1")}
				style={nextCapKb === undefined ? undefined : width(capKb - heldOnBar)}
			/>
			<span className={TICK} />
			{nextCapKb === undefined ? null : <span className={NEXT_ZONE} />}
		</div>
	);
};

export const StoragePlan = ({
	heldKb,
	current,
	next,
	drop,
	moreRungs = 0,
	topCapKb,
	onUpgrade,
	className,
}: StoragePlanProps) => {
	const burnId = useId();
	const burnKb = drop === undefined ? 0 : Math.max(0, heldKb - drop.toKb);
	const ladderLine =
		next !== undefined && moreRungs > 0 && topCapKb !== undefined
			? `… ${plural(moreRungs, "more rung")} to ${kbLabel(topCapKb)}`
			: undefined;

	return (
		<div className={clsx("flex flex-col gap-2", className)}>
			<header className={HEADER}>
				<Text className="shrink-0 font-bold">Storage plan</Text>
				<span aria-hidden className={RULE} />
				<HeaderMeta heldKb={heldKb} current={current} />
			</header>

			<CapMeter
				heldKb={heldKb}
				capKb={current.capKb}
				nextCapKb={next?.capKb}
				doomedFromKb={burnKb > 0 ? drop?.toKb : undefined}
			/>

			{/* "upgrade" and "drop to N" keep their verbs — these are the plan's
			    options, not actions on a config, and ↑/↓ already mean upgrade and
			    minify. Don't "fix" them into nouns. */}
			<div className={ROW}>
				{next === undefined ? (
					<Text size="caption" tone="faint">
						at the ceiling
					</Text>
				) : (
					<>
						<Text tone="faint">next</Text>
						<Text className="font-bold">{kbLabel(next.capKb)}</Text>
						<RentText rentKb={next.rentKb} />
					</>
				)}
				<span className="flex-1" />
				{ladderLine === undefined ? null : (
					<Text size="caption" tone="faint">
						{ladderLine}
					</Text>
				)}
				{drop === undefined ? null : (
					<Action
						label={`drop to ${kbLabel(drop.toKb)}`}
						tone={burnKb > 0 ? "saffron" : "zinc"}
						describedBy={burnKb > 0 ? burnId : undefined}
						onUse={drop.onDrop}
					/>
				)}
				{next === undefined ? null : (
					<Action label="upgrade" tone="viridian" onUse={onUpgrade} />
				)}
			</div>
			{burnKb > 0 ? (
				<p id={burnId} aria-live="polite">
					<Text size="caption" tone="saffron">
						burns {kbLabel(burnKb)}
						{drop?.victim === undefined ? "" : ` · ${drop.victim} will not fit`}
					</Text>
				</p>
			) : null}
		</div>
	);
};
