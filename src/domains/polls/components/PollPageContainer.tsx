import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useActiveRun } from "~/domains/runs/hooks";
import { StartRunScreen } from "~/domains/runs/components/StartRunScreen";
import { ErrorComponent } from "~/ui/ErrorComponent";
import { LoadingSkeleton } from "~/ui/LoadingSkeleton";
import { ShopProvider } from "~/domains/economy/contexts/ShopContext";
import { applyEffects } from "~/domains/configs/data/configs";
import {
	addConfigToRunServerFn,
	removeConfigFromRunServerFn,
} from "~/domains/configs/api/configs";
import { runQueryKeys } from "~/domains/shared/queryKeys";
import { PollWithOptionsResponse } from "~/domains/polls/models/poll";
import { useState } from "react";
import { PollScoreBreakdown } from "~/domains/score/services/score.service";
import PollContent from "./PollContent";
import { User } from "~/domains/users/services/userSync.service";

type PollPageContainerProps = {
	user: User;
	poll: PollWithOptionsResponse;
};

export const PollPageContainer: React.FC<PollPageContainerProps> = ({
	user,
	poll,
}) => {
	const queryClient = useQueryClient();
	const [lastScoreBreakdown, setLastScoreBreakdown] =
		useState<PollScoreBreakdown | null>(null);

	const {
		activeRun,
		hasActiveRun,
		isLoading: isLoadingRun,
		error: runError,
		startRun,
		isStarting,
	} = useActiveRun(user?.id);

	const addConfigsMutation = useMutation({
		mutationFn: addConfigToRunServerFn,
		onMutate: async (variables) => {
			const activeRunQueryKey = runQueryKeys.active(user?.id);
			await queryClient.cancelQueries({ queryKey: activeRunQueryKey });
			const previousData = queryClient.getQueryData(activeRunQueryKey);

			// Optimistically update the active run to include the new config
			queryClient.setQueryData(activeRunQueryKey, (old: any) => {
				if (!old?.data?.activeRun) return old;

				const newConfigIds = [
					...(old.data.activeRun.configIds || []),
					...variables.data.configIds,
				];
				return {
					...old,
					data: {
						...old.data,
						activeRun: {
							...old.data.activeRun,
							configIds: newConfigIds,
						},
					},
				};
			});

			return { previousData, activeRunQueryKey };
		},
		onSuccess: (data) => {
			console.log("Add configs response:", data);
			if (!data.success) {
				console.error("Failed to add configs:", data.error);
			}
		},
		onError: (error, _variables, context) => {
			console.error("Error adding configs:", error);
			if (context?.previousData && context?.activeRunQueryKey) {
				queryClient.setQueryData(
					context.activeRunQueryKey,
					context.previousData
				);
			}
		},
		onSettled: () => {
			// Always refetch to ensure consistency
			queryClient.invalidateQueries({
				queryKey: runQueryKeys.active(user?.id),
			});
		},
	});

	const removeConfigMutation = useMutation({
		mutationFn: removeConfigFromRunServerFn,
		onMutate: async (variables) => {
			const activeRunQueryKey = runQueryKeys.active(user?.id);
			await queryClient.cancelQueries({ queryKey: activeRunQueryKey });
			const previousData = queryClient.getQueryData(activeRunQueryKey);

			// Optimistically update the active run to remove the config
			queryClient.setQueryData(activeRunQueryKey, (old: any) => {
				if (!old?.data?.activeRun) return old;

				const newConfigIds = (
					old.data.activeRun.configIds || []
				).filter(
					(id: string) => !variables.data.configIds.includes(id)
				);
				return {
					...old,
					data: {
						...old.data,
						activeRun: {
							...old.data.activeRun,
							configIds: newConfigIds,
						},
					},
				};
			});

			return { previousData, activeRunQueryKey };
		},
		onSuccess: (data) => {
			console.log("Remove config response:", data);
			if (!data.success) {
				console.error("Failed to remove config:", data.error);
			}
		},
		onError: (error, _variables, context) => {
			console.error("Error removing configs:", error);
			if (context?.previousData && context?.activeRunQueryKey) {
				queryClient.setQueryData(
					context.activeRunQueryKey,
					context.previousData
				);
			}
		},
		onSettled: () => {
			// Always refetch to ensure consistency
			queryClient.invalidateQueries({
				queryKey: runQueryKeys.active(user?.id),
			});
		},
	});

	const handleStartRun = () => {
		startRun();
	};

	const handleAddConfig = (configId: string) => {
		if (activeRun?.id) {
			addConfigsMutation.mutate({
				data: {
					runId: activeRun.id,
					configIds: [configId],
				},
			});
		} else {
			console.error("No active run ID found");
		}
	};

	const handleRemoveConfig = (configId: string) => {
		if (activeRun?.id) {
			removeConfigMutation.mutate({
				data: {
					runId: activeRun.id,
					configIds: [configId],
				},
			});
		} else {
			console.error("No active run ID found");
		}
	};

	// Show loading state for run check
	if (isLoadingRun) {
		return <LoadingSkeleton />;
	}

	if (runError) {
		return (
			<ErrorComponent text={`Error loading run: ${String(runError)}`} />
		);
	}

	// No active run - show start button
	if (!hasActiveRun) {
		return (
			<StartRunScreen
				isStarting={isStarting}
				onStartRun={handleStartRun}
				userId={user?.id}
			/>
		);
	}

	const effectsResult = applyEffects(
		{ ...poll, run: activeRun! },
		activeRun?.activeConfigIds
	);

	console.log("Effects result:", activeRun?.activeConfigIds);

	return (
		<div className="p-4">
			<ShopProvider
				onAddConfig={handleAddConfig}
				onRemoveConfig={handleRemoveConfig}
			>
				<PollContent
					pollData={effectsResult.view}
					effectProps={effectsResult.renderProps}
					user={user}
					activeRun={activeRun}
					lastScoreBreakdown={lastScoreBreakdown}
					setLastScoreBreakdown={setLastScoreBreakdown}
					costReduction={effectsResult.reductionCost ?? 0}
				/>
			</ShopProvider>
		</div>
	);
};
