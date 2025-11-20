import { useState } from "react";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
	addConfigToRunServerFn,
	removeConfigFromRunServerFn,
} from "~/domains/configs/api/configs";
import { applyEffects } from "~/domains/configs/data/configs";
import { ShopProvider } from "~/domains/economy/contexts/ShopContext";
import { PollWithOptionsResponse } from "~/domains/polls/models/poll";
import { Run } from "~/domains/runs/models/run";
import { PollScoreBreakdown } from "~/domains/score/services/score.service";
import { runQueryKeys } from "~/domains/shared/queryKeys";
import { User } from "~/domains/users/services/userSync.service";

import PollContent from "./PollContent";

type PollPageContainerProps = {
	user: User;
	poll: PollWithOptionsResponse;
	activeRun: Run;
};

export const PollPageContainer: React.FC<PollPageContainerProps> = ({
	user,
	poll,
	activeRun,
}) => {
	const queryClient = useQueryClient();
	const [lastScoreBreakdown, setLastScoreBreakdown] =
		useState<PollScoreBreakdown | null>(null);

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
			if (!data.success) {
				throw new Error(data.error);
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

				const newConfigIds = (old.data.activeRun.configIds || []).filter(
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
			if (!data.success) {
				console.error("Failed to remove config:", data.error);
			}
		},
		onError: (_error, _variables, context) => {
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

	const handleAddConfig = (configId: string) => {
		addConfigsMutation.mutate({
			data: {
				runId: activeRun.id,
				configIds: [configId],
			},
		});
	};

	const handleRemoveConfig = (configId: string) => {
		removeConfigMutation.mutate({
			data: {
				runId: activeRun.id,
				configIds: [configId],
			},
		});
	};

	const effectsResult = applyEffects(
		{ ...poll, run: activeRun! },
		activeRun?.activeConfigIds
	);

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
