import { WEIGHT } from "~/shared/lib/copy";

import { publicBuildChipsFor } from "~/modules/run/build/application/publicBuild.viewmodel";
import {
	publicWeightOf,
	type PublicBuild,
	type PublicConfig,
} from "~/modules/run/build/domain/publicBuild.model";
import type { AuditId } from "~/modules/run/gate/domain/audit.model";
import { auditAt } from "~/modules/run/gate/domain/audit.model";
import { AUDITS_FROM_GATE } from "~/modules/run/gate/domain/auditSchedule.model";
import {
	gateLabelOf,
	gateSwatchAt,
} from "~/modules/run/gate/application/swatchTrack.viewmodel";
import type {
	AttackOffer,
	RivalFace,
} from "~/modules/run/incident/domain/incident.model";
import type {
	IncidentFeedRow,
	IncidentStatus,
} from "~/modules/run/incident/infrastructure/incident.repository";
import type {
	HeldAudit,
	HeldAuditBand,
} from "~/modules/run/run/domain/run.model";
import type {
	AttackPanelProps,
	AttackPayload,
	AttackRival,
} from "~/ui/kanto-theme/AttackPanel.ui";
import type {
	IncidentRowProps,
	IncidentsPanelProps,
} from "~/ui/kanto-theme/IncidentsPanel.ui";

export type PayloadView = {
	readonly auditId: AuditId;
	readonly code: number;
	readonly name: string;
	readonly effect: string;
};

export type AttackOfferView = RivalFace & {
	readonly targetRunId: number;
	readonly userId: string;
	readonly name: string;
	readonly gate: number;
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
	readonly status: IncidentStatus;
	readonly own: boolean;
};

const payloadViewFor = (auditId: AuditId, gate: number): PayloadView => {
	const audit = auditAt(auditId, gate);
	return {
		auditId,
		code: audit.code,
		name: audit.name,
		effect: audit.description,
	};
};

export const attackOfferViewFor = (offer: AttackOffer): AttackOfferView => ({
	targetRunId: offer.targetRunId,
	userId: offer.targetUserId,
	name: offer.name,
	...(offer.photoUrl === undefined ? {} : { photoUrl: offer.photoUrl }),
	...(offer.borderUrl === undefined ? {} : { borderUrl: offer.borderUrl }),
	...(offer.title === undefined ? {} : { title: offer.title }),
	gate: offer.targetGate,
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
		status: row.status,
		own: row.sentBy.id === viewerId || row.target.id === viewerId,
	};
};

export const rivalIdsFor = (
	rows: readonly IncidentFeedRow[],
	viewerId: string
): readonly string[] => [
	...new Set(
		rows.flatMap((row) => {
			if (row.sentBy.id === viewerId) return [row.target.id];
			if (row.target.id === viewerId) return [row.sentBy.id];
			return [];
		})
	),
];

export const ATTACK_TITLE = "Your audit";
export const ATTACK_UNARMED =
	"no audit armed — clear a gate HEALTHY or better to earn one";
export const ATTACK_NO_RIVAL =
	"no rival in range — one must be at your gate or ahead, and have closed HEALTHY or better";
export const ATTACK_DEALING = "dealing your rivals…";
export const ATTACK_NOTE =
	"One audit a run, aimed at their next gate. They see your handle, and surviving it pays them 32 KB.";
const FIRE_WORD = "Fire";
const AT_WORD = "at";

const attackMetaOf = (band: HeldAuditBand): string =>
	band === "perfect" ? "choose 1 of 2 payloads" : "1 payload";

const FIRST_VERSION = 1;

const levelOf = (config: PublicConfig): number => config.level ?? FIRST_VERSION;

export const targetedConfigOf = (
	auditId: AuditId,
	gate: number,
	build: PublicBuild
): PublicConfig | undefined => {
	const pick = auditAt(auditId, gate).disablesConfig;
	if (pick !== "highest-level" && pick !== "lowest-level") return undefined;

	const highest = pick === "highest-level";
	const edgeLevel = build.configs.reduce(
		(best, config) =>
			highest
				? Math.max(best, levelOf(config))
				: Math.min(best, levelOf(config)),
		highest ? FIRST_VERSION : Number.POSITIVE_INFINITY
	);
	const tied = build.configs.filter((config) => levelOf(config) === edgeLevel);
	return tied.length === 1 ? tied[0] : undefined;
};

const payloadFor = (
	offer: AttackOfferView,
	payload: PayloadView
): AttackPayload => {
	const hit = targetedConfigOf(payload.auditId, offer.gate, offer.build);
	return {
		auditId: payload.auditId,
		code: payload.code,
		name: payload.name,
		effect: payload.effect,
		label: `${FIRE_WORD} ${payload.code} ${AT_WORD} ${offer.name}`,
		...(hit === undefined ? {} : { hits: hit.label }),
	};
};

const rivalFor = (offer: AttackOfferView): AttackRival => {
	const payloads = offer.payloads.map((payload) => payloadFor(offer, payload));
	return {
		targetRunId: offer.targetRunId,
		userId: offer.userId,
		name: offer.name,
		...(offer.photoUrl === undefined ? {} : { photoUrl: offer.photoUrl }),
		...(offer.borderUrl === undefined ? {} : { borderUrl: offer.borderUrl }),
		...(offer.title === undefined ? {} : { title: offer.title }),
		gate: gateLabelOf(offer.gate),
		swatch: { state: "discovered", swatch: gateSwatchAt(offer.gate) },
		weight: `${publicWeightOf(offer.build)} ${WEIGHT}`,
		build: publicBuildChipsFor(offer.build),
		hits: payloads.flatMap((payload) =>
			payload.hits === undefined ? [] : [payload.hits]
		),
		payloads,
	};
};

export const attackPanelFor = (
	gate: number,
	heldAudit: HeldAudit | null,
	offers: readonly AttackOfferView[] | null,
	problem: string | null = null,
	note: string = ATTACK_NOTE
): AttackPanelProps | undefined => {
	if (gate < AUDITS_FROM_GATE) return undefined;

	if (heldAudit === null)
		return { title: ATTACK_TITLE, rivals: [], empty: ATTACK_UNARMED, note };

	const meta = attackMetaOf(heldAudit.band);
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
	gate: gateLabelOf(row.gate),
	status: row.status,
	own: row.own,
});

export const incidentsPanelFor = (
	rows: readonly IncidentFeedRowView[]
): IncidentsPanelProps => ({
	title: INCIDENTS_TITLE,
	summary: `${rows.length} ${rows.length === 1 ? "incident" : "incidents"} ${FILED_TRAIL}`,
	rows: rows.map(incidentRowFor),
	empty: INCIDENTS_EMPTY,
});
