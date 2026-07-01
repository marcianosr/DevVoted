import { clsx } from "clsx";

import ConfigCard from "~/domains/economy/components/Cards/ConfigCard.component";
import { Config } from "~/domains/economy/models/config.model";
import { calculateRefund } from "~/domains/economy/services/configManager.service";
import { formatStorage } from "~/lib/storage";
import { RARITY_COLORS } from "~/ui/rarityColors";

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
				<button
					onClick={() => !disabled && onDeinstall(config)}
					disabled={disabled}
					className={clsx(
						`border ${RARITY_COLORS[config.rarity].border} ${RARITY_COLORS[config.rarity].text} p-2 cursor-pointer w-full`,
						disabledStyles
					)}
				>
					Deinstall (+{formatStorage(calculateRefund(config.cost))})
				</button>
			)}
		</div>
	);
};
export default ActiveCard;
