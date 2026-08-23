import { clsx } from "clsx";

import { Chip } from "../Chip.ui";
import { Dot } from "../Dot.ui";
import { Legend, type LegendItem } from "../Legend.ui";
import { Swatch, type SwatchFinish } from "../Swatch.ui";
import { Text } from "../Text.ui";
import { signed } from "../format";

const PANEL = "flex flex-col gap-3 py-2";
const LIST = "flex flex-col gap-0.5";

// A grid, not a Row: the mock lines coverage, peels and the chip run into columns
// down all thirteen rows, and Row lays its content out as a flex run that would
// ragged-edge instead.
const GATE_ROW =
	"grid grid-cols-[1rem_minmax(9rem,12rem)_3.5rem_2.5rem_1fr_4rem] items-center gap-3 py-1.5 pr-3 pl-2";

// Every state carries a left border so the cleared wash never shifts a row.
const STATE = {
	cleared: "border-l-2 border-celadon bg-celadon/5",
	next: "rounded-md border-l-2 border-transparent outline outline-edge-strong",
	locked: "border-l-2 border-transparent",
} satisfies Record<DexGateState, string>;

const FIGURE = "text-right tabular-nums";
const TAGS = "flex flex-wrap items-center gap-1.5";
const STATUS = "text-right";

export type DexGateState = "cleared" | "next" | "locked";

export type DexGate = {
	number: number;
	name: string;
	/** Always present, even when locked: in a catalogue a gate's colour is public
	 * knowledge, unlike SwatchTrack where it is a thing you earn. */
	theme: string;
	finish?: SwatchFinish;
	coverage: number;
	peels: number;
	/** A Strip audit inflated the peel count, which is why the last two figures
	 * read in cinnabar and the rest are muted. */
	peelsAudited?: boolean;
	audits: readonly string[];
	unlocks: readonly string[];
	/** The last gate opens nothing; clearing it ends the run. */
	wins?: boolean;
	state: DexGateState;
};

export type GatesPanelProps = { gates: readonly DexGate[] };

const SWATCH_STATE = {
	cleared: "earned",
	next: "pending",
	locked: "locked",
} as const satisfies Record<DexGateState, "earned" | "pending" | "locked">;

const STATUS_LABEL = {
	cleared: "cleared",
	next: "next",
	locked: "",
} as const satisfies Record<DexGateState, string>;

const KEYS: readonly LegendItem[] = [
	{ id: "coverage", label: "coverage needed" },
	{ id: "peels", label: "configs a miss peels" },
	{ id: "audit", marker: <Dot shape="box" tone="saffron" />, label: "audit" },
	{ id: "unlock", marker: <Dot shape="box" tone="muted" />, label: "unlock" },
];

const GateRow = ({ gate }: { gate: DexGate }) => (
	<li className={clsx(GATE_ROW, STATE[gate.state])}>
		<Swatch
			size="pip"
			state={SWATCH_STATE[gate.state]}
			finish={gate.finish}
			theme={gate.theme}
		/>
		<Text size="body">
			{gate.number} {gate.name}
		</Text>
		<Text size="meta" tone="muted" className={FIGURE}>
			{gate.coverage}%
		</Text>
		<Text
			size="meta"
			tone={gate.peelsAudited ? "cinnabar" : "muted"}
			className={FIGURE}
		>
			{signed(-gate.peels)}
		</Text>
		<span className={TAGS}>
			{gate.audits.map((audit) => (
				<Chip key={audit} tone="saffron">
					{audit}
				</Chip>
			))}
			{gate.unlocks.map((unlock) => (
				<Chip key={unlock} tone="muted">
					{unlock}
				</Chip>
			))}
			{gate.wins ? <Chip tone="celadon">wins the run</Chip> : null}
		</span>
		<Text
			size="meta"
			tone={gate.state === "cleared" ? "celadon" : "theme"}
			className={STATUS}
		>
			{STATUS_LABEL[gate.state]}
		</Text>
	</li>
);

export const GatesPanel = ({ gates }: GatesPanelProps) => (
	<section className={PANEL}>
		<Text as="p" size="meta" tone="muted">
			Every gate opens something. Clear it once and the swatch is yours for
			good.
		</Text>
		<ul className={LIST}>
			{gates.map((gate) => (
				<GateRow key={gate.number} gate={gate} />
			))}
		</ul>
		<Legend items={KEYS} />
	</section>
);
