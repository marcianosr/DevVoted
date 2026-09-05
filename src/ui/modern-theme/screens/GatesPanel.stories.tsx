import type { Meta, StoryObj } from "@storybook/react";

import {
	auditExtraPeelShare,
	auditAt,
	auditLabelOf,
} from "~/modules/run/gate/domain/audit.model";
import {
	bandForGate,
	certainAuditsFor,
} from "~/modules/run/gate/domain/auditSchedule.model";
import { ALL_SWATCHES } from "~/modules/run/gate/domain/swatch.model";
import {
	coverageDemandFor,
	failPeelShareFor,
	VICTORY_GATE,
} from "~/modules/run/run/domain/rules.model";

import { GatesPanel, type DexGate, type DexGateState } from "./GatesPanel.ui";

const meta: Meta<typeof GatesPanel> = {
	component: GatesPanel,
	title: "Modern/Screens/GatesPanel",
	// Storybook reads every named export as a story; gatesClearedTo is a helper
	// other story files import, not something to render.
	excludeStories: ["gatesClearedTo"],
	parameters: { layout: "padded" },
};
export default meta;

type Story = StoryObj<typeof GatesPanel>;

/** Only the columns the domain does not own. Audits and peels now read straight
 * off the roster (ADR-056), so the one hand-written thing left is the unlock
 * column: wiki §2.8 plus PIN_FROM_GATE, which that table omits. */
const UNLOCKS: Readonly<Record<number, readonly string[]>> = {
	0: ["shop", "rebuild", "640 KB plan"],
	1: ["slot 4"],
	2: ["lock", "slot 5", "768 KB plan"],
	3: ["extend", "slot 6"],
	4: ["git tag", "slot 7", "1 MB plan"],
	5: ["slot 8"],
	6: ["slot 9", "1.5 MB plan"],
	7: ["slot 10"],
	8: ["slot 11", "2 MB plan"],
	9: ["slot 12"],
	10: ["slot 13", "3 MB plan"],
	11: ["slot 14"],
	12: [],
};

const certainAudits = (gate: number) =>
	certainAuditsFor(gate).map((id) => auditAt(id, gate));

/** A Strip audit adds to the gate's own share rather than replacing it
 * (audit.model.ts), which is why the last two rows read higher than the table. */
const peelShareOf = (gate: number) =>
	failPeelShareFor(gate) + auditExtraPeelShare(certainAudits(gate));

type GateFacts = Omit<DexGate, "state">;

const LADDER: readonly GateFacts[] = ALL_SWATCHES.map((swatch) => ({
	number: swatch.gate,
	name: swatch.gateName,
	theme: swatch.theme,
	finish: swatch.finish,
	coverage: coverageDemandFor(swatch.gate),
	peels: Math.round(peelShareOf(swatch.gate) * 100),
	peelsAudited: auditExtraPeelShare(certainAudits(swatch.gate)) > 0,
	audits: certainAuditsFor(swatch.gate).map((id) =>
		auditLabelOf(id, swatch.gate)
	),
	auditDraw: bandForGate(swatch.gate)?.perGate ?? 0,
	auditPoolSize: bandForGate(swatch.gate)?.pool.length ?? 0,
	unlocks: UNLOCKS[swatch.gate] ?? [],
	wins: swatch.gate === VICTORY_GATE,
}));

export const gatesClearedTo = (cleared: number): readonly DexGate[] =>
	LADDER.map((gate) => {
		const state: DexGateState = (() => {
			if (gate.number < cleared) return "cleared";
			return gate.number === cleared ? "next" : "locked";
		})();

		return { ...gate, state };
	});

export const Fresh: Story = { args: { gates: gatesClearedTo(0) } };

export const Midway: Story = { args: { gates: gatesClearedTo(1) } };

export const Summit: Story = { args: { gates: gatesClearedTo(12) } };

export const Cleared: Story = { args: { gates: gatesClearedTo(13) } };
