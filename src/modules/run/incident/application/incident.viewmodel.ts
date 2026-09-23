import { vendorChipFor } from "~/modules/run/build/application/vendorChip.viewmodel";
import type {
	PublicBuild,
	PublicConfig,
} from "~/modules/run/build/domain/publicBuild.model";
import type { AuditId } from "~/modules/run/gate/domain/audit.model";
import { auditAt } from "~/modules/run/gate/domain/audit.model";
import { gateSwatchAt } from "~/modules/run/gate/application/swatchTrack.viewmodel";
import type { AttackOffer } from "~/modules/run/incident/domain/incident.model";
import type {
	IncidentFeedRow,
	IncidentStatus,
} from "~/modules/run/incident/infrastructure/incident.repository";
import type { Attack, AttackBand } from "~/modules/run/run/domain/run.model";
import type {
	AttackPanelProps,
	AttackRival,
} from "~/ui/kanto-theme/AttackPanel.ui";
import type { ConfigChipProps } from "~/ui/kanto-theme/ConfigChip.ui";
import type {
	IncidentRowProps,
	IncidentsScreenProps,
} from "~/ui/kanto-theme/IncidentsScreen.ui";

export type PayloadView = {
	readonly auditId: AuditId;
	readonly code: number;
	readonly name: string;
};

export type AttackOfferView = {
	readonly targetRunId: number;
	readonly name: string;
	readonly gate: number;
	readonly gateName: string;
	readonly build: PublicBuild;
	readonly payloads: readonly PayloadView[];
};

export type IncidentFeedRowView = {
	readonly id: number;
	readonly sentBy: string;
	readonly target: string;
	readonly code: number;
	readonly name: string;
	readonly gate: number;
	readonly gateName: string;
	readonly status: IncidentStatus;
	/** The viewer fired it or is its target, so the feed can ring it. */
	readonly own: boolean;
};

const payloadViewFor = (auditId: AuditId, gate: number): PayloadView => {
	const audit = auditAt(auditId, gate);
	return { auditId, code: audit.code, name: audit.name };
};

export const attackOfferViewFor = (offer: AttackOffer): AttackOfferView => ({
	targetRunId: offer.targetRunId,
	name: offer.name,
	gate: offer.targetGate,
	gateName: gateSwatchAt(offer.targetGate).gateName,
	build: offer.build,
	payloads: offer.payloads.map((auditId) =>
		payloadViewFor(auditId, offer.targetGate)
	),
});

export const incidentFeedRowFor = (
	row: IncidentFeedRow,
	viewerId: string
): IncidentFeedRowView => {
	const audit = auditAt(row.auditId, row.targetGate);
	return {
		id: row.id,
		sentBy: row.sentBy.name,
		target: row.target.name,
		code: audit.code,
		name: audit.name,
		gate: row.targetGate,
		gateName: gateSwatchAt(row.targetGate).gateName,
		status: row.status,
		own: row.sentBy.id === viewerId || row.target.id === viewerId,
	};
};

export const ATTACK_TITLE = "Your attack";
export const ATTACK_UNARMED =
	"no attack armed — clear a gate HEALTHY or better to earn one";
export const ATTACK_NO_RIVAL =
	"no rival in range — one must be at your gate or ahead, and have closed HEALTHY or better";
export const ATTACK_DEALING = "dealing your rivals…";
const FIRE_WORD = "Fire";
const AT_WORD = "at";
const GATE_WORD = "gate";

const attackMetaOf = (band: AttackBand): string =>
	band === "perfect" ? "choose 1 of 2 payloads" : "1 payload";

const gateLabelOf = (gate: number, gateName: string): string =>
	`${GATE_WORD} ${gate} · ${gateName}`;

/**
 * A rival's config as a chip with nothing to press: the row's only action is the
 * fire, and an About per chip would bury it. The vendor badge is spelled where
 * the build spells it, so "locked in" reads the same on both screens.
 */
export const rivalChipFor = (
	config: PublicConfig,
	vendorLockedConfigId?: string
): ConfigChipProps => ({
	name: config.label,
	slots: config.slots,
	...(config.level === undefined ? {} : { version: config.level }),
	badges: vendorChipFor(
		config.id === vendorLockedConfigId ? { locked: true } : undefined
	).badges,
});

const rivalBuildFor = (build: PublicBuild): readonly ConfigChipProps[] =>
	build.configs.map((config) =>
		rivalChipFor(config, build.vendorLockedConfigId)
	);

const rivalFor = (offer: AttackOfferView): AttackRival => ({
	targetRunId: offer.targetRunId,
	name: offer.name,
	gate: gateLabelOf(offer.gate, offer.gateName),
	build: rivalBuildFor(offer.build),
	payloads: offer.payloads.map((payload) => ({
		auditId: payload.auditId,
		code: payload.code,
		name: payload.name,
		label: `${FIRE_WORD} ${payload.code} ${AT_WORD} ${offer.name}`,
	})),
});

/**
 * Always a panel, never nothing: an unarmed run reads how to earn a shot, an
 * armed one still dealing says so, and an armed one with no rival says why.
 */
export const attackPanelFor = (
	attack: Attack | null,
	offers: readonly AttackOfferView[] | null,
	problem: string | null = null,
	note?: string
): AttackPanelProps => {
	if (attack === null)
		return { title: ATTACK_TITLE, rivals: [], empty: ATTACK_UNARMED, note };

	const meta = attackMetaOf(attack.band);
	if (problem !== null)
		return { title: ATTACK_TITLE, meta, rivals: [], empty: problem, note };
	if (offers === null)
		return { title: ATTACK_TITLE, meta, rivals: [], empty: ATTACK_DEALING };

	return {
		title: ATTACK_TITLE,
		meta,
		rivals: offers.map(rivalFor),
		empty: offers.length === 0 ? ATTACK_NO_RIVAL : undefined,
		note,
	};
};

export const INCIDENTS_TITLE = "Incidents";
export const INCIDENTS_EMPTY =
	"nobody has fired today — a quiet day is a real outcome";
export const INCIDENTS_DEALING = "reading today's incidents…";
export const INCIDENTS_UNREADABLE =
	"couldn't read today's incidents — your run is unaffected, try again shortly";
const FILED_TRAIL = "filed today · everyone's, newest first";

const incidentRowFor = (row: IncidentFeedRowView): IncidentRowProps => ({
	id: row.id,
	sentBy: row.sentBy,
	target: row.target,
	code: row.code,
	name: row.name,
	gate: gateLabelOf(row.gate, row.gateName),
	status: row.status,
	own: row.own,
});

export type IncidentsBack = {
	readonly label: string;
	readonly onPress?: () => void;
};

export const incidentsScreenPropsFor = (
	rows: readonly IncidentFeedRowView[],
	back: IncidentsBack
): IncidentsScreenProps => ({
	title: INCIDENTS_TITLE,
	subtitle: `${rows.length} ${rows.length === 1 ? "incident" : "incidents"} ${FILED_TRAIL}`,
	rows: rows.map(incidentRowFor),
	empty: INCIDENTS_EMPTY,
	footer: { action: { label: back.label, onPress: back.onPress } },
});
