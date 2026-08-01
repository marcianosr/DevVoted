import { clsx } from "clsx";

import { describeConfig, rarityOf } from "~/modules/run/configs/config.model";
import { CONFIGS } from "~/modules/run/configs/configRoster.model";
import { ConfigChip } from "~/modules/run/presentation/configs/ConfigChip.ui";
import { RARITY_COLORS, type Rarity } from "~/ui/rarityColors";
import { Stack } from "~/ui/Stack.ui";
import { Paragraph } from "~/ui/typography/Paragraph.component";

// Rarest first, matching the loadout draft's ordering.
const RARITY_ORDER: Rarity[] = ["legendary", "rare", "uncommon", "common"];

export const ConfigdexPanel = () => {
	const configs = Object.values(CONFIGS);
	// No unlock system yet — every config counts as owned, so owned == total.
	const total = configs.length;

	return (
		<Stack gap="6">
			<Paragraph tone="muted">
				{total}/{total} collected
			</Paragraph>
			{RARITY_ORDER.map((rarity) => {
				const group = configs.filter((config) => rarityOf(config) === rarity);
				if (group.length === 0) return null;

				return (
					<div key={rarity} className="flex flex-col gap-3">
						<p
							className={clsx(
								"text-xs font-bold uppercase tracking-wide",
								RARITY_COLORS[rarity].text
							)}
						>
							{rarity} · {group.length}/{group.length}
						</p>
						<div className="flex flex-wrap gap-3">
							{group.map((config) => (
								<ConfigChip
									key={config.id}
									config={config}
									subline={
										<span className="block w-52 whitespace-normal">
											{describeConfig(config)}
										</span>
									}
									noTooltip
									boldLabel
								/>
							))}
						</div>
					</div>
				);
			})}
		</Stack>
	);
};
