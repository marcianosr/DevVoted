import {
	extendCost,
	LOCK_COST_KB,
	rebuildCost,
} from "~/modules/run/shop/domain/draft.model";
import { pinCostFor } from "~/modules/run/run/domain/rules.model";
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

/** ADR-029's three horizons plus the tag. `*Available` is whether this depth of
 * climb sells it, `can*` whether the run can pay: the shop hides one and disables the other. */
export type ShopControls = {
	readonly rebuildCost: number;
	readonly canRebuild: boolean;
	/** False while WTFPL shows the whole catalog — a reroll would sell nothing. */
	readonly rebuildAvailable: boolean;
	readonly lockAvailable: boolean;
	readonly lockCost: number;
	readonly canLock: boolean;
	readonly lockedOfferIds: readonly string[];
	readonly extendAvailable: boolean;
	readonly extendCost: number;
	readonly canExtend: boolean;
	/** Read-only (ADR-038): every buy, sell and plan change refuses. */
	readonly shopLocked: boolean;
	readonly pinAvailable: boolean;
	readonly pinCost: number;
	readonly canPin: boolean;
	readonly pinnedAtGate: number | null;
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
});
