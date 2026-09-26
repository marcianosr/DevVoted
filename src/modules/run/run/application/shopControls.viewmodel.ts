import {
	extendCost,
	LOCK_COST_KB,
	rebuildCost,
} from "~/modules/run/shop/domain/draft.model";
import { pinCostFor, REPACKAGE_KB } from "~/modules/run/run/domain/rules.model";
import {
	canRepackage,
	repackageAvailable,
} from "~/modules/run/run/domain/heldAudit.model";
import type { RunState } from "~/modules/run/run/domain/run.model";
import { isShopLocked } from "~/modules/run/run/domain/runAction.model";
import {
	canExtend,
	canLock,
	canPlantPin,
	canRebuild,
	extendAvailable,
	lockAvailable,
	pinAvailable,
	rebuildAvailable,
} from "~/modules/run/run/domain/shopAction.model";

export type ShopControls = {
	readonly rebuildCost: number;
	readonly canRebuild: boolean;
	readonly rebuildAvailable: boolean;
	readonly lockAvailable: boolean;
	readonly lockCost: number;
	readonly canLock: boolean;
	readonly lockedOfferIds: readonly string[];
	readonly extendAvailable: boolean;
	readonly extendCost: number;
	readonly canExtend: boolean;
	readonly shopLocked: boolean;
	readonly pinAvailable: boolean;
	readonly pinCost: number;
	readonly canPin: boolean;
	readonly pinnedAtGate: number | null;
	readonly repackageAvailable: boolean;
	readonly repackageUsed: boolean;
	readonly repackageCost: number;
	readonly canRepackage: boolean;
};

export const shopControlsFor = (state: RunState): ShopControls => ({
	rebuildCost: rebuildCost(state.rebuildsUsed),
	canRebuild: canRebuild(state),
	rebuildAvailable: rebuildAvailable(state),
	lockAvailable: lockAvailable(state),
	lockCost: LOCK_COST_KB,
	canLock: canLock(state),
	lockedOfferIds: state.lockedOfferIds ?? [],
	extendAvailable: extendAvailable(state),
	extendCost: extendCost(state.extensionsBought ?? 0),
	canExtend: canExtend(state),
	shopLocked: isShopLocked(state),
	pinAvailable: pinAvailable(state),
	pinCost: pinCostFor(state.gatesCleared),
	canPin: canPlantPin(state),
	pinnedAtGate: state.pinPlantedAtGate ?? null,
	repackageAvailable: repackageAvailable(state),
	repackageUsed: state.repackagedThisShop === true,
	repackageCost: REPACKAGE_KB,
	canRepackage: canRepackage(state),
});
