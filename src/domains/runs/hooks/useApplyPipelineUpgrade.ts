import { useMutation } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";

import { applyPipelineUpgradeFn } from "~/domains/runs/api/runs";
import type { StaticGateTypeId } from "~/domains/runs/data/pipelineSlots";
import type { UpgradeCard } from "~/domains/runs/models/pipeline.model";

type UseApplyPipelineUpgradeOptions = {
	onApplied?: () => void;
};

const toUpgradeInput = (card: UpgradeCard) => {
	if (card.kind === "upgrade-category-mastery-slot") {
		return {
			kind: "upgrade-category-mastery-slot",
			category: card.category,
			from: card.from,
			to: card.to,
		} as const;
	}

	const req = card.slot.requirement;
	if (req.type === "category-mastery") {
		return {
			kind: "add-category-mastery-slot",
			category: req.category,
			difficulty: card.slot.difficulty,
		} as const;
	}

	return card.kind === "add-slot"
		? ({
				kind: "add-slot",
				gateTypeId: card.slot.gateTypeId as StaticGateTypeId,
				difficulty: card.slot.difficulty,
			} as const)
		: ({
				kind: "upgrade-slot",
				gateTypeId: card.gateTypeId as StaticGateTypeId,
				from: card.from,
				to: card.to,
			} as const);
};

export const useApplyPipelineUpgrade = ({
	onApplied,
}: UseApplyPipelineUpgradeOptions = {}) => {
	const router = useRouter();

	const mutation = useMutation({ mutationFn: applyPipelineUpgradeFn });

	// Apply each selected card in sequence — the server re-reads the run's slots
	// per call, so awaited applies compound correctly — then finalize once.
	const applyMany = async (cards: UpgradeCard[]) => {
		if (mutation.isPending || cards.length === 0) return;

		for (const card of cards) {
			await mutation.mutateAsync({ data: toUpgradeInput(card) });
		}

		onApplied?.();
		await router.invalidate();
	};

	return { applyMany, isPending: mutation.isPending };
};
