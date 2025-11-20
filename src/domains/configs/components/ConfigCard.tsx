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
			badge: "bg-zinc-400/80 text-white",
			border: "border-zinc-400/80",
			glow: "",
		},
		uncommon: {
			badge: "bg-emerald-500 text-white",
			border: "border-emerald-500",
			glow: "",
		},
		rare: {
			badge: "bg-purple-500 text-white",
			border: "border-purple-400",
			glow: "shadow-purple-800",
		},
		legendary: {
			badge: "bg-rose-500 text-white",
			border: "border-rose-400",
			glow: "shadow-rose-200",
		},
	};

	const rarity = rarityStyles[config.rarity];
	const selectedStyle = isSelected
		? "ring-2 ring-blue-500 border-blue-500 bg-blue-50"
		: `${rarity.border} bg-black`;

	const isDisabled = clsx(disabled && "opacity-50 cursor-not-allowed");

	return (
		<div
			className={`${isDisabled} bg-zinc-900 border-3 p-4 ${selectedStyle} shadow-xl ${rarity.glow}`}
			onClick={disabled ? undefined : onToggle}
			data-testid={config.id}
		>
			<div className="space-y-2">
				<div
					className={`py-2 border-b-2 ${rarity.border} flex justify-between`}
				>
					<h3 className={`text-white text-xl py-2`}>{config.name}</h3>
					<span
						className={`text-sm px-2 py-1 capitalize self-start ${rarity.badge}`}
					>
						{config.rarity}
					</span>
				</div>
				{/*
				{config.image && (
					<img
						src={config.image}
						alt={config.name}
						className="w-6 h-6 object-contain"
					/>
				)} */}

				<p className="text-sm text-white py-2">{config.description}</p>

				<div className="flex items-center justify-between text-xs text-gray-300">
					<span>💾 Cost: {formatStorage(config.cost)}</span>
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
						variant="danger"
						title="Remove config"
					>
						Uninstall ✕
					</TextButton>
				)}
				{onAddConfig && (
					<TextButton
						onClick={onAddConfig}
						disabled={disabled}
						variant="success"
						title={disabled ? "Cannot add config" : "Add config"}
					>
						Install ✓
					</TextButton>
				)}
			</div>
		</div>
	);
};
