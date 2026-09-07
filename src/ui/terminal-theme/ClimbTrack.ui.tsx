import { useEffect, useRef } from "react";

import { clsx } from "clsx";

import type {
	SwatchFinish,
	SwatchTheme,
} from "~/modules/run/gate/domain/swatch.model";

import { AvatarChip } from "./AvatarChip.ui";
import { Badge } from "./Badge.ui";
import { Swatch } from "./Swatch.ui";
import { Text } from "./Text.ui";

const STACK_MAX = 4;

const SCROLLER = "flex gap-1.5 overflow-x-auto pb-2";
const COLUMN = "flex min-w-20 flex-1 flex-col items-center gap-2";
const UNCHARTED_EDGE = "border-l border-dashed border-zinc-600 pl-1.5";
const BLOCK = "relative w-full";
const NUMBER =
	"absolute inset-0 flex items-center justify-center text-sm font-bold";
const STACK = "flex flex-wrap items-center justify-center gap-1";
const FALLEN_LANE =
	"flex flex-wrap items-center justify-center gap-1 border-t border-edge pt-1.5";
const BEST =
	"flex size-6 items-center justify-center rounded-sm border border-dashed border-zinc-500 text-[10px] text-zinc-500";

export type TrackClimber = {
	id: string;
	name: string;
	photoUrl?: string;
	borderUrl?: string;
	you: boolean;
};

export type TrackGate = {
	gate: number;
	name: string;
	theme?: SwatchTheme;
	finish?: SwatchFinish;
	current: boolean;
	uncharted: boolean;
	best: boolean;
	climbers: readonly TrackClimber[];
	fallen: readonly (TrackClimber & { runKey: string })[];
};

export type ClimbTrackProps = {
	gates: readonly TrackGate[];
	className?: string;
};

const Stack = ({ climbers }: { climbers: readonly TrackClimber[] }) => {
	const shown = climbers.slice(0, STACK_MAX);
	const overflow = climbers.length - shown.length;
	return (
		<span className={STACK}>
			{shown.map((climber) => (
				<AvatarChip
					key={climber.id}
					size="sm"
					name={climber.you ? "you" : climber.name}
					photoUrl={climber.photoUrl}
					borderUrl={climber.borderUrl}
					you={climber.you}
				/>
			))}
			{overflow > 0 ? <Badge tone="muted">+{overflow}</Badge> : null}
		</span>
	);
};

export const ClimbTrack = ({ gates, className }: ClimbTrackProps) => {
	const scroller = useRef<HTMLUListElement>(null);
	const currentColumn = useRef<HTMLLIElement>(null);
	const currentGate = gates.find((gate) => gate.current)?.gate;

	useEffect(() => {
		const track = scroller.current;
		const column = currentColumn.current;
		if (track === null || column === null) return;
		track.scrollLeft = Math.max(
			0,
			column.offsetLeft - (track.clientWidth - column.clientWidth) / 2
		);
	}, [currentGate]);

	const firstUncharted = gates.find((gate) => gate.uncharted)?.gate;

	return (
		<ul className={clsx(SCROLLER, className)} ref={scroller}>
			{gates.map((gate) => (
				<li
					key={gate.gate}
					ref={gate.current ? currentColumn : undefined}
					className={clsx(
						COLUMN,
						gate.gate === firstUncharted && UNCHARTED_EDGE
					)}
				>
					<span className={BLOCK} title={gate.name}>
						<Swatch
							size="card"
							theme={gate.theme}
							finish={gate.finish}
							state={
								gate.uncharted ? "pending" : gate.current ? "current" : "earned"
							}
							className="w-full"
						/>
						<span
							aria-hidden
							className={clsx(
								NUMBER,
								gate.uncharted ? "text-zinc-500" : "text-zinc-950"
							)}
						>
							{gate.gate}
						</span>
					</span>
					{gate.gate === firstUncharted ? (
						<Text size="caption" tone="faint">
							uncharted
						</Text>
					) : null}
					{gate.climbers.length > 0 ? <Stack climbers={gate.climbers} /> : null}
					{gate.best ? (
						<span title="your best" className={BEST}>
							pb
						</span>
					) : null}
					{gate.fallen.length > 0 ? (
						<span className={FALLEN_LANE}>
							{gate.fallen.map((fallen) => (
								<AvatarChip
									key={fallen.runKey}
									size="sm"
									name={fallen.name}
									photoUrl={fallen.photoUrl}
									borderUrl={fallen.borderUrl}
									dimmed
								/>
							))}
						</span>
					) : null}
				</li>
			))}
		</ul>
	);
};
