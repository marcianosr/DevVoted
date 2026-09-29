import type {
	PublicBuild,
	PublicConfig,
} from "~/modules/run/build/domain/publicBuild.model";
import type { AuditId } from "~/modules/run/gate/domain/audit.model";
import { auditAt } from "~/modules/run/gate/domain/audit.model";
import { gateLabelOf } from "~/modules/run/gate/application/swatchTrack.viewmodel";
import type {
	AttackOffer,
	RivalFace,
} from "~/modules/run/incident/domain/incident.model";
import type {
	IncidentFeedRow,
	IncidentStatus,
} from "~/modules/run/incident/infrastructure/incident.repository";
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
	readonly audit: PayloadView;
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
	audit: payloadViewFor(offer.auditId, offer.targetGate),
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
