import { lootFallenRun } from "~/modules/run/community/application/community.serverfn";
import { useApiMutation } from "~/shared/hooks/useApiMutation.hook";
import { useRunCommit } from "~/modules/run/run/application/useRunCommit.hook";

export const useLootFallenRun = () => {
	const { refresh } = useRunCommit();

	const claim = useApiMutation({
		mutationFn: (runId: number) => lootFallenRun({ data: { runId } }),
		onSuccess: refresh,
	});

	return {
		onLoot: (runId: number) => claim.mutate(runId),
		pendingRunId: claim.isPending ? claim.variables : undefined,
		errorMessage: claim.errorMessage,
	};
};
