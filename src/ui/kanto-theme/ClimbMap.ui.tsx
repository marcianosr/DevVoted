import { useEffect, useRef } from "react";

import { clsx } from "clsx";

import type {
	LadderClimber,
	LadderGate,
} from "~/modules/run/community/application/climbLadder.viewmodel";

import { Climber } from "./Climber.ui";
import { CARD_PANEL, ClimberCard } from "./ClimberCard.ui";
import { Typography } from "./Typography.ui";

export const COPY = {
	best: "your best",
	you: "you",
	rival: "rival",
	fallen: "fallen",
	pb: "your pb",
	marks: "flicker = shaky · rim = perfect · tag = rescued",
} as const;

const STAR = "★";
const STACK_MAX = 4;

const SCROLLER = "no-scrollbar flex w-full gap-1.5 overflow-x-auto pb-2";
const COLUMN = "flex w-24 shrink-0 flex-col items-center gap-2";

const BLOCK = "relative flex w-full items-center justify-center";
const RAIL =
	"absolute top-1/2 left-1/2 -z-10 h-0 w-full border-t border-dashed border-theme-faint";

const RUNG =
	"flex size-11 items-center justify-center rounded-lg border-2 border-theme text-sm font-bold tabular-nums text-theme";
const RUNG_CURRENT = "bg-theme text-indigo";
const RUNG_UNCHARTED = "opacity-35";

const NAME = "text-center";
const PB = "flex h-4 items-center gap-1 text-xs font-bold text-saffron";
const STACK = "flex flex-wrap items-center justify-center gap-1";
const OVERFLOW = "text-xs text-theme-muted tabular-nums";
const FALLEN_LANE =
	"flex flex-wrap items-center justify-center gap-1 border-t border-theme-faint pt-1.5";

const CHIP_PRESS = "rounded-md focus:outline-none focus-visible:ring-2";

const ROOT = "relative flex w-full flex-col gap-2";

const LEGEND = "flex w-full flex-col gap-1 pt-1";
const LEGEND_ROW = "flex flex-wrap items-center gap-x-4 gap-y-1";
const LEGEND_ITEM = "flex items-center gap-1.5 text-xs text-theme-muted";
const DOT = "size-2 shrink-0 rounded-full";

export type ClimbMapProps = {
	gates: readonly LadderGate[];
	openId?: string;
	onInspect?: (id: string) => void;
};

type Opened = { climber: LadderClimber; gate: LadderGate };

const openedIn = (
	gates: readonly LadderGate[],
	openId: string | undefined
): Opened | undefined => {
	if (openId === undefined) return undefined;
	for (const gate of gates) {
		const climber = gate.climbers.find((entry) => entry.id === openId);
		if (climber !== undefined) return { climber, gate };
		const fallen = gate.fallen.find((entry) => entry.runKey === openId);
		if (fallen !== undefined) return { climber: fallen, gate };
	}
	return undefined;
};

const Chip = ({
	climber,
	pressKey,
	dimmed = false,
	open,
	onInspect,
}: {
	climber: LadderClimber;
	pressKey: string;
	dimmed?: boolean;
	open: boolean;
	onInspect?: (id: string) => void;
}) => {
	const face = (
		<Climber
			name={climber.name}
			photoUrl={climber.photoUrl}
			borderUrl={climber.borderUrl}
			you={climber.you}
			rival={climber.rival}
			perfect={climber.mark === "perfect"}
			shaky={climber.mark === "shaky"}
			rescued={climber.rescued}
			dimmed={dimmed}
			size="md"
		/>
	);

	if (onInspect === undefined) return face;

	return (
		<button
			type="button"
			aria-label={climber.name}
			aria-pressed={open}
			className={CHIP_PRESS}
			onClick={() => onInspect(pressKey)}
		>
			{face}
		</button>
	);
};

const LegendDot = ({
	className,
	word,
}: {
	className: string;
	word: string;
}) => (
	<span className={LEGEND_ITEM}>
		<span aria-hidden className={clsx(DOT, className)} />
		{word}
	</span>
);

const Legend = () => (
	<div className={LEGEND}>
		<div className={LEGEND_ROW}>
			<LegendDot className="bg-viridian" word={COPY.you} />
			<LegendDot className="bg-vermillion" word={COPY.rival} />
			<LegendDot className="bg-pewter" word={COPY.fallen} />
			<span className={clsx(LEGEND_ITEM, "text-saffron")}>
				<span aria-hidden>{STAR}</span>
				{COPY.pb}
			</span>
		</div>
		<Typography variant="hint" as="span">
			{COPY.marks}
		</Typography>
	</div>
);

export const ClimbMap = ({ gates, openId, onInspect }: ClimbMapProps) => {
	const scroller = useRef<HTMLUListElement>(null);
	const currentColumn = useRef<HTMLLIElement>(null);
	const currentGate = gates.find((gate) => gate.current)?.gate;
	const opened = openedIn(gates, openId);

	useEffect(() => {
		const track = scroller.current;
		const column = currentColumn.current;
		if (track === null || column === null) return;
		track.scrollLeft = Math.max(
			0,
			column.offsetLeft - (track.clientWidth - column.clientWidth) / 2
		);
	}, [currentGate]);

	return (
		<div className={ROOT}>
			<ul className={SCROLLER} ref={scroller}>
				{gates.map((gate) => {
					const shown = gate.climbers.slice(0, STACK_MAX);
					const overflow = gate.climbers.length - shown.length;

					return (
						<li
							key={gate.gate}
							ref={gate.current ? currentColumn : undefined}
							className={COLUMN}
							data-swatch-theme={gate.theme}
							data-current={gate.current ? "" : undefined}
							data-uncharted={gate.uncharted ? "" : undefined}
						>
							<span className={PB}>
								{gate.best ? (
									<>
										<span aria-hidden>{STAR}</span>
										<span title={COPY.best}>pb</span>
									</>
								) : null}
							</span>
							<span className={BLOCK}>
								<span aria-hidden className={RAIL} />
								<span
									className={clsx(
										RUNG,
										gate.current && RUNG_CURRENT,
										gate.uncharted && RUNG_UNCHARTED
									)}
								>
									{gate.gate}
								</span>
							</span>
							<Typography variant="hint" as="span">
								<span className={NAME}>{gate.name}</span>
							</Typography>
							{shown.length === 0 ? null : (
								<span className={STACK}>
									{shown.map((climber) => (
										<Chip
											key={climber.id}
											climber={climber}
											pressKey={climber.id}
											open={climber.id === openId}
											onInspect={onInspect}
										/>
									))}
									{overflow === 0 ? null : (
										<span className={OVERFLOW}>{`+${overflow}`}</span>
									)}
								</span>
							)}
							{gate.fallen.length === 0 ? null : (
								<span data-fallen="" className={FALLEN_LANE}>
									{gate.fallen.map((fallen) => (
										<Chip
											key={fallen.runKey}
											climber={fallen}
											pressKey={fallen.runKey}
											dimmed
											open={fallen.runKey === openId}
											onInspect={onInspect}
										/>
									))}
								</span>
							)}
						</li>
					);
				})}
			</ul>
			{opened?.climber.card === undefined ? null : (
				<div className={CARD_PANEL}>
					<ClimberCard
						{...opened.climber.card}
						{...(onInspect === undefined
							? {}
							: { onClose: () => onInspect(openId ?? "") })}
					/>
				</div>
			)}
			<Legend />
		</div>
	);
};
