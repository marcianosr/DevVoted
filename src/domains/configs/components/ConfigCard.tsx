import { Config } from "~/domains/configs/models/config";
import { formatStorage } from "~/lib/storage";

type ConfigCardProps = {
	config: Config;
	isSelected?: boolean;
	onToggle?: () => void;
	onRemove?: () => void;
	disabled?: boolean;
};

export const ConfigCard = ({
	config,
	isSelected,
	onRemove,
	onToggle,
	disabled,
}: ConfigCardProps) => {
	const rarityColors = {
		common: "bg-blue-500 text-white",
		uncommon: "bg-green-500 text-white",
		rare: "bg-yellow-500 text-white",
		legendary: "bg-red-800 text-white",
	};

	const selectedStyle = isSelected
		? "ring-2 ring-blue-500 border-blue-500 bg-blue-50"
		: "border-gray-900 bg-gray-50";

	return (
		<div
			className={`border-2 p-4 cursor-pointer  ${selectedStyle} ${
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
					<span
						className={`text-xs px-2 py-1 capitalize font-medium rounded-full ${rarityColors[config.rarity]}`}
					>
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
