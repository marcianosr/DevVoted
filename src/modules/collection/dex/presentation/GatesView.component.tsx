import type { AuditdexEntry } from "~/modules/collection/dex/domain/auditdex.model";
import { revealedAuditNames } from "~/modules/collection/dex/domain/auditdex.model";
import type {
	GatedexEntry,
	GateUnlock,
} from "~/modules/collection/dex/domain/gatedex.model";
import { capLabel } from "~/ui/modern-theme/format";
import {
	GatesPanel,
	type DexGate,
} from "~/ui/modern-theme/screens/GatesPanel.ui";

/** The shop sells a pin as a "git tag", and the Dex is a catalogue of what the
 * shop sells — so it has to use the shop's word for it. */
const ACTION_LABEL = {
	lock: "lock",
	extend: "extend",
	pin: "git tag",
} as const;

const unlockLabel = (unlock: GateUnlock): string => {
	if (unlock.kind === "slot") return `slot ${unlock.slot}`;
	return unlock.kind === "plan"
		? `${capLabel(unlock.capKb)} plan`
		: ACTION_LABEL[unlock.action];
};

type Split = { readonly shown: readonly string[]; readonly hidden: number };

const split = <T,>(
	items: readonly T[],
	isShown: (item: T) => boolean,
	label: (item: T) => string
): Split => {
	const shown = items.filter(isShown);
	return { shown: shown.map(label), hidden: items.length - shown.length };
};

/**
 * A gate you have not reached does not name its rules. The test is the audit's
 * own tier, not this gate's state, so a name the Audits tab already shows stays
 * readable here — the two tabs are one catalogue and may not contradict.
 */
const splitAudits = (
	entry: GatedexEntry,
	revealed: ReadonlySet<string>
): Split =>
	split(
		entry.audits,
		(name) => revealed.has(name),
		(name) => name
	);

/**
 * Width and storage are the ladder's rewards, so a locked gate withholds them
 * the way it withholds its rules. The shop actions stay named: lock, extend and
 * the git tag are things the shop already advertises to a player standing in it.
 */
const splitUnlocks = (entry: GatedexEntry): Split =>
	split(
		entry.unlocks,
		(unlock) => entry.state !== "locked" || unlock.kind === "action",
		unlockLabel
	);

const toDexGate = (
	entry: GatedexEntry,
	revealed: ReadonlySet<string>
): DexGate => {
	const audits = splitAudits(entry, revealed);
	const unlocks = splitUnlocks(entry);

	return {
		number: entry.gate,
		name: entry.swatch.gateName,
		theme: entry.swatch.theme,
		finish: entry.swatch.finish,
		coverage: entry.coverageDemand,
		peels: entry.peels,
		peelsAudited: entry.peelsAudited,
		audits: audits.shown,
		auditsHidden: audits.hidden,
		unlocks: unlocks.shown,
		unlocksHidden: unlocks.hidden,
		wins: entry.winsTheRun,
		state: entry.state,
	};
};

export type GatesViewProps = {
	gates: readonly GatedexEntry[];
	audits: readonly AuditdexEntry[];
};

export const GatesView = ({ gates, audits }: GatesViewProps) => {
	const revealed = revealedAuditNames(audits);

	return <GatesPanel gates={gates.map((gate) => toDexGate(gate, revealed))} />;
};
