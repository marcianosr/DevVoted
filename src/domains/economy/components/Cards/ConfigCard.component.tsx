import { Config } from "~/domains/economy/models/config.model";
import { calculateRefund } from "~/domains/economy/services/configManager.service";
import { formatStorage } from "~/lib/storage";
import { ConfigCard as ConfigCardUI } from "~/ui/economy/ConfigCard.ui";

type ConfigProps = {
	config: Config;
	disabled?: boolean;
	size?: "small" | "large";
	showDetails?: boolean;
};

const ConfigCard = ({
	config,
	disabled,
	size = "large",
	showDetails,
}: ConfigProps) => (
	<ConfigCardUI
		name={config.name}
		rarity={config.rarity}
		size={size}
		disabled={disabled}
		costLabel={formatStorage(config.cost)}
		refundLabel={formatStorage(calculateRefund(config.cost))}
		description={config.description}
		showDetails={showDetails}
	/>
);

export default ConfigCard;
