import { useEffect, useId, useRef } from "react";

import { clsx } from "clsx";

import { kbLabel } from "~/shared/lib/storage";

import { Redacted } from "./Redacted.ui";
import { Text } from "./Text.ui";
import { Tooltip } from "./Tooltip.ui";

const BILL_HINT = "Rent this plan charges on every gate clear.";
const BAR_HINT =
	"Solid is what you hold, faint is headroom to the cap, dashed is what the next rung would add.";

const HEADER = "flex items-center gap-3";
const RULE = "min-w-4 flex-1 border-t border-edge";
const TRACK =
	"no-scrollbar relative flex snap-x snap-mandatory gap-2 overflow-x-auto pb-1";
const CARD =
	"flex w-44 shrink-0 snap-center flex-col gap-2 rounded-lg border border-edge p-3";
const CARD_HELD = "border-theme-soft bg-theme-soft";
const BAR = "flex h-3 w-full";
const HELD = "bg-theme";
const HEADROOM = "bg-theme-strong";
const TICK = "w-0.5 shrink-0 bg-zinc-200";
const NEXT_ZONE = "flex-1 border border-dashed border-edge-strong";
const ACTION =
	"shrink-0 rounded-lg border px-2 py-0.5 text-xs whitespace-nowrap transition-colors disabled:cursor-not-allowed disabled:opacity-40";

type ActionTone = "zinc" | "theme" | "saffron";

const ACTION_TONE = {
	zinc: "border-edge-strong text-zinc-200 enabled:hover:bg-zinc-100/5",
	theme: "border-theme-soft text-theme enabled:hover:bg-theme-soft",
	saffron: "border-saffron/50 text-saffron enabled:hover:bg-saffron/10",
} satisfies Record<ActionTone, string>;

export type StorageRung = {
	capKb: number;
	rentKb: number;
};

export type StoragePlanCard = {
	capKb: number;
	rentKb: number;
	held: boolean;
	revealed: boolean;
	/** What opens a hidden rung, as a caption rather than a tooltip: a mask that
	 * only whispers its requirement on hover says nothing at all on touch. */
	requirement?: string;
	burnsKb: number;
	refusal?: string;
	onSelect?: () => void;
};

export type StoragePlanMeter = {
	heldKb: number;
	capKb: number;
	nextCapKb?: number;
};

export type StoragePlanProps = {
	cards: readonly StoragePlanCard[];
	meter: StoragePlanMeter;
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

const Action = ({
	label,
	ariaLabel,
	tone = "zinc",
	describedBy,
	onUse,
	className,
}: {
	label: string;
	ariaLabel?: string;
	tone?: ActionTone;
	describedBy?: string;
	onUse?: () => void;
	className?: string;
}) => (
	<button
		type="button"
		disabled={onUse === undefined}
		aria-label={ariaLabel}
		aria-describedby={describedBy}
		onClick={onUse}
		className={clsx(ACTION, ACTION_TONE[tone], className)}
	>
		{label}
	</button>
);

const RentBullet = ({ rentKb }: { rentKb: number }) => (
	<span className="flex items-baseline gap-1.5">
		<Text size="caption" tone="faint">
			·
		</Text>
		{rentKb === 0 ? (
			<Text size="caption" tone="theme">
				free
			</Text>
		) : (
			<Text size="caption" tone="muted">
				costs{" "}
				<Text size="caption" tone="saffron">
					{kbLabel(rentKb)}
				</Text>{" "}
				a gate
			</Text>
		)}
	</span>
);

const RungCard = ({
	capKb,
	rentKb,
	held,
	burnsKb,
	refusal,
	onSelect,
}: StoragePlanCard) => {
	const detailId = useId();
	const detail =
		refusal ?? (burnsKb > 0 ? `burns ${kbLabel(burnsKb)}` : undefined);

	return (
		<>
			<span className="flex items-baseline justify-between gap-2">
				<Text size="score" className="font-bold">
					{kbLabel(capKb)}
				</Text>
				{held ? (
					<Text size="caption" tone="theme">
						current
					</Text>
				) : null}
			</span>
			<RentBullet rentKb={rentKb} />
			<Action
				label={held ? "selected" : "select"}
				ariaLabel={`${held ? "selected" : "select"} ${kbLabel(capKb)}`}
				tone={burnsKb > 0 ? "saffron" : "theme"}
				describedBy={detail === undefined ? undefined : detailId}
				onUse={onSelect}
				className="mt-auto"
			/>
			{detail === undefined ? null : (
				<p id={detailId}>
					<Text size="caption" tone="saffron">
						{detail}
					</Text>
				</p>
			)}
		</>
	);
};

const MaskedCard = ({ requirement }: { requirement?: string }) => (
	<>
		<Redacted label="????" className="self-start" />
		<span className="flex items-baseline gap-1.5">
			<Text size="caption" tone="faint">
				·
			</Text>
			<Text size="caption" tone="faint">
				{requirement ?? "????"}
			</Text>
		</span>
	</>
);

const meterLabel = ({ heldKb, capKb, nextCapKb }: StoragePlanMeter) =>
	[
		`${kbLabel(heldKb)} held`,
		`${kbLabel(Math.max(0, capKb - heldKb))} free`,
		`${kbLabel(capKb)} cap`,
		nextCapKb === undefined
			? "at the ceiling"
			: `+${kbLabel(nextCapKb - capKb)} on ${kbLabel(nextCapKb)}`,
	].join(" · ");

const CapMeter = ({ heldKb, capKb, nextCapKb }: StoragePlanMeter) => {
	const totalKb = nextCapKb ?? capKb;
	const width = (kb: number) => ({ width: `${(kb / totalKb) * 100}%` });
	const heldOnBar = Math.min(heldKb, capKb);

	return (
		<Tooltip hint={BAR_HINT} className="w-full">
			<span
				role="img"
				aria-label={meterLabel({ heldKb, capKb, nextCapKb })}
				className={BAR}
			>
				<span className={HELD} style={width(heldOnBar)} />
				<span
					className={clsx(HEADROOM, nextCapKb === undefined && "flex-1")}
					style={nextCapKb === undefined ? undefined : width(capKb - heldOnBar)}
				/>
				<span className={TICK} />
				{nextCapKb === undefined ? null : <span className={NEXT_ZONE} />}
			</span>
		</Tooltip>
	);
};

export const StoragePlan = ({ cards, meter, className }: StoragePlanProps) => {
	const scroller = useRef<HTMLUListElement>(null);
	const heldCard = useRef<HTMLLIElement>(null);
	const heldCapKb = cards.find((card) => card.held)?.capKb;

	useEffect(() => {
		const track = scroller.current;
		const card = heldCard.current;
		if (track === null || card === null) return;
		track.scrollLeft = Math.max(
			0,
			card.offsetLeft - (track.clientWidth - card.clientWidth) / 2
		);
	}, [heldCapKb]);

	return (
		<div className={clsx("flex flex-col gap-2", className)}>
			<header className={HEADER}>
				<Text className="shrink-0 font-bold">Storage plan</Text>
				<span aria-hidden className={RULE} />
				<Tooltip hint={BILL_HINT}>
					<Text size="caption" tone="muted" className="shrink-0">
						billed at the gate check
					</Text>
				</Tooltip>
			</header>
			<Text as="p" size="caption" tone="muted">
				Rents the ceiling on the KB a run can hold. A clear that pays past it
				burns the rest.
			</Text>
			<ul aria-label="storage plan rungs" ref={scroller} className={TRACK}>
				{cards.map((card) => (
					<li
						key={card.capKb}
						ref={card.held ? heldCard : undefined}
						className={clsx(CARD, card.held && CARD_HELD)}
					>
						{card.revealed ? (
							<RungCard {...card} />
						) : (
							<MaskedCard requirement={card.requirement} />
						)}
					</li>
				))}
			</ul>
			<CapMeter {...meter} />
			<Text as="p" size="caption" tone="muted">
				{meterLabel(meter)}
			</Text>
		</div>
	);
};
