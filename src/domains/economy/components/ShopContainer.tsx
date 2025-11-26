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
};

const ShopContainer = ({ activeRun, offeredConfigs }: ShopContainerProps) => {
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
			<h2 id="shop-heading" className="text-3xl">
				Shop (Package Manager)
			</h2>
			<p>Improve your run by installing packages!</p>
			<div className="flex gap-4">
				<div className="flex flex-col gap-2">
					<PrimaryButton size="small" onClick={onReroll} disabled={!canReroll}>
						Rebuild ({formatStorage(rerollCost)})
					</PrimaryButton>
					<PrimaryButton size="small">
						Skip shop (Gain 30KB storage)
					</PrimaryButton>
				</div>
				<ul className="flex gap-4">
					{offeredConfigs.map((config) => (
						<li key={config.id}>
							<ShopCard
								config={config}
								disabled={false}
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
