import { useEffect, useRef, useState, useCallback } from "react";

import { clsx } from "clsx";

import {
	DIFFICULTY_BG,
	DIFFICULTY_LABEL,
} from "~/domains/runs/utils/difficultyStyles";

export type GatePathmapSlotDifficulty = "low" | "medium" | "high" | "critical";

export type GatePathmapPlayer = {
	id: string;
	displayName: string;
	currentGate: number;
	pollsInWindow: number;
	windowSize: number;
	slots: GatePathmapSlotDifficulty[];
	isViewer?: boolean;
	/** Pre-built avatar node from the composition layer (AvatarPopover + Avatar). */
	avatarNode: React.ReactNode;
};

export type GatePathmapProps = {
	players: GatePathmapPlayer[];
};

const GATE_W = 140; // px per gate segment
const TRACK_OFFSET_X = 60; // px from left edge to gate 1 center
const UNCHARTED_EXTRA = GATE_W * 1.5; // px of uncharted zone past leaderGate
const TRACK_Y = 96; // px from container top to track line (room for 3 stacked avatars)
const CONTAINER_H = 150; // px total container height
const MAX_STACK = 3; // max avatars shown stacked before overflow badge
const SCROLL_BY = GATE_W * 2; // px scrolled per button press

const gateXPx = (gate: number) => TRACK_OFFSET_X + gate * GATE_W;

const playerXPx = (p: GatePathmapPlayer) =>
	TRACK_OFFSET_X +
	(p.currentGate + (p.windowSize > 0 ? p.pollsInWindow / p.windowSize : 0)) *
		GATE_W;

const hardPlusCount = (slots: GatePathmapSlotDifficulty[]) =>
	slots.filter((s) => s === "high" || s === "critical").length;

const DIFFICULTIES: GatePathmapSlotDifficulty[] = [
	"low",
	"medium",
	"high",
	"critical",
];

type GateMarkerProps = { gate: number };

const GateMarker = ({ gate }: GateMarkerProps) => (
	<div
		className="absolute flex flex-col items-center -translate-x-1/2"
		style={{ left: gateXPx(gate), top: TRACK_Y - 4 }}
	>
		<div className="w-px h-3 bg-zinc-500" />
		<span className="mt-1 text-sm text-zinc-300 whitespace-nowrap">
			Gate {gate}
		</span>
	</div>
);

type PlayerPinProps = {
	players: GatePathmapPlayer[];
	xPx: number;
};

const PlayerPin = ({ players, xPx }: PlayerPinProps) => {
	const visible = players.slice(0, MAX_STACK);
	const overflow = players.length - visible.length;
	const primary = players.find((p) => p.isViewer) ?? players[0];

	return (
		<div
			className="absolute -translate-x-1/2"
			style={{ left: xPx, top: 0, height: CONTAINER_H }}
		>
			{/* Stacked avatars — i=0 is bottom (closest to track) */}
			{visible.map((player, i) => {
				// Each avatar is 32px tall; -4px overlap between adjacent ones
				const avatarTop = TRACK_Y - 8 - 32 * (i + 1) + i * 4;
				const isTopmost = i === visible.length - 1;
				return (
					<div
						key={player.id}
						className="absolute -translate-x-1/2"
						style={{ top: avatarTop, left: 0 }}
					>
						{player.avatarNode}
						{isTopmost && overflow > 0 && (
							<span
								className={clsx(
									"absolute -top-1 -right-1",
									"inline-flex items-center justify-center",
									"h-4 w-4 rounded-full bg-zinc-700 text-[9px] text-white",
									"ring-1 ring-zinc-900"
								)}
							>
								+{overflow}
							</span>
						)}
					</div>
				);
			})}

			{/* Difficulty blocks for the primary player */}
			<div
				className="absolute -translate-x-1/2 flex flex-col items-center gap-0.5"
				style={{ top: TRACK_Y + 8, left: 0 }}
			>
				<div className="flex gap-0.5">
					{primary.slots.map((d, i) => (
						<div
							key={i}
							className={clsx("w-3 h-3 rounded-sm", DIFFICULTY_BG[d])}
							title={DIFFICULTY_LABEL[d]}
						/>
					))}
				</div>
				<span className="text-[9px] text-zinc-300 whitespace-nowrap">
					{hardPlusCount(primary.slots)}/{primary.slots.length} hard+
				</span>
			</div>
		</div>
	);
};

type ScrollButtonProps = {
	direction: "left" | "right";
	visible: boolean;
	onClick: () => void;
};

const ScrollButton = ({ direction, visible, onClick }: ScrollButtonProps) => (
	<div
		className={clsx(
			"absolute top-0 bottom-0 z-10 flex items-center",
			"transition-opacity duration-200",
			direction === "left" ? "left-0" : "right-0",
			visible
				? "opacity-100 pointer-events-auto"
				: "opacity-0 pointer-events-none"
		)}
	>
		{/* Gradient fade behind the button */}
		<div
			className={clsx(
				"absolute inset-0 w-16",
				direction === "left"
					? "bg-gradient-to-r from-zinc-950 to-transparent"
					: "bg-gradient-to-l from-zinc-950 to-transparent"
			)}
		/>
		<button
			type="button"
			onClick={onClick}
			className={clsx(
				"relative z-10 flex flex-col items-center gap-0.5",
				"text-[10px] text-zinc-400 hover:text-zinc-200 transition-colors",
				direction === "left" ? "pl-2" : "pr-2 ml-auto"
			)}
			aria-label={direction === "left" ? "Scroll back" : "Scroll ahead"}
		>
			<span className="text-base leading-none">
				{direction === "left" ? "←" : "→"}
			</span>
			<span className="leading-none">
				{direction === "left" ? "back" : "ahead"}
			</span>
		</button>
	</div>
);

// ─── Main component ────────────────────────────────────────────────────────────

export const GatePathmap = ({ players }: GatePathmapProps) => {
	const scrollRef = useRef<HTMLDivElement>(null);
	const [canScrollLeft, setCanScrollLeft] = useState(false);
	const [canScrollRight, setCanScrollRight] = useState(false);

	const leaderGate = players.length
		? Math.max(...players.map((p) => p.currentGate))
		: 1;
	const viewer = players.find((p) => p.isViewer);

	const totalWidth =
		TRACK_OFFSET_X + leaderGate * GATE_W + UNCHARTED_EXTRA + GATE_W;

	useEffect(() => {
		const el = scrollRef.current;
		if (!el) return;
		const centerX = viewer ? playerXPx(viewer) : gateXPx(leaderGate);
		el.scrollLeft = centerX - el.clientWidth / 2;
		setCanScrollLeft(el.scrollLeft > 10);
		setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
		// Intentionally runs once — scroll position is set to viewer on mount only
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
		const el = e.currentTarget;
		setCanScrollLeft(el.scrollLeft > 10);
		setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
	}, []);

	const scrollLeft = useCallback(() => {
		scrollRef.current?.scrollBy({ left: -SCROLL_BY, behavior: "smooth" });
	}, []);

	const scrollRight = useCallback(() => {
		scrollRef.current?.scrollBy({ left: SCROLL_BY, behavior: "smooth" });
	}, []);

	// Group by exact position: same gate + same poll = stacked avatars
	const grouped = players.reduce<Map<string, GatePathmapPlayer[]>>(
		(acc, player) => {
			const key = `${player.currentGate}_${player.pollsInWindow}`;
			const existing = acc.get(key) ?? [];
			acc.set(key, [...existing, player]);
			return acc;
		},
		new Map()
	);

	if (players.length === 0) return null;

	return (
		<div className="space-y-3">
			{/* Legend */}
			<div className="flex items-center gap-3 text-xs text-zinc-400">
				{DIFFICULTIES.map((d) => (
					<span key={d} className="flex items-center gap-1">
						<span
							className={clsx(
								"inline-block w-3 h-3 rounded-sm",
								DIFFICULTY_BG[d]
							)}
						/>
						{DIFFICULTY_LABEL[d]}
					</span>
				))}
			</div>

			{/* Scrollable track */}
			<div className="relative">
				<ScrollButton
					direction="left"
					visible={canScrollLeft}
					onClick={scrollLeft}
				/>

				<div
					ref={scrollRef}
					className="overflow-x-auto"
					style={{ scrollbarWidth: "none" }}
					onScroll={handleScroll}
				>
					<div
						className="relative"
						style={{ width: totalWidth, height: CONTAINER_H }}
					>
						{/* Track line */}
						<div
							className="absolute h-px bg-zinc-600"
							style={{ left: TRACK_OFFSET_X, right: 0, top: TRACK_Y }}
						/>

						{/* Uncharted dashed zone */}
						<div
							className="absolute top-0 bottom-0 border-l border-dashed border-theme"
							style={{
								left: gateXPx(leaderGate),
								width: UNCHARTED_EXTRA + GATE_W,
								background:
									"linear-gradient(to right, oklch(from var(--theme-color) l c h / 0.06), oklch(from var(--theme-color) l c h / 0.18))",
							}}
						>
							<span className="absolute top-1 left-2 text-[9px] text-theme italic tracking-wide uppercase opacity-60">
								Uncharted
							</span>
						</div>

						{/* Gate markers */}
						{Array.from({ length: leaderGate }, (_, i) => i + 1).map((gate) => (
							<GateMarker key={gate} gate={gate} />
						))}

						{/* Player pins */}
						{Array.from(grouped.entries()).map(([key, group]) => (
							<PlayerPin key={key} players={group} xPx={playerXPx(group[0])} />
						))}
					</div>
				</div>

				<ScrollButton
					direction="right"
					visible={canScrollRight}
					onClick={scrollRight}
				/>
			</div>
		</div>
	);
};
