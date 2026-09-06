import type { Meta, StoryObj } from "@storybook/react";

import { auditAt } from "~/modules/run/gate/domain/audit.model";
import {
	AUDIT_RANK,
	appearsAtGates,
} from "~/modules/run/gate/domain/auditSchedule.model";

import { AuditsPanel, type DexAudit } from "./AuditsPanel.ui";

const meta: Meta<typeof AuditsPanel> = {
	component: AuditsPanel,
	title: "Modern/Screens/AuditsPanel",
	// Storybook reads every named export as a story; auditsSeen is a helper
	// other story files import, not something to render.
	excludeStories: ["auditsSeen"],
	parameters: { layout: "padded" },
};
export default meta;

type Story = StoryObj<typeof AuditsPanel>;

type AuditFacts = Omit<
	Extract<DexAudit, { tier: "faced" | "unlocked" }>,
	"tier"
>;

/**
 * Derived from the real roster rather than retyped: a hand-kept copy drifts, and
 * this one had gone stale at eleven of sixteen. `AUDIT_RANK` is the roster,
 * `appearsAtGates` the gates, and each audit states its own rule.
 */
const ROSTER: readonly AuditFacts[] = AUDIT_RANK.map((id) => {
	const audit = auditAt(id, appearsAtGates(id)[0] ?? 0);
	return {
		id,
		gates: appearsAtGates(id),
		rule: audit.dexRule ?? audit.description,
	};
})
	.filter((audit) => audit.gates.length > 0)
	.sort((a, b) => (a.gates[0] ?? 0) - (b.gates[0] ?? 0));

/** Two counts drive every row, so no story can show a rule for an audit it
 * also calls unseen. */
export const auditsSeen = (
	faced: number,
	unlocked: number
): readonly DexAudit[] =>
	ROSTER.map((audit, index): DexAudit => {
		if (index < faced) return { ...audit, tier: "faced" };
		if (index < faced + unlocked) return { ...audit, tier: "unlocked" };
		return { id: audit.id, tier: "unseen" };
	});

export const Fresh: Story = { args: { audits: auditsSeen(0, 1) } };

export const Midway: Story = { args: { audits: auditsSeen(2, 4) } };

export const Complete: Story = {
	args: { audits: auditsSeen(ROSTER.length, 0) },
};
