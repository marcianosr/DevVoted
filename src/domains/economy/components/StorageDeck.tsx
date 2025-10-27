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
		configsStorage,
		rerollsStorage,
		storageUsed,
		storageAvailable,
		storageLimit,
	} = getStorageInfo(run);

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<h3 className="text-lg font-semibold">Config deck</h3>
				<div className="text-sm text-gray-600">
					{formatStorage(storageUsed)} / {formatStorage(storageLimit)}
					{storageAvailable > 0 && (
						<div className="text-green-600 font-medium">
							{formatStorage(storageAvailable)} available
						</div>
					)}
				</div>
			</div>
			<meter
				value={storageUsed}
				max={storageLimit}
				className="w-full h-8"
			/>
			<div className="grid grid-cols-4 gap-3">
				{activeConfigs.length === 0 ? (
					<div className="text-center text-gray-500 py-8">
						<p>No configs installed</p>
						<p className="text-sm">Your config deck is empty</p>
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

			<div className="text-sm space-y-1">
				<div className="flex justify-between text-gray-500">
					<span>Configs: {formatStorage(configsStorage)}</span>
					{rerollsStorage > 0 && (
						<span>Rerolls: {formatStorage(rerollsStorage)}</span>
					)}
				</div>
			</div>
		</div>
	);
};
