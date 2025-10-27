import { clsx } from "clsx";
import { Config } from "~/domains/configs/models/config";
import { formatStorage } from "~/lib/storage";
import { TextButton } from "~/ui/TextButton";

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
			glow: "",
		},
		uncommon: {
			badge: "bg-green-500 text-white",
			border: "border-green-400",
			glow: "",
		},
		rare: {
			badge: "bg-purple-500 text-white",
			border: "border-purple-400",
			glow: "shadow-purple-200",
		},
		legendary: {
			badge: "bg-gradient-to-r from-orange-500 to-red-500 text-white",
			border: "border-orange-400",
			glow: "shadow-orange-200",
		},
	};

	const rarity = rarityStyles[config.rarity];
	const selectedStyle = isSelected
		? "ring-2 ring-blue-500 border-blue-500 bg-blue-50"
		: `${rarity.border} bg-black`;

	const isDisabled = clsx(disabled && "opacity-50 cursor-not-allowed");

	return (
		<div
			className={`${isDisabled} bg-gray-900 border-3 p-4 cursor-pointer ${selectedStyle} ${`hover:shadow-lg ${rarity.glow}`}`}
			onClick={disabled ? undefined : onToggle}
			data-testid={config.id}
		>
			<div className="space-y-3">
				<div className="flex items-center gap-2">
					<h3 className={`text-white text-3xl`}>{config.name}</h3>
				</div>
				<span
					className={`text-sm px-2 py-1 capitalize ${rarity.badge}`}
				>
					{config.rarity}
				</span>

				{config.image && (
					<img
						src={config.image}
						alt={config.name}
						className="w-6 h-6 object-contain"
					/>
				)}

				<p className="text-sm text-white">{config.description}</p>

				<div className="flex items-center justify-between text-xs text-gray-300">
					<span>Cost: {formatStorage(config.cost)}</span>
				</div>

				{isSelected && (
					<div className="flex items-center gap-1 text-blue-600 text-sm font-medium">
						<span>✓</span>
						<span>Selected</span>
					</div>
				)}
				{onRemoveConfig && (
					<TextButton
						onClick={onRemoveConfig}
						className="ml-2"
						variant="danger"
						title="Remove config"
					>
						Remove from storage ✕
					</TextButton>
				)}
				{onAddConfig && (
					<TextButton
						onClick={onAddConfig}
						disabled={disabled}
						className="ml-2"
						variant="success"
						title={disabled ? "Cannot add config" : "Add config"}
					>
						Add to storage
					</TextButton>
				)}
			</div>
		</div>
	);
};
