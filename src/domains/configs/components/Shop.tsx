import { useState } from "react";
import { Config } from "~/domains/configs/models/config";
import { configs } from "~/domains/configs/data/configs";
import { formatStorage } from "~/lib/storage";

type ShopProps = {
	onSubmit: (selectedConfigIds: string[]) => void;
	onCancel?: () => void;
	maxConfigs?: number;
};

export const Shop = ({ onSubmit, onCancel, maxConfigs = 3 }: ShopProps) => {
	const [selectedConfigIds, setSelectedConfigIds] = useState<string[]>([]);
	
	// Get 6 random configs for the shop
	const shopConfigs = getRandomConfigs(configs, 6);

	const toggleConfigSelection = (configId: string) => {
		setSelectedConfigIds(prev => {
			if (prev.includes(configId)) {
				return prev.filter(id => id !== configId);
			}
			
			if (prev.length < maxConfigs) {
				return [...prev, configId];
			}
			
			return prev;
		});
	};

	const handleSubmit = () => {
		onSubmit(selectedConfigIds);
	};

	return (
		<div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl mx-auto">
			<div className="mb-6">
				<h2 className="text-2xl font-bold text-gray-900 mb-2">Config Shop</h2>
				<p className="text-gray-600">
					Select up to {maxConfigs} configs to add to your storage deck
				</p>
				<p className="text-sm text-gray-500 mt-1">
					Selected: {selectedConfigIds.length}/{maxConfigs}
				</p>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
				{shopConfigs.map((config) => (
					<ConfigShopCard
						key={config.id}
						config={config}
						isSelected={selectedConfigIds.includes(config.id)}
						onToggle={() => toggleConfigSelection(config.id)}
						disabled={!selectedConfigIds.includes(config.id) && selectedConfigIds.length >= maxConfigs}
					/>
				))}
			</div>

			<div className="flex justify-end gap-3">
				{onCancel && (
					<button
						onClick={onCancel}
						className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
					>
						Cancel
					</button>
				)}
				<button
					onClick={handleSubmit}
					disabled={selectedConfigIds.length === 0}
					className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium"
				>
					Add to Storage ({selectedConfigIds.length})
				</button>
			</div>
		</div>
	);
};

type ConfigShopCardProps = {
	config: Config;
	isSelected: boolean;
	onToggle: () => void;
	disabled?: boolean;
};

const ConfigShopCard = ({ config, isSelected, onToggle, disabled }: ConfigShopCardProps) => {
	const rarityColors = {
		common: "border-gray-300 bg-gray-50",
		uncommon: "border-green-300 bg-green-50",
		rare: "border-blue-300 bg-blue-50",
		legendary: "border-purple-300 bg-purple-50",
	};

	const selectedStyle = isSelected 
		? "ring-2 ring-blue-500 border-blue-500 bg-blue-50" 
		: rarityColors[config.rarity];

	return (
		<div 
			className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${selectedStyle} ${
				disabled ? "opacity-50 cursor-not-allowed" : "hover:shadow-md"
			}`}
			onClick={disabled ? undefined : onToggle}
		>
			<div className="space-y-3">
				<div className="flex items-center gap-2">
					{config.image && (
						<img 
							src={config.image} 
							alt={config.name}
							className="w-6 h-6 object-contain"
						/>
					)}
					<h3 className="font-semibold text-gray-900">{config.name}</h3>
					<span className="text-xs px-2 py-1 rounded-full bg-white/60 capitalize font-medium">
						{config.rarity}
					</span>
				</div>
				
				<p className="text-sm text-gray-600 line-clamp-2">{config.description}</p>
				
				<div className="flex items-center justify-between text-xs text-gray-500">
					<span>Cost: {formatStorage(config.cost)}</span>
					{config.cooldown > 0 && <span>Cooldown: {config.cooldown}</span>}
				</div>

				{isSelected && (
					<div className="flex items-center gap-1 text-blue-600 text-sm font-medium">
						<span>✓</span>
						<span>Selected</span>
					</div>
				)}
			</div>
		</div>
	);
};

// Utility function to get random configs
function getRandomConfigs(allConfigs: Config[], count: number): Config[] {
	const shuffled = [...allConfigs].sort(() => 0.5 - Math.random());
	return shuffled.slice(0, count);
}