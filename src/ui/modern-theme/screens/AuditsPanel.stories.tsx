import type { Meta, StoryObj } from "@storybook/react";

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

/** The fifteen of GATE_AUDITS, in order of the gate each first appears at. Timeout
 * and Strip are one entry apiece even though the model emits several ids for them
 * (timeout-3/5, strip-10/15) — counting ids would say seventeen. */
const ROSTER: readonly AuditFacts[] = [
	{
		id: "cost-overrun",
		gates: [3],
		rule: "Every paid action costs double, linting and peeking both.",
	},
	{
		id: "dependency-outage",
		gates: [4],
		rule: "One config is offline for the whole attempt.",
	},
	{
		id: "read-only",
		gates: [5],
		rule: "The shop before this gate is shut. Nothing bought, sold, upgraded or switched.",
	},
	{
		id: "feature-freeze",
		gates: [6],
		rule: "No paid actions at all. The linter and the peek are gone.",
	},
	{
		id: "mirrored",
		gates: [7, 11],
		rule: "Every poll asks for the incorrect options, and wants all of them.",
	},
	{
		id: "timeout",
		gates: [8, 10, 12],
		rule: "The window's first polls run on a clock. A late answer scores as a miss.",
	},
	{
		id: "flaky-build",
		gates: [8, 11],
		rule: "One config drops out on every poll, a different one each time.",
	},
	{
		id: "memory-leak",
		gates: [9, 12],
		rule: "Storage leaks on every poll: 16 KB, and 32 KB on a miss.",
	},
	{
		id: "rolling-outage",
		gates: [9],
		rule: "The outage rolls through your build, a different config down each poll.",
	},
	{
		id: "breaking-change",
		gates: [10],
		rule: "Your most-upgraded config takes a breaking change and does nothing.",
	},
	{
		id: "strip",
		gates: [11, 12],
		rule: "Failing this gate peels extra configs. A build it can empty ends the run.",
	},
];

/** Two counts drive all fifteen rows, so no story can show a rule for an audit it
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

export const Complete: Story = { args: { audits: auditsSeen(11, 0) } };
