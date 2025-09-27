import { Config } from "~/domains/configs/models/config";
import { formatStorage } from "~/lib/storage";

type ConfigCardProps = {
	config: Config;
	isSelected?: boolean;
	onToggle?: () => void;
	onRemoveConfig?: () => void;
	onAddConfig?: () => void;
	disabled?: boolean;
};

export const ConfigCard = ({
	config,
	isSelected,
	onRemoveConfig,
	onAddConfig,
	onToggle,
	disabled,
}: ConfigCardProps) => {
	const rarityStyles = {
		common: {
			badge: "bg-gray-500 text-white",
			border: "border-gray-400",
			glow: ""
		},
		uncommon: {
			badge: "bg-green-500 text-white",
			border: "border-green-400",
			glow: ""
		},
		rare: {
			badge: "bg-purple-500 text-white",
			border: "border-purple-400",
			glow: "shadow-purple-200"
		},
		legendary: {
			badge: "bg-gradient-to-r from-orange-500 to-red-500 text-white",
			border: "border-orange-400",
			glow: "shadow-orange-200"
		},
	};

	const rarity = rarityStyles[config.rarity];
	const selectedStyle = isSelected
		? "ring-2 ring-blue-500 border-blue-500 bg-blue-50"
		: `${rarity.border} bg-gray-50`;

	return (
		<div
			className={`border-2 p-4 cursor-pointer transition-all ${selectedStyle} ${
				disabled ? "opacity-50 cursor-not-allowed" : `hover:shadow-lg ${rarity.glow}`
			}`}
			onClick={disabled ? undefined : onToggle}
			data-testid={config.id}
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
						className={`text-xs px-2 py-1 capitalize font-medium rounded-full ${rarity.badge}`}
					>
						{config.rarity}
					</span>
				</div>

				<p className="text-sm text-gray-600 line-clamp-2">
					{config.description}
				</p>

				<div className="flex items-center justify-between text-xs text-gray-500">
					<span>Cost: {formatStorage(config.cost)}</span>
				</div>

				{config.level ? <div>{config.level}</div> : null}

				{isSelected && (
					<div className="flex items-center gap-1 text-blue-600 text-sm font-medium">
						<span>✓</span>
						<span>Selected</span>
					</div>
				)}
				{onRemoveConfig && (
					<button
						onClick={onRemoveConfig}
						className="ml-2 text-red-500 hover:text-red-700 text-sm"
						title="Remove config"
					>
						Remove from storage ✕
					</button>
				)}
				{onAddConfig && (
					<button
						onClick={onAddConfig}
						className="ml-2 text-green-500 hover:text-green-700 text-sm"
						title="Add config"
					>
						Add to storage
					</button>
				)}
			</div>
		</div>
	);
};
