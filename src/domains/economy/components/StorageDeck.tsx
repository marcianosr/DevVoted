import { Run } from "~/domains/runs/models/run";

import { getStorageInfo } from "~/domains/economy/services/configManager.service";
import { formatStorage } from "~/lib/storage";
import { ConfigCard } from "../../configs/components/ConfigCard";
import { useConfigCardActions } from "../../configs/hooks/useConfigCardActions";

type StorageDeckProps = {
	run: Run;
};

export const StorageDeck = ({ run }: StorageDeckProps) => {
	const {
		activeConfigs,
		storageUsed,
		storageAvailable,
		storageLimit,
		usagePercentage,
	} = getStorageInfo(run);

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<h3 className="text-lg font-semibold">Storage Deck</h3>
				<div className="text-sm text-gray-600">
					{formatStorage(storageUsed)} / {formatStorage(storageLimit)}
				</div>
			</div>

			<div className="w-full bg-gray-200 rounded-full h-3">
				<div
					className="bg-blue-600 h-3 rounded-full transition-all duration-300"
					style={{ width: `${Math.min(usagePercentage, 100)}%` }}
				/>
			</div>

			<div className="grid grid-cols-[1fr,1fr,1fr,1fr,1fr] gap-3">
				{activeConfigs.length === 0 ? (
					<div className="text-center text-gray-500 py-8">
						<p>No configs installed</p>
						<p className="text-sm">Your storage deck is empty</p>
					</div>
				) : (
					activeConfigs.map((config) => {
						const actions = useConfigCardActions({
							run,
							config,
							mode: "storage",
						});

						return (
							<ConfigCard
								key={config.id}
								config={config}
								{...actions}
							/>
						);
					})
				)}
			</div>

			{storageAvailable > 0 && (
				<div className="text-sm text-green-600 font-medium">
					{formatStorage(storageAvailable)} available for new configs
				</div>
			)}
		</div>
	);
};
