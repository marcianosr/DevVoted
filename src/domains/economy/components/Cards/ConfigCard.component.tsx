import { Config } from "~/domains/economy/models/config.model";
import { calculateRefund } from "~/domains/economy/services/configManager.service";
import { formatStorage } from "~/shared/lib/storage";
import { ConfigCard as ConfigCardUI } from "~/domains/economy/components/Cards/ConfigCard.ui";

type ConfigProps = {
	config: Config;
	disabled?: boolean;
	size?: "small" | "large";
};

const ConfigCard = ({ config, disabled, size = "large" }: ConfigProps) => (
	<ConfigCardUI
		name={config.name}
		rarity={config.rarity}
		size={size}
		disabled={disabled}
		costLabel={formatStorage(config.cost)}
		refundLabel={formatStorage(calculateRefund(config.cost))}
		description={config.description}
	/>
);

export default ConfigCard;
