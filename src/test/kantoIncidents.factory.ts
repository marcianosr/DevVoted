import type { AttackOfferView } from "~/modules/run/incident/application/incident.viewmodel";
import type { AttackOffer } from "~/modules/run/incident/domain/incident.model";
import { publicBuildOf } from "~/modules/run/build/domain/publicBuild.model";
import { type AuditId, auditAt } from "~/modules/run/gate/domain/audit.model";
import { AUDITS_FROM_GATE } from "~/modules/run/gate/domain/auditSchedule.model";
import type { AuditView } from "~/modules/run/run/application/gateStake.viewmodel";
import { auditsPanelFor } from "~/modules/run/run/application/prepScreen.viewmodel";
import type { IncidentSender } from "~/modules/run/run/domain/run.model";
import type { AuditsPanelProps } from "~/ui/kanto-theme/AuditsPanel.ui";
import {
	ATTACK_DEALING,
	ATTACK_NO_RIVAL,
	ATTACK_TITLE,
	ATTACK_UNARMED,
	attackOfferViewFor,
	attackPanelFor,
	INCIDENTS_EMPTY,
	INCIDENTS_TITLE,
	incidentFeedRowFor,
	incidentsPanelFor,
} from "~/modules/run/incident/application/incident.viewmodel";
import type { AttackPanelProps } from "~/ui/kanto-theme/AttackPanel.ui";
import type { IncidentsPanelProps } from "~/ui/kanto-theme/IncidentsPanel.ui";

export {
	ATTACK_DEALING,
	ATTACK_NO_RIVAL,
	ATTACK_TITLE,
	ATTACK_UNARMED,
	INCIDENTS_EMPTY,
	INCIDENTS_TITLE,
};

const OPEN_GATE = AUDITS_FROM_GATE;

const VIEWER = "red";

const held = (id: string, level: number | null = null) => ({
	id,
	level,
	minified: null,
});

const MISTY_BUILD = publicBuildOf({
	configs: [held("ts", 4), held("cache")],
	vendorLockedConfigId: "cache",
});
const BROCK_BUILD = publicBuildOf({
	configs: [held("eslint", 2), held("telemetry")],
	vendorLockedConfigId: null,
});
const BARE_BUILD = publicBuildOf({ configs: [], vendorLockedConfigId: null });

const OFFERS: readonly AttackOffer[] = [
	{
		targetRunId: 2,
		targetUserId: "misty",
		name: "Misty",
		title: "CSS Maintainer",
		targetGate: 7,
		build: MISTY_BUILD,
		payloads: ["not-found", "memory-leak"],
	},
	{
		targetRunId: 3,
		targetUserId: "brock",
		name: "Brock",
		title: "Summit",
		targetGate: 9,
		build: BROCK_BUILD,
		payloads: ["timeout", "breaking-change"],
	},
	{
		targetRunId: 4,
		targetUserId: "erika",
		name: "Erika",
		targetGate: 5,
		build: BARE_BUILD,
		payloads: ["read-only", "too-many-requests"],
	},
];

export const kantoAttackOffers = (): readonly AttackOfferView[] =>
	OFFERS.map(attackOfferViewFor);

const panelAt = (
	...args: Parameters<typeof attackPanelFor>
): AttackPanelProps => {
	const panel = attackPanelFor(...args);
	if (panel === undefined)
		throw new Error("no attack panel below the audit floor");
	return panel;
};

export const kantoAttackPanel = (): AttackPanelProps =>
	panelAt(OPEN_GATE, { band: "perfect", gate: 4 }, kantoAttackOffers());

export const kantoAttackPanelInspected = (): AttackPanelProps => ({
	...kantoAttackPanel(),
	openRunId: OFFERS[0].targetRunId,
});

export const kantoAttackPanelHealthy = (): AttackPanelProps =>
	panelAt(
		OPEN_GATE,
		{ band: "healthy", gate: 4 },
		kantoAttackOffers().map((offer) => ({
			...offer,
			payloads: offer.payloads.slice(0, 1),
		}))
	);

export const kantoAttackPanelUnarmed = (): AttackPanelProps =>
	panelAt(OPEN_GATE, null, null);

export const kantoAttackPanelNoRival = (): AttackPanelProps =>
	panelAt(OPEN_GATE, { band: "healthy", gate: 4 }, []);

export const kantoAttackPanelDealing = (): AttackPanelProps =>
	panelAt(OPEN_GATE, { band: "healthy", gate: 4 }, null);

const at = (hour: number) =>
	new Date(`2026-09-22T${String(hour).padStart(2, "0")}:00:00`);

export const kantoIncidentRows = () =>
	[
		{
			id: 5,
			sentBy: { id: VIEWER, name: "Red" },
			target: { id: "misty", name: "Misty" },
			targetGate: 7,
			auditId: "not-found" as const,
			status: "queued" as const,
			createdAt: at(9),
		},
		{
			id: 4,
			sentBy: { id: "brock", name: "Brock" },
			target: { id: VIEWER, name: "Red" },
			targetGate: 6,
			auditId: "memory-leak" as const,
			status: "locked" as const,
			createdAt: at(8),
		},
		{
			id: 3,
			sentBy: { id: "erika", name: "Erika" },
			target: { id: "koga", name: "Koga" },
			targetGate: 9,
			auditId: "timeout" as const,
			status: "survived" as const,
			createdAt: at(7),
		},
		{
			id: 2,
			sentBy: { id: "sabrina", name: "Sabrina" },
			target: { id: "blaine", name: "Blaine" },
			targetGate: 11,
			auditId: "strip" as const,
			status: "failed" as const,
			createdAt: at(6),
		},
	].map((row) => incidentFeedRowFor(row, VIEWER));

export const kantoIncidents = (): IncidentsPanelProps =>
	incidentsPanelFor(kantoIncidentRows());

export const kantoIncidentsQuiet = (): IncidentsPanelProps =>
	incidentsPanelFor([]);

const AUDIT_BILL = { bill: "bills −32 KB on a clear" };

const firedAt = (
	gate: number,
	id: AuditId,
	sentBy?: IncidentSender
): AuditView => {
	const audit = auditAt(id, gate);
	return {
		id,
		code: audit.code,
		name: audit.name,
		description: audit.description,
		answerCue: audit.answerCue,
		suppressed: false,
		...(sentBy === undefined ? {} : { sentBy }),
	};
};

export const kantoAudits = (): AuditsPanelProps =>
	auditsPanelFor(
		OPEN_GATE,
		[
			firedAt(OPEN_GATE, "memory-leak", { id: "koga", name: "Koga" }),
			firedAt(OPEN_GATE, "too-many-requests", { id: "erika", name: "Erika" }),
		],
		AUDIT_BILL
	);

export const kantoAuditsNoSender = (): AuditsPanelProps =>
	auditsPanelFor(OPEN_GATE, [firedAt(OPEN_GATE, "memory-leak")], AUDIT_BILL);

export const kantoAuditsQuiet = (): AuditsPanelProps =>
	auditsPanelFor(OPEN_GATE, [], {});

export const kantoAuditsLocked = (): AuditsPanelProps =>
	auditsPanelFor(AUDITS_FROM_GATE - 1, [], {});
