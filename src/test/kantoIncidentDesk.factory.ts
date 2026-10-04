import { INCIDENT_REFRESH_COST_KB } from "~/modules/run/run/domain/rules.model";
import {
	type IncidentDeal,
	incidentDeskFor,
} from "~/modules/run/shop/application/shopScreen.viewmodel";
import type { IncidentDeskProps } from "~/ui/kanto-theme/IncidentDesk.ui";

const DESK_GATE = 6;

export const kantoIncidentDeal = (
	overrides: Partial<IncidentDeal> = {}
): IncidentDeal => ({
	offer: "breaking-change",
	gate: DESK_GATE,
	heldAudit: null,
	rivalsInReach: 4,
	balanceKb: 106,
	costKb: 32,
	refreshCostKb: INCIDENT_REFRESH_COST_KB[0],
	refreshRungsKb: INCIDENT_REFRESH_COST_KB,
	refreshes: 0,
	shopLocked: false,
	onBuy: () => {},
	onRefresh: () => {},
	...overrides,
});

export const kantoIncidentDesk = (
	overrides: Partial<IncidentDeal> = {}
): IncidentDeskProps => incidentDeskFor(kantoIncidentDeal(overrides));
