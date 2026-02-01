import { useMutation } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";

import { addConfigToRunServerFn } from "~/domains/configs/api/configs";
import ActiveCard from "~/domains/configs/components/Cards/ActiveCard";
import ShopCard from "~/domains/configs/components/Cards/ShopCard";
import { Config } from "~/domains/configs/models/config";
import { getStorageInfo } from "~/domains/economy/services/configManager.service";
import { calculateRerollCost } from "~/domains/economy/services/reroll.service";
import { rerollShopServerFn } from "~/domains/runs/api/reroll";
import { skipShopServerFn } from "~/domains/runs/api/runs";
import { Run } from "~/domains/runs/models/run";
import { getTodayDateString } from "~/lib/dateUtils";
import { formatStorage } from "~/lib/storage";
import { PrimaryButton } from "~/ui/PrimaryButton";

type ShopContainerProps = {
	activeRun: Run;
	offeredConfigs: (Config & { originalCost?: number })[];
	nextOfferedConfigs: (Config & { originalCost?: number })[];
	storageBonus?: number;
	reductionCost: number;
	isOpen: boolean;
	showNextConfigs?: boolean;
};

const SKIP_REWARD_KB = 65536; // 64KB

const ShopContainer = ({
	activeRun,
	offeredConfigs,
	nextOfferedConfigs,
	reductionCost,
	isOpen,
	storageBonus,
}: ShopContainerProps) => {
	const router = useRouter();
	const { storageAvailable } = getStorageInfo(activeRun);
	const today = getTodayDateString();

	const rerollCost = calculateRerollCost(activeRun.rerolls);
	const canReroll = storageAvailable >= rerollCost;
	const hasSkippedShopToday = activeRun.shopSkippedDate === today;
	const hasInteractedWithShopToday = activeRun.shopInteractedDate === today;

	const installConfigMutation = useMutation({
		mutationFn: addConfigToRunServerFn,
		onSuccess: () => router.invalidate(),
	});

	const onInstallConfig = (config: Config) => {
		installConfigMutation.mutate({
			data: { configIds: [config.id], runId: activeRun.id, date: today },
		});
	};

	const onRerollMutation = useMutation({
		mutationFn: rerollShopServerFn,
		onSuccess: () => router.invalidate(),
	});

	const onReroll = () =>
		onRerollMutation.mutate({ data: { runId: activeRun.id, date: today } });

	const skipShopMutation = useMutation({
		mutationFn: skipShopServerFn,
		onSuccess: () => router.invalidate(),
	});

	const onSkipShop = () =>
		skipShopMutation.mutate({
			data: {
				runId: activeRun.id,
				date: today,
				storageBonus: storageBonus ?? 0,
			},
		});

	return (
		<section aria-labelledby="shop-heading" className="bg-zinc-900 p-4">
			<header className="mb-4">
				<h2 id="shop-heading" className="text-3xl">
					Config Manager Shop -{" "}
					{isOpen ? (
						<span className="text-green-400">OPEN</span>
					) : (
						<span className="text-red-400">CLOSED</span>
					)}
				</h2>
				<p className="text-gray-300">
					Improve your run by installing configs from the Config Manager
					Shop!{" "}
				</p>
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
						<PrimaryButton
							size="small"
							disabled={
								!isOpen ||
								hasSkippedShopToday ||
								hasInteractedWithShopToday ||
								skipShopMutation.isPending
							}
							onClick={onSkipShop}
						>
							{skipShopMutation.isPending ? "Skipping shop..." : "Skip shop"}
						</PrimaryButton>
						<small className="text-sm mt-2">
							Gain +{formatStorage(SKIP_REWARD_KB + (storageBonus ?? 0))}{" "}
							storage
							{storageBonus && storageBonus > 0 && (
								<span className="text-green-400">
									{" "}
									(+{formatStorage(storageBonus)} bonus)
								</span>
							)}
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

				{nextOfferedConfigs.length > 0 && (
					<section className="col-span-8 mt-8 ">
						<header className="mb-4">
							<h3 className="text-2xl">Next package offers</h3>
							<p className="text-gray-300">
								These packages will be installable after you rebuild the shop
								offers.
							</p>
						</header>
						<ul className="flex gap-4 overflow-x-auto snap-x snap-mandatory col-span-8 md:col-span-6">
							{nextOfferedConfigs.map((config) => (
								<li key={config.id} className="shrink-0 snap-start">
									<ActiveCard key={config.id} config={config} size="small" />
								</li>
							))}
						</ul>
					</section>
				)}
			</div>
		</section>
	);
};

export default ShopContainer;
