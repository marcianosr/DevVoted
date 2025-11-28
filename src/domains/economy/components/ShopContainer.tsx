import { useMutation } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";

import { addConfigToRunServerFn } from "~/domains/configs/api/configs";
import ShopCard from "~/domains/configs/components/Cards/ShopCard";
import { Config } from "~/domains/configs/models/config";
import {
	getRandomConfigs,
	getStorageInfo,
} from "~/domains/economy/services/configManager.service";
import { calculateRerollCost } from "~/domains/economy/services/reroll.service";
import { rerollShopServerFn } from "~/domains/runs/api/reroll";
import { Run } from "~/domains/runs/models/run";
import { formatStorage } from "~/lib/storage";
import { PrimaryButton } from "~/ui/PrimaryButton";

type ShopContainerProps = {
	activeRun: Run;
	offeredConfigs: ReturnType<typeof getRandomConfigs>;
	reductionCost: number;
	isOpen: boolean;
};

const ShopContainer = ({
	activeRun,
	offeredConfigs,
	reductionCost,
	isOpen,
}: ShopContainerProps) => {
	const router = useRouter();
	const { storageAvailable } = getStorageInfo(activeRun);

	const rerollCost = calculateRerollCost(activeRun.rerolls);
	const canReroll = storageAvailable >= rerollCost;

	const installConfigMutation = useMutation({
		mutationFn: addConfigToRunServerFn,
		onSuccess: () => router.invalidate(),
	});

	const onInstallConfig = (config: Config) => {
		installConfigMutation.mutate({
			data: { configIds: [config.id], runId: activeRun.id },
		});
	};

	const onRerollMutation = useMutation({
		mutationFn: rerollShopServerFn,
		onSuccess: () => router.invalidate(),
	});

	const onReroll = () =>
		onRerollMutation.mutate({ data: { runId: activeRun.id } });

	return (
		<section aria-labelledby="shop-heading">
			<header className="mb-4">
				<h2 id="shop-heading" className="text-3xl">
					Shop (Package Manager) -{" "}
					{isOpen ? (
						<span className="text-green-400">OPEN</span>
					) : (
						<span className="text-red-400">CLOSED</span>
					)}
				</h2>
				<p>Improve your run by installing packages!</p>
			</header>
			<div className="grid grid-cols-8 gap-4">
				<div className="flex flex-col gap-2 col-span-8 md:col-span-2">
					<div className="flex flex-col col-span-4">
						<PrimaryButton
							size="small"
							onClick={onReroll}
							disabled={!canReroll || !isOpen || onRerollMutation.isPending}
						>
							{onRerollMutation.isPending
								? "Rebuilding package offers..."
								: "Rebuild package offers"}
						</PrimaryButton>
						<small className="text-sm mt-2">
							Cost: {formatStorage(rerollCost)}
						</small>
					</div>
					<div className="flex flex-col col-span-8 md:col-span-4">
						<PrimaryButton size="small" disabled={true}>
							Skip shop
						</PrimaryButton>
						<small className="text-sm mt-2">
							Gain +30KB storage (teaser HAH!)
						</small>
					</div>
				</div>

				{reductionCost > 0 && (
					<p className="text-green-600 font-semibold mt-1">
						{reductionCost * 100}% discount active!
					</p>
				)}
				<ul className="flex gap-4 overflow-x-auto snap-x snap-mandatory col-span-8 md:col-span-6">
					{offeredConfigs.map((config) => (
						<li key={config.id} className="shrink-0 snap-start">
							<ShopCard
								config={config}
								disabled={config.cost > storageAvailable || !isOpen}
								onInstall={() => onInstallConfig(config)}
							/>
						</li>
					))}
				</ul>
			</div>
		</section>
	);
};

export default ShopContainer;
