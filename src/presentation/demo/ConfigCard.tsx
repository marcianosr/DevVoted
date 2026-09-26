import { formatStorage } from "~/shared/lib/storage";

import { ConfigCard as ConfigCardUI } from "./ConfigCard.ui";
import type { DemoConfig } from "./types";

const REFUND_RATE = 0.5;

type ConfigCardProps = {
	config: DemoConfig;
	disabled?: boolean;
	size?: "small" | "large";
};

export const ConfigCard = ({
	config,
	disabled,
	size = "large",
}: ConfigCardProps) => (
	<ConfigCardUI
		name={config.name}
		rarity={config.rarity}
		size={size}
		disabled={disabled}
		costLabel={formatStorage(config.cost)}
		refundLabel={formatStorage(Math.round(config.cost * REFUND_RATE))}
		description={config.description}
	/>
);
