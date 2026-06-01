import { useMutation } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";

import { applyPipelineUpgradeFn } from "~/domains/runs/api/runs";
import type { StaticGateTypeId } from "~/domains/runs/data/pipelineSlots";
import type { UpgradeCard } from "~/domains/runs/models/pipeline.model";

type UseApplyPipelineUpgradeOptions = {
	onApplied?: () => void;
};

export const useApplyPipelineUpgrade = ({
	onApplied,
}: UseApplyPipelineUpgradeOptions = {}) => {
	const router = useRouter();

	const mutation = useMutation({
		mutationFn: applyPipelineUpgradeFn,
		onSuccess: () => {
			onApplied?.();
			router.invalidate();
		},
	});

	const apply = (card: UpgradeCard) => {
		if (mutation.isPending) return;

		if (card.kind === "upgrade-category-mastery-slot") {
			mutation.mutate({
				data: {
					kind: "upgrade-category-mastery-slot",
					category: card.category,
					from: card.from,
					to: card.to,
				} as const,
			});
			return;
		}

		const req = card.slot.requirement;

		if (req.type === "category-mastery") {
			mutation.mutate({
				data: {
					kind: "add-category-mastery-slot",
					category: req.category,
					difficulty: card.slot.difficulty,
				} as const,
			});
			return;
		}

		const input =
			card.kind === "add-slot"
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

		mutation.mutate({ data: input });
	};

	return { apply, isPending: mutation.isPending };
};
