import type { Meta, StoryObj } from "@storybook/react";

import { auditAt } from "~/modules/run/gate/domain/audit.model";
import { AUDIT_RANK } from "~/modules/run/gate/domain/auditSchedule.model";

import type { Audit as AuditRecord } from "~/modules/run/gate/domain/audit.model";

import { Audit } from "./Audit.ui";
import { Screen } from "./Screen.ui";
import { Typography } from "./Typography.ui";

const SAMPLE_GATE = 6;
const LOCKED_COUNT = 6;

const cueOf = (audit: AuditRecord) => audit.answerCue ?? audit.description;

const LEAK = auditAt("memory-leak", SAMPLE_GATE);
const OUTAGE = auditAt("dependency-outage", SAMPLE_GATE);

const meta: Meta<typeof Audit> = {
	component: Audit,
	title: "Kanto/Audit",
	args: { code: LEAK.code, name: LEAK.name, cue: cueOf(LEAK) },
	render: (args) => (
		<Screen theme="viridian" width="narrow">
			<Audit {...args} />
		</Screen>
	),
};
export default meta;

type Story = StoryObj<typeof Audit>;

export const Default: Story = {};

export const AsRows: Story = {
	parameters: { controls: { disable: true } },
	render: () => (
		<Screen theme="saffron" width="narrow">
			<div className="flex w-full flex-col">
				<div className="py-2">
					<Audit
						code={LEAK.code}
						name={LEAK.name}
						cue={cueOf(LEAK)}
						layout="row"
					/>
				</div>
				<div className="border-t border-theme-faint py-2">
					<Audit
						code={OUTAGE.code}
						name={OUTAGE.name}
						cue={cueOf(OUTAGE)}
						layout="row"
					/>
				</div>
			</div>
		</Screen>
	),
};

export const ReleasedPair: Story = {
	parameters: { controls: { disable: true } },
	render: () => (
		<Screen theme="viridian" width="narrow">
			<div className="flex flex-wrap items-start gap-3">
				<Audit
					code={LEAK.code}
					name={LEAK.name}
					cue="leaking 16 KB a poll · 32 KB on a miss"
				/>
				<Audit
					code={OUTAGE.code}
					name={OUTAGE.name}
					cue="Intellisense is out this attempt"
				/>
			</div>
		</Screen>
	),
};

export const WholeRoster: Story = {
	parameters: { controls: { disable: true } },
	render: () => (
		<Screen theme="cinnabar">
			<Typography variant="title">
				{`${AUDIT_RANK.length} audits, hardest first`}
			</Typography>
			<div className="flex flex-col items-start gap-2">
				{AUDIT_RANK.map((id) => {
					const audit = auditAt(id, SAMPLE_GATE);

					return (
						<Audit
							key={id}
							code={audit.code}
							name={audit.name}
							cue={cueOf(audit)}
						/>
					);
				})}
			</div>
		</Screen>
	),
};

export const SameOnEveryScreen: Story = {
	parameters: { controls: { disable: true } },
	render: () => (
		<div className="[--screen-floor:9rem]">
			{(["viridian", "cerulean", "cinnabar", "lavender"] as const).map(
				(theme) => (
					<Screen key={theme} theme={theme} width="narrow">
						<Audit code={LEAK.code} name={LEAK.name} cue={cueOf(LEAK)} />
					</Screen>
				)
			)}
		</div>
	),
};

export const Locked: Story = {
	parameters: { controls: { disable: true } },
	render: () => (
		<Screen theme="viridian" width="narrow">
			<Audit locked />
		</Screen>
	),
};

export const RosterPartlyMet: Story = {
	parameters: { controls: { disable: true } },
	render: () => (
		<Screen theme="cinnabar">
			<Typography variant="title">
				{`${AUDIT_RANK.length - LOCKED_COUNT} of ${AUDIT_RANK.length} audits met`}
			</Typography>
			<div className="flex flex-col items-start gap-2">
				{AUDIT_RANK.map((id, rank) => {
					if (rank < LOCKED_COUNT) return <Audit key={id} locked />;

					const audit = auditAt(id, SAMPLE_GATE);

					return (
						<Audit
							key={id}
							code={audit.code}
							name={audit.name}
							cue={cueOf(audit)}
						/>
					);
				})}
			</div>
		</Screen>
	),
};
