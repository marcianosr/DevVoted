import { Audit } from "./Audit.ui";
import { DexPanel } from "./DexPanel.ui";
import { Panel } from "./Panel.ui";
import type { Redactable } from "./Redaction.ui";

const GATES = "text-xs whitespace-nowrap text-theme-muted";

export const gatesLabelOf = (gates: readonly number[]): string => {
	if (gates.length === 0) return "—";
	if (gates.length === 1) return `gate ${gates[0]}`;
	return `gates ${gates[0]}–${gates[gates.length - 1]}`;
};

export type DexAuditRow = { id: string; gates: string } & Redactable<{
	code: number;
	name: string;
	rule: string;
}>;

export type DexAuditsProps = {
	rows: readonly DexAuditRow[];
	count: string;
	meta: string;
	note: string;
};

export const DexAudits = ({ rows, count, meta, note }: DexAuditsProps) => (
	<DexPanel label="audits" count={count} meta={meta} note={note}>
		<Panel.Rows>
			{rows.map((row) => (
				<Panel.Row
					key={row.id}
					trailing={<span className={GATES}>{row.gates}</span>}
				>
					{row.locked ? (
						<Audit locked layout="row" />
					) : (
						<Audit
							code={row.code}
							name={row.name}
							cue={row.rule}
							layout="row"
						/>
					)}
				</Panel.Row>
			))}
		</Panel.Rows>
	</DexPanel>
);
