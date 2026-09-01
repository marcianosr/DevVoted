import { clsx } from "clsx";

import type {
	SwatchFinish,
	SwatchTheme,
} from "~/modules/run/gate/domain/swatch.model";

import { REDACTED } from "../Redacted.ui";
import { Swatch } from "../Swatch.ui";
import { Text } from "../Text.ui";

const GRID = "grid grid-cols-4 gap-3 py-2 @max-md:grid-cols-2";
const CARD = "flex flex-col gap-1 rounded-xl border p-3";
const OPEN = "border-edge";
const LOCKED = "border-dashed border-edge opacity-45";
const HEAD = "flex items-center gap-2";
const SCORE = "flex items-baseline gap-1.5";

const CLEARED_MARK = "✓";
/** No best score yet, which is not the same as a best score of zero. */
const NO_SCORE = "—";

type GateIdentity = {
	gate: number;
	/** The coverage the gate demands — a score, not a percentage, so it prints
	 * bare. Public from the start even where the gate is not: seeing the ladder
	 * run 3 → 340 is what makes the climb legible. */
	demand: number;
};

export type ReachedGate = GateIdentity & {
	locked?: false;
	name: string;
	theme: SwatchTheme;
	finish?: SwatchFinish;
	/** Your best coverage at this gate across every run. */
	best: number;
	cleared: boolean;
};

/** A gate you have never stood at keeps its name and its colour — the swatch is
 * the reward, so showing it here would be handing it over early. */
export type LockedGate = GateIdentity & {
	locked: true;
	name?: never;
	theme?: never;
	finish?: never;
	best?: never;
	cleared?: never;
};

export type DexGate = ReachedGate | LockedGate;

export type GatesPanelProps = { gates: readonly DexGate[] };

const isReached = (gate: DexGate): gate is ReachedGate => gate.locked !== true;

const GateCard = ({ gate }: { gate: DexGate }) => {
	const reached = isReached(gate);

	return (
		<article className={clsx(CARD, reached ? OPEN : LOCKED)}>
			<span className={HEAD}>
				<Swatch
					size="badge"
					theme={reached ? gate.theme : undefined}
					finish={reached ? gate.finish : undefined}
					state={reached ? "earned" : "locked"}
				/>
				<Text tone="muted" size="caption">
					gate {gate.gate}
				</Text>
			</span>
			<Text size="title" className="font-bold">
				{reached ? gate.name : REDACTED}
			</Text>
			<span className={SCORE}>
				{reached && gate.cleared ? (
					<Text tone="celadon" size="caption">
						{CLEARED_MARK}
					</Text>
				) : null}
				<Text tone={reached ? "default" : "faint"} size="caption">
					{reached ? gate.best : NO_SCORE}
				</Text>
				<Text tone="faint" size="caption">
					/ {gate.demand}
				</Text>
			</span>
		</article>
	);
};

export const GatesPanel = ({ gates }: GatesPanelProps) => (
	<div className={GRID}>
		{gates.map((gate) => (
			<GateCard key={gate.gate} gate={gate} />
		))}
	</div>
);
