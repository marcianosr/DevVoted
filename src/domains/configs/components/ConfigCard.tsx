import { Config } from "~/domains/configs/models/config";
import { formatStorage, STORAGE_UNITS } from "~/lib/storage";

type ConfigCardProps = {
	config: Config;
	isSelected: boolean;
	onToggle: () => void;
	disabled?: boolean;
};

export const ConfigCard = ({
	config,
	isSelected,
	onToggle,
	disabled,
}: ConfigCardProps) => {
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
					<h3 className="font-semibold text-gray-900">
						{config.name}
					</h3>
					<span className="text-xs px-2 py-1 rounded-full bg-white/60 capitalize font-medium">
						{config.rarity}
					</span>
				</div>

				<p className="text-sm text-gray-600 line-clamp-2">
					{config.description}
				</p>

				<div className="flex items-center justify-between text-xs text-gray-500">
					<span>Cost: {formatStorage(config.cost)}</span>
					{config.cooldown > 0 && (
						<span>Cooldown: {config.cooldown}</span>
					)}
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
