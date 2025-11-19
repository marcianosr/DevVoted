import { createFileRoute, Link } from "@tanstack/react-router";
import { ShopProvider } from "~/domains/economy/contexts/ShopContext";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	addConfigToRunServerFn,
	removeConfigFromRunServerFn,
} from "~/domains/configs/api/configs";
import { pollQueryKeys, runQueryKeys } from "~/domains/shared/queryKeys";
import { getDailyPoll } from "~/domains/polls/api/polls";
import { requiresActiveRun } from "~/domains/runs/guards/requiresActiveRun";
import { Shop } from "~/domains/economy/components/Shop";
import { useMemo, useState } from "react";
import { getRandomConfigs } from "~/domains/economy/services/configManager.service";
import { applyEffects, configs } from "~/domains/configs/data/configs";
import { rerollShopServerFn } from "~/domains/runs/api/reroll";
import { PrimaryButton } from "~/ui/PrimaryButton";

export const Route = createFileRoute("/_authed/shop")({
	beforeLoad: async () => {
		const activeRun = await requiresActiveRun();
		return { activeRun };
	},
	component: ShopPage,
});

function ShopPage() {
	const { user, activeRun } = Route.useRouteContext();
	const queryClient = useQueryClient();
	const [rerollKey, setRerollKey] = useState(0);

	const { data, isLoading, error } = useQuery({
		queryKey: pollQueryKeys.daily(user?.id),
		queryFn: () => getDailyPoll(),
		enabled: !!user?.id,
	});

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
			if (!data.success) {
				console.error("Failed to remove config:", data.error);
			}
		},
		onError: (error, _variables, context) => {
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
		// activeRun guaranteed to exist by route guard
		addConfigsMutation.mutate({
			data: {
				runId: activeRun.id,
				configIds: [configId],
			},
		});
	};

	const handleRemoveConfig = (configId: string) => {
		// activeRun guaranteed to exist by route guard
		removeConfigMutation.mutate({
			data: {
				runId: activeRun.id,
				configIds: [configId],
			},
		});
	};

	// TODO: Put in a hook
	const randomConfigs = useMemo(() => {
		if (!activeRun) return [];
		return getRandomConfigs({
			run: activeRun,
			configs,
			count: 3,
		});
	}, [activeRun?.id, rerollKey]);

	const rerollMutation = useMutation({
		mutationFn: rerollShopServerFn,
		onSuccess: (data) => {
			if (data.success) {
				// Force regeneration of random configs
				setRerollKey((prev) => prev + 1);
				// Invalidate run query to get updated reroll count and KB spent
				queryClient.invalidateQueries({
					queryKey: runQueryKeys.active(user?.id),
				});
			}
		},
	});

	const handleReroll = () => {
		if (activeRun?.id) {
			rerollMutation.mutate({ data: { runId: activeRun.id } });
		}
	};

	// Early returns after all hooks are defined
	if (isLoading) {
		return <div>Loading poll...</div>;
	}

	if (error || !data) {
		return <div>Error loading poll</div>;
	}

	if (!data.success) {
		return <div>Error: {data.error}</div>;
	}

	const { hasAnswered } = data.data;

	// Apply config effects to get cost reduction for shop
	const dataWithEffects = applyEffects(
		{ ...data.data, run: activeRun },
		activeRun.activeConfigIds
	);

	return (
		<ShopProvider
			initialShopOpen={hasAnswered}
			onAddConfig={handleAddConfig}
			onRemoveConfig={handleRemoveConfig}
		>
			<div>
				{hasAnswered ? (
					<Shop
						activeRun={activeRun}
						offeredConfigs={randomConfigs}
						onReroll={handleReroll}
						costReduction={dataWithEffects.reductionCost ?? 0}
					/>
				) : (
					<div>Please answer today's poll to access the shop.</div>
				)}
			</div>
		</ShopProvider>
	);
}
