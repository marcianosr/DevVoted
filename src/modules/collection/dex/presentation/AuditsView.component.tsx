import type { AuditdexEntry } from "~/modules/collection/dex/domain/auditdex.model";
import { toAuditId } from "~/ui/modern-theme/audits";
import {
	AuditsPanel,
	type DexAudit,
} from "~/ui/modern-theme/screens/AuditsPanel.ui";

/**
 * An id the kit has no icon for is redacted rather than dropped: a roster that
 * silently loses a row would disagree with its own tab counter, and a missing
 * audit reads as a bug the player cannot see.
 */
const toDexAudit = (entry: AuditdexEntry): DexAudit => {
	const id = toAuditId(entry.id);
	if (id === null || entry.tier === "unseen")
		return { id: entry.id, tier: "unseen" };

	return { id, tier: entry.tier, gates: entry.gates, rule: entry.rule };
};

export type AuditsViewProps = { audits: readonly AuditdexEntry[] };

export const AuditsView = ({ audits }: AuditsViewProps) => (
	<AuditsPanel audits={audits.map(toDexAudit)} />
);
