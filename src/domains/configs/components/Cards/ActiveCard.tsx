import { clsx } from "clsx";

import ConfigCard, { RARITY_COLORS } from "~/domains/configs/components/Cards";
import { Config } from "~/domains/configs/models/config";
import { calculateRefund, formatStorage } from "~/lib/storage";

type ActiveCardProps = {
	config: Config;
	disabled?: boolean;
	onDeinstall?: (config: Config) => void;
	size?: "small" | "large";
};

const ActiveCard = ({
	config,
	disabled,
	onDeinstall,
	size = "large",
}: ActiveCardProps) => {
	const disabledStyles = clsx(disabled && "opacity-50 cursor-not-allowed");
	const largeStyles = clsx(
		"hover:scale-105 transition-transform cursor-pointer"
	);
	return (
		<div
			className={clsx("flex flex-col gap-2", size === "large" && largeStyles)}
		>
			<ConfigCard config={config} disabled={disabled} size={size} />
			{onDeinstall && (
				<div className="flex flex-col items-center">
					<button
						onClick={() => !disabled && onDeinstall(config)}
						disabled={disabled}
						className={clsx(
							`border ${RARITY_COLORS[config.rarity].border} ${RARITY_COLORS[config.rarity].text} p-2 cursor-pointer w-full`,
							disabledStyles
						)}
					>
						Deinstall
					</button>
					<span className="text-celadon text-sm mt-1">
						+{formatStorage(calculateRefund(config.cost))}
					</span>
				</div>
			)}
		</div>
	);
};
export default ActiveCard;
