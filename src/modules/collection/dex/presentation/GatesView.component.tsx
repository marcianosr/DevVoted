import type { AuditdexEntry } from "~/modules/collection/dex/domain/auditdex.model";
import { revealedAuditNames } from "~/modules/collection/dex/domain/auditdex.model";
import type {
	GatedexEntry,
	GateUnlock,
} from "~/modules/collection/dex/domain/gatedex.model";
import {
	GatesPanel,
	type DexGate,
} from "~/ui/modern-theme/screens/GatesPanel.ui";

const ACTION_LABEL = {
	extend: "extend",
	pin: "git tag",
} as const;

const unlockLabel = (unlock: GateUnlock): string => ACTION_LABEL[unlock.action];

type Split = { readonly shown: readonly string[]; readonly hidden: number };

const split = <T,>(
	items: readonly T[],
	isShown: (item: T) => boolean,
	label: (item: T) => string
): Split => {
	const shown = items.filter(isShown);
	return { shown: shown.map(label), hidden: items.length - shown.length };
};

const splitAudits = (
	entry: GatedexEntry,
	revealed: ReadonlySet<string>
): Split =>
	split(
		entry.audits,
		(name) => revealed.has(name),
		(name) => name
	);

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
		peels: Math.round(entry.peelShare * 100),
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
