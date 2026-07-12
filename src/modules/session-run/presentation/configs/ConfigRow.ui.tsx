import type { Config } from "~/modules/session-run/configs/config.model";
import { Paragraph } from "~/ui/typography/Paragraph.component";
import { ConfigChip } from "./ConfigChip.ui";
import { RARITY_COLORS } from "~/ui/rarityColors";

type ConfigRowProps = {
	config: Config;
	action?: string;
	onClick?: () => void;
};

export const ConfigRow = ({ config, action, onClick }: ConfigRowProps) => {
	const rarity = RARITY_COLORS[config.rarity ?? "common"];

	return (
		<div className="flex flex-col items-center gap-3">
			<ConfigChip config={config} action={action} onClick={onClick} />
			<Paragraph className={`text-${rarity}`}>{config.description}</Paragraph>
		</div>
	);
};
