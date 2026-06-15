import { configs } from "~/domains/economy/data/configs";
import {
	REFUND_RATE,
	canAddConfigToRun,
	canAddDiscountedConfigToRun,
} from "~/domains/economy/services/configManager.service";
import { fetchActiveTechDebtsByRun } from "~/domains/techDebt/api/queries";
import { acquireTechDebt } from "~/domains/techDebt/services/acquireTechDebt.service";
import { isShopLockedByTechDebt } from "~/domains/techDebt/services/debuffEffects.service";
import { getAuthenticatedUserId } from "~/utils/authorization";
import { handleApiOperation } from "~/utils/errorHandling";

import {
	addConfigToRunQuery,
	PurchaseVariant,
	removeConfigFromRunQuery,
	getRunByIdQuery,
} from "./queries";

const DEFLATE_CONFIG_ID = "deflate-config";

/**
 * Gets the cost reduction from active configs without running poll-dependent effects.
 * Currently only the "Deflate" config provides cost reduction.
 */
const getReductionCost = (activeConfigIds: string[]): number => {
	if (!activeConfigIds.includes(DEFLATE_CONFIG_ID)) {
		return 0;
	}

	const deflateConfig = configs.find((c) => c.id === DEFLATE_CONFIG_ID);
	return deflateConfig?.reductionCost ?? 0;
};

export const addConfigToRunHandler = async ({
	data,
}: {
	data: {
		runId: number;
		configIds: string[];
		date?: string;
		purchaseVariant?: PurchaseVariant;
	};
}) => {
	return handleApiOperation(async () => {
		const userId = await getAuthenticatedUserId();
		const { runId, configIds, date } = data;
		const purchaseVariant: PurchaseVariant = data.purchaseVariant ?? "normal";

		const currentRun = await getRunByIdQuery(runId);

		if (currentRun.userId !== userId) {
			throw new Error("Unauthorized: Cannot modify another user's run");
		}

		const activeTechDebts = await fetchActiveTechDebtsByRun(runId);
		if (isShopLockedByTechDebt(activeTechDebts)) {
			throw new Error("Shop is locked by an active Tech Debt");
		}

		const config = configs.find((c) => configIds.includes(c.id));
		if (!config) {
			throw new Error(`Config with id ${configIds} not found`);
		}

		const reductionCost = getReductionCost(currentRun.activeConfigIds);

		const canAdd =
			purchaseVariant === "discount"
				? canAddDiscountedConfigToRun(currentRun, config, configs)
				: canAddConfigToRun(currentRun, config, configs, reductionCost);

		if (!canAdd) {
			throw new Error(
				"Cannot add config: insufficient storage or already exists"
			);
		}

		// For discount purchases, the Tech Debt is acquired *after* storage and
		// pool checks pass — if either fails, no TD is spawned. Soft-cap and
		// pool-availability are enforced by acquireTechDebt; on refusal, we
		// roll back by refusing the whole purchase rather than charging the
		// player discount price without giving them the debt.
		if (purchaseVariant === "discount") {
			const acquired = await acquireTechDebt({ runId });
			if (acquired.status !== "acquired") {
				throw new Error(
					acquired.status === "softCapReached"
						? "Cannot accept Tech Debt: limit reached"
						: "No Tech Debt available — all are already active"
				);
			}
		}

		return await addConfigToRunQuery(runId, configIds, date, purchaseVariant);
	});
};

export const removeConfigFromRunHandler = async ({
	data,
}: {
	data: {
		runId: number;
		configIds: string[];
		date?: string;
	};
}) => {
	return handleApiOperation(async () => {
		const { runId, configIds, date } = data;

		// TODO: include other config effects in future if refundRate depends on them
		// const { refundRate } = applyEffects(..., run.activeConfigIds);

		// Get config cost before removing
		const configToRemove = configs.find((c) => configIds.includes(c.id));
		const penalty = (configToRemove?.cost ?? 0) * (1 - REFUND_RATE);

		return await removeConfigFromRunQuery(runId, configIds, penalty, date);
	});
};
