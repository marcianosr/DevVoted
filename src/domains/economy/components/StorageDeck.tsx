import { getStorageInfo } from "~/domains/economy/services/configManager.service";
import { Run } from "~/domains/runs/models/run";
import { formatStorage } from "~/lib/storage";

import { ConfigCard } from "../../configs/components/ConfigCard";
import { useConfigCardActions } from "../../configs/hooks/useConfigCardActions";

type StorageDeckProps = {
	run: Run;
};

export const StorageDeck = ({ run }: StorageDeckProps) => {
	const {
		activeConfigs,
		rerollsStorage,
		storageUsed,
		storageAvailable,
		storageLimit,
	} = getStorageInfo(run);

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<h3 className="text-4xl">Config deck</h3>
				<div className="text-sm text-gray-400">
					<span>Used: </span>
					{formatStorage(storageUsed)} / {formatStorage(storageLimit)}
					{storageAvailable > 0 && (
						<div className="text-green-600">
							{formatStorage(storageAvailable)} available
						</div>
					)}
				</div>
			</div>
			<meter value={storageUsed} max={storageLimit} className="w-full h-8" />
			<div className="grid grid-cols-3 gap-3">
				{activeConfigs.length === 0 ? (
					<div className="text-center text-gray-400 py-8 col-span-4 self-center">
						<p className="text-2xl">No configs installed</p>
						<small className="text-sm">
							Your installed configs from the shop will appear here
						</small>
					</div>
				) : (
					activeConfigs.map((config) => {
						// eslint-disable-next-line react-hooks/rules-of-hooks -- TODO: Fix hook usage in callback
						const actions = useConfigCardActions({
							run,
							config,
							mode: "storage",
						});

						return <ConfigCard key={config.id} config={config} {...actions} />;
					})
				)}
			</div>

			<div className="text-sm space-y-1">
				<div className="flex justify-between text-gray-500">
					{rerollsStorage > 0 && (
						<span>Rerolls: {formatStorage(rerollsStorage)}</span>
					)}
				</div>
			</div>
		</div>
	);
};
