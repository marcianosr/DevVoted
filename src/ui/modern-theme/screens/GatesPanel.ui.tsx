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
	/** Audits on this gate the player has not reached, as a count rather than as
	 * names. Same redaction AuditsPanel uses and for the same reason: a hidden
	 * audit has no name to hand over, so no caller can leak one into the markup
	 * and trust the panel to cover it. The row still says how many rules the
	 * gate carries, which its coverage and peel figures already imply. */
	auditsHidden?: number;
	unlocks: readonly string[];
	/** Same, for the width and storage grants. Counted, so a locked gate that
	 * opens nothing still reads differently from one that opens something you
	 * have not earned the right to see. */
	unlocksHidden?: number;
	/** The last gate opens nothing; clearing it ends the run. */
	wins?: boolean;
	state: DexGateState;
};

export type GatesPanelProps = { gates: readonly DexGate[] };

/** Same three characters the Audits tab and the Polls table redact with. */
const REDACTED = "???";

const redactions = (family: string, count = 0): readonly string[] =>
	Array.from({ length: count }, (_, index) => `${family}-${index}`);

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
			{/* A redaction keeps its family's colour, so the legend below reads a
			    hidden audit and a hidden unlock apart without naming either. */}
			{redactions("audit", gate.auditsHidden).map((key) => (
				<Chip key={key} tone="saffron">
					{REDACTED}
				</Chip>
			))}
			{gate.unlocks.map((unlock) => (
				<Chip key={unlock} tone="muted">
					{unlock}
				</Chip>
			))}
			{redactions("unlock", gate.unlocksHidden).map((key) => (
				<Chip key={key} tone="muted">
					{REDACTED}
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
