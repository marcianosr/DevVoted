import type { Meta, StoryObj } from "@storybook/react";

import { GATE_AUDITS } from "~/modules/run/gate/domain/audit.model";
import { ALL_SWATCHES } from "~/modules/run/gate/domain/swatch.model";
import {
	coverageDemandFor,
	failStripsFor,
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

/** Only the columns the domain does not own. The audits are display labels for
 * now: GATE_AUDITS emits timeout-3/4/5 and strip-1/2 because the numbers differ
 * per gate, where audits.ts collapses each to the one entry a player sees. The
 * unlocks are wiki §2.8 plus PIN_FROM_GATE, which that table omits. */
const EXTRAS: Readonly<Record<number, Pick<DexGate, "audits" | "unlocks">>> = {
	0: { audits: [], unlocks: ["shop", "rebuild", "640 KB plan"] },
	1: { audits: [], unlocks: ["slot 4"] },
	2: { audits: [], unlocks: ["lock", "slot 5", "768 KB plan"] },
	3: { audits: ["Cost Overrun"], unlocks: ["extend", "slot 6"] },
	4: {
		audits: ["Dependency Outage"],
		unlocks: ["git tag", "slot 7", "1 MB plan"],
	},
	5: { audits: ["Read-only"], unlocks: ["slot 8"] },
	6: { audits: ["Feature Freeze"], unlocks: ["slot 9", "1.5 MB plan"] },
	7: { audits: ["Mirror"], unlocks: ["slot 10"] },
	8: { audits: ["Timeout", "Flaky Build"], unlocks: ["slot 11", "2 MB plan"] },
	9: { audits: ["Memory Leak", "Rolling Outage"], unlocks: ["slot 12"] },
	10: {
		audits: ["Breaking Change", "Timeout"],
		unlocks: ["slot 13", "3 MB plan"],
	},
	11: { audits: ["Strip", "Mirror", "Flaky Build"], unlocks: ["slot 14"] },
	12: { audits: ["Memory Leak", "Strip", "Timeout"], unlocks: [] },
};

/** A Strip audit adds to the gate's own quota rather than replacing it
 * (audit.model.ts), which is why the last two rows read higher than the table. */
const peelsFor = (gate: number) =>
	(GATE_AUDITS[gate] ?? []).reduce(
		(strips, audit) => strips + (audit.stripQuotaOnFail ?? 0),
		failStripsFor(gate)
	);

type GateFacts = Omit<DexGate, "state">;

const LADDER: readonly GateFacts[] = ALL_SWATCHES.map((swatch) => ({
	number: swatch.gate,
	name: swatch.gateName,
	theme: swatch.theme,
	finish: swatch.finish,
	coverage: coverageDemandFor(swatch.gate),
	peels: peelsFor(swatch.gate),
	peelsAudited: peelsFor(swatch.gate) > failStripsFor(swatch.gate),
	wins: swatch.gate === VICTORY_GATE,
	...EXTRAS[swatch.gate],
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
