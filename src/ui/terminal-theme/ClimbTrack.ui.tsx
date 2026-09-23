import { useEffect, useRef, useState } from "react";

import { clsx } from "clsx";

import type {
	SwatchFinish,
	SwatchTheme,
} from "~/modules/run/gate/domain/swatch.model";

import { AvatarChip } from "./AvatarChip.ui";
import { Badge } from "./Badge.ui";
import { Swatch } from "./Swatch.ui";
import { Text } from "./Text.ui";
import { Tooltip } from "./Tooltip.ui";

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
const CHIP_PRESS =
	"inline-flex cursor-pointer rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-300";
const BUILD = "flex flex-wrap items-center gap-1";

const YOU_NAME = "you";
const NOTHING_INSTALLED = "nothing installed";
const WEIGHT_WORD = "weight";
const SEPARATOR = " · ";

export type TrackConfig = {
	name: string;
	slots: number;
	version?: number;
	locked?: boolean;
};

export type TrackClimber = {
	id: string;
	name: string;
	photoUrl?: string;
	borderUrl?: string;
	you: boolean;
	/** Their build as anyone may read it (ADR-101); a chip with none stays a plain chip. */
	build?: readonly TrackConfig[];
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

const configWord = ({ name, version }: TrackConfig): string =>
	version === undefined ? name : `${name} v${version}`;

const weightOf = (build: readonly TrackConfig[]): number =>
	build.reduce((total, config) => total + config.slots, 0);

const weightWord = (build: readonly TrackConfig[]): string =>
	`${weightOf(build)} ${WEIGHT_WORD}`;

export const buildWords = (
	name: string,
	build: readonly TrackConfig[]
): string =>
	build.length === 0
		? [name, NOTHING_INSTALLED].join(SEPARATOR)
		: [name, build.map(configWord).join(", "), weightWord(build)].join(
				SEPARATOR
			);

const BuildHint = ({ build }: { build: readonly TrackConfig[] }) => {
	if (build.length === 0) return <>{NOTHING_INSTALLED}</>;

	return (
		<span className={BUILD}>
			{build.map((config) => (
				<Badge
					key={config.name}
					tone={config.locked === true ? "saffron" : "neutral"}
				>
					{configWord(config)}
				</Badge>
			))}
			<Badge tone="muted">{weightWord(build)}</Badge>
		</span>
	);
};

type Reveal = {
	open: string | null;
	onToggle: (key: string) => void;
};

const Chip = ({
	climber,
	revealKey,
	dimmed = false,
	reveal,
}: {
	climber: TrackClimber;
	revealKey: string;
	dimmed?: boolean;
	reveal: Reveal;
}) => {
	const name = climber.you ? YOU_NAME : climber.name;
	const chip = (
		<AvatarChip
			size="sm"
			name={name}
			photoUrl={climber.photoUrl}
			borderUrl={climber.borderUrl}
			you={climber.you}
			dimmed={dimmed}
		/>
	);
	if (climber.build === undefined) return chip;

	const open = reveal.open === revealKey;
	return (
		<Tooltip hint={<BuildHint build={climber.build} />} open={open}>
			<button
				type="button"
				className={CHIP_PRESS}
				aria-expanded={open}
				aria-label={buildWords(name, climber.build)}
				onClick={() => reveal.onToggle(revealKey)}
			>
				{chip}
			</button>
		</Tooltip>
	);
};

const Stack = ({
	climbers,
	reveal,
}: {
	climbers: readonly TrackClimber[];
	reveal: Reveal;
}) => {
	const shown = climbers.slice(0, STACK_MAX);
	const overflow = climbers.length - shown.length;
	return (
		<span className={STACK}>
			{shown.map((climber) => (
				<Chip
					key={climber.id}
					climber={climber}
					revealKey={climber.id}
					reveal={reveal}
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
	const [open, setOpen] = useState<string | null>(null);
	const reveal: Reveal = {
		open,
		onToggle: (key) => setOpen((current) => (current === key ? null : key)),
	};

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
					{gate.climbers.length > 0 ? (
						<Stack climbers={gate.climbers} reveal={reveal} />
					) : null}
					{gate.best ? (
						<span title="your best" className={BEST}>
							pb
						</span>
					) : null}
					{gate.fallen.length > 0 ? (
						<span className={FALLEN_LANE}>
							{gate.fallen.map((fallen) => (
								<Chip
									key={fallen.runKey}
									climber={fallen}
									revealKey={fallen.runKey}
									dimmed
									reveal={reveal}
								/>
							))}
						</span>
					) : null}
				</li>
			))}
		</ul>
	);
};
