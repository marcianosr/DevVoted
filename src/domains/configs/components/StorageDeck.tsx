import { Run } from "~/domains/runs/models/run";
import { Config } from "~/domains/configs/models/config";
import { getStorageInfo } from "~/domains/configs/services/configStorage.service";
import { formatStorage } from "~/lib/storage";

type StorageDeckProps = {
	run: Run;
	onAddConfig?: (configId: string) => void;
	onRemoveConfig?: (configId: string) => void;
};

export const StorageDeck = ({ run, onAddConfig, onRemoveConfig }: StorageDeckProps) => {
	const { activeConfigs, storageUsed, storageAvailable, storageLimit, usagePercentage } = getStorageInfo(run);

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

			<div className="grid gap-3">
				{activeConfigs.length === 0 ? (
					<div className="text-center text-gray-500 py-8">
						<p>No configs installed</p>
						<p className="text-sm">Your storage deck is empty</p>
					</div>
				) : (
					activeConfigs.map((config) => (
						<ConfigCard 
							key={config.id}
							config={config}
							onRemove={onRemoveConfig ? () => onRemoveConfig(config.id) : undefined}
						/>
					))
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

type ConfigCardProps = {
	config: Config;
	onRemove?: () => void;
};

const ConfigCard = ({ config, onRemove }: ConfigCardProps) => {
	const rarityColors = {
		common: "border-gray-300 bg-gray-50",
		uncommon: "border-green-300 bg-green-50",
		rare: "border-blue-300 bg-blue-50",
		legendary: "border-purple-300 bg-purple-50",
	};

	return (
		<div className={`border-2 rounded-lg p-4 ${rarityColors[config.rarity]}`}>
			<div className="flex items-start justify-between">
				<div className="flex-1">
					<div className="flex items-center gap-2 mb-2">
						{config.image && (
							<img 
								src={config.image} 
								alt={config.name}
								className="w-6 h-6 object-contain"
							/>
						)}
						<h4 className="font-semibold">{config.name}</h4>
						<span className="text-xs px-2 py-1 rounded-full bg-white/60 capitalize">
							{config.rarity}
						</span>
					</div>
					<p className="text-sm text-gray-600 mb-2">{config.description}</p>
					<div className="flex items-center gap-4 text-xs text-gray-500">
						<span>Cost: {formatStorage(config.cost)}</span>
						{config.cooldown > 0 && <span>Cooldown: {config.cooldown} polls</span>}
					</div>
				</div>
				{onRemove && (
					<button
						onClick={onRemove}
						className="ml-2 text-red-500 hover:text-red-700 text-sm"
						title="Remove config"
					>
						✕
					</button>
				)}
			</div>
		</div>
	);
};