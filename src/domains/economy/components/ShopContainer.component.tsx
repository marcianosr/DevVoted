import { useState } from "react";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";

import {
	addConfigToRunServerFn,
	removeConfigFromRunServerFn,
} from "~/domains/economy/api/configs";
import ActiveCard from "~/domains/economy/components/Cards/ActiveCard.component";
import ShopCard from "~/domains/economy/components/Cards/ShopCard.component";
import { ConfigVariantDialog } from "~/domains/economy/components/ConfigVariantDialog.component";
import { Config } from "~/domains/economy/models/config.model";
import { StorageBreakdown } from "~/domains/economy/components/StorageBreakdown.component";
import {
	getActiveConfigs,
	getStorageInfo,
	isConfigInstalled,
} from "~/domains/economy/services/configManager.service";
import { calculateRerollCost } from "~/domains/economy/services/reroll.service";
import { rerollShopServerFn } from "~/domains/runs/api/reroll";
import { Run } from "~/domains/runs/models/run.model";
import { formatStorage } from "~/lib/storage";
import { Button } from "~/ui/Button.component";

type ShopContainerProps = {
	activeRun: Run;
	offeredConfigs: (Config & { originalCost?: number })[];
	nextOfferedConfigs: (Config & { originalCost?: number })[];
	reductionCost: number;
	isOpen: boolean;
	showNextConfigs?: boolean;
	date: string;
};

const ShopContainer = ({
	activeRun,
	offeredConfigs,
	nextOfferedConfigs,
	reductionCost,
	isOpen,
	date,
}: ShopContainerProps) => {
	const router = useRouter();
	const {
		storageAvailable,
		storageUsed,
		storageLimit,
		configsStorage,
		rerollsStorage,
	} = getStorageInfo(activeRun);
	const today = date;

	const rerollCost = calculateRerollCost(activeRun.rerolls);
	const canReroll = storageAvailable >= rerollCost;

	const [pendingVariantConfig, setPendingVariantConfig] =
		useState<Config | null>(null);

	const installConfigMutation = useMutation({
		mutationFn: addConfigToRunServerFn,
		onSuccess: () => router.invalidate(),
	});

	const installConfigById = (configId: string) =>
		installConfigMutation.mutate({
			data: { configIds: [configId], runId: activeRun.id, date: today },
		});

	const onInstallConfig = (config: Config) => {
		if (config.variants?.length) {
			setPendingVariantConfig(config);
			return;
		}
		installConfigById(config.id);
	};

	const onChooseVariant = (variantId: string) => {
		setPendingVariantConfig(null);
		installConfigById(variantId);
	};

	const deinstallConfigMutation = useMutation({
		mutationFn: removeConfigFromRunServerFn,
		onSuccess: () => router.invalidate(),
	});

	const onDeinstallConfig = (config: Config) =>
		deinstallConfigMutation.mutate({
			data: { configIds: [config.id], runId: activeRun.id, date: today },
		});

	const activeConfigs = getActiveConfigs(activeRun);

	const onRerollMutation = useMutation({
		mutationFn: rerollShopServerFn,
		onSuccess: () => router.invalidate(),
	});

	const onReroll = () =>
		onRerollMutation.mutate({ data: { runId: activeRun.id, date: today } });

	return (
		<section aria-labelledby="shop-heading">
			<header className="mb-6">
				<h2 id="shop-heading" className="text-3xl">
					Config Manager Shop -{" "}
					{isOpen ? (
						<span className="text-green-400">OPEN</span>
					) : (
						<span className="text-red-400">CLOSED</span>
					)}
				</h2>
				<p className="text-gray-300">
					Improve your run by installing configs from the Config Manager Shop!
				</p>
			</header>

			<div className="flex flex-col gap-4">
				<ul className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2">
					{offeredConfigs.map((config) => (
						<li key={config.id} className="shrink-0 snap-start">
							<ShopCard
								config={config}
								disabled={config.cost > storageAvailable || !isOpen}
								isInstalled={isConfigInstalled(activeRun, config)}
								onInstall={() => onInstallConfig(config)}
							/>
						</li>
					))}
				</ul>
				<div className="flex gap-6 items-start bg-zinc-900 p-4">
					<div className="flex flex-col">
						<Button
							size="small"
							onClick={onReroll}
							disabled={!canReroll || !isOpen || onRerollMutation.isPending}
						>
							{onRerollMutation.isPending
								? "Rebuilding..."
								: "Rebuild package offers"}
						</Button>
						<small className="text-sm mt-2">
							Cost: {formatStorage(rerollCost)}
						</small>
					</div>
					{reductionCost > 0 && (
						<p className="text-green-600 font-semibold text-sm mt-1 self-center">
							{reductionCost * 100}% discount active!
						</p>
					)}
				</div>
			</div>

			<div className="mt-8 flex flex-col gap-8 md:flex-row md:items-start">
				<div className="max-w-xs shrink-0">
					<StorageBreakdown
						storageUsed={storageUsed}
						storageLimit={storageLimit}
						storageAvailable={storageAvailable}
						configsStorage={configsStorage}
						rerollsStorage={rerollsStorage}
						deinstallPenalty={activeRun.deinstallPenalty}
						injectedArchive={activeRun.injectedArchiveBytes}
					/>
				</div>

				<section className="flex-1 min-w-0">
					<header className="mb-4">
						<h3 className="text-2xl">Installed configs</h3>
						<p className="text-gray-300">
							Deinstall a config to reclaim storage, minus a refund penalty.
						</p>
					</header>
					{activeConfigs.length === 0 ? (
						<p className="text-gray-400">No configs installed yet.</p>
					) : (
						<ul className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2">
							{activeConfigs.map((config) => (
								<li key={config.id} className="shrink-0 snap-start">
									<ActiveCard
										config={config}
										size="small"
										onDeinstall={onDeinstallConfig}
										disabled={!isOpen || deinstallConfigMutation.isPending}
									/>
								</li>
							))}
						</ul>
					)}
				</section>
			</div>

			{pendingVariantConfig && (
				<ConfigVariantDialog
					isOpen={pendingVariantConfig !== null}
					config={pendingVariantConfig}
					onChoose={onChooseVariant}
					onCancel={() => setPendingVariantConfig(null)}
				/>
			)}

			{nextOfferedConfigs.length > 0 && (
				<section className="mt-8">
					<header className="mb-4">
						<h3 className="text-2xl">Next package offers</h3>
						<p className="text-gray-300">
							These packages will be installable after you rebuild the shop
							offers.
						</p>
					</header>
					<ul className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2">
						{nextOfferedConfigs.map((config) => (
							<li key={config.id} className="shrink-0 snap-start">
								<ActiveCard key={config.id} config={config} size="small" />
							</li>
						))}
					</ul>
				</section>
			)}
		</section>
	);
};

export default ShopContainer;
