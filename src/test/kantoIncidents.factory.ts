import type { AttackOfferView } from "~/modules/run/incident/application/incident.viewmodel";
import type { AttackOffer } from "~/modules/run/incident/domain/incident.model";
import { publicBuildOf } from "~/modules/run/build/domain/publicBuild.model";
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

const VIEWER = "red";

const held = (id: string, level: number | null = null) => ({
	id,
	level,
	minified: null,
});

/** Misty vendor-locked her Cache; Erika runs bare. */
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
		targetGate: 7,
		build: MISTY_BUILD,
		payloads: ["not-found", "memory-leak"],
	},
	{
		targetRunId: 3,
		targetUserId: "brock",
		name: "Brock",
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

/** A PERFECT close: three rivals, two payloads each to choose between. */
export const kantoAttackPanel = (): AttackPanelProps =>
	attackPanelFor({ band: "perfect" }, kantoAttackOffers());

/** A HEALTHY close: one payload per rival. */
export const kantoAttackPanelHealthy = (): AttackPanelProps =>
	attackPanelFor(
		{ band: "healthy" },
		kantoAttackOffers().map((offer) => ({
			...offer,
			payloads: offer.payloads.slice(0, 1),
		}))
	);

export const kantoAttackPanelUnarmed = (): AttackPanelProps =>
	attackPanelFor(null, null);

export const kantoAttackPanelNoRival = (): AttackPanelProps =>
	attackPanelFor({ band: "healthy" }, []);

export const kantoAttackPanelDealing = (): AttackPanelProps =>
	attackPanelFor({ band: "healthy" }, null);

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
