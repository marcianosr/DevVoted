import {
	spotsOf,
	RARITY_ODDS,
	rarityOf,
	type Rarity,
} from "~/modules/run/config/domain/config.model";
import { CONFIGS } from "~/modules/run/config/domain/configRoster.model";
import { ConfigChip } from "~/modules/run/config/presentation/ConfigChip.ui";
import { RarityGlyph } from "~/ui/modern-theme/RarityGlyph.ui";
import { Stack } from "~/ui/Stack.ui";
import { Paragraph } from "~/ui/typography/Paragraph.component";

const RARITY_ORDER: Rarity[] = ["byte", "nibble", "crumb", "bit"];

const HEADER = "flex items-center gap-3";
const NAME = "text-xs font-bold uppercase tracking-wide text-zinc-200";
const FIGURES = "flex items-center gap-3 text-xs text-zinc-500";
const COUNT = "ml-auto text-xs tabular-nums text-zinc-500";

export const ConfigdexPanel = () => {
	const configs = Object.values(CONFIGS);
	const total = configs.length;

	return (
		<Stack gap="6">
			<Paragraph tone="muted">
				{total}/{total} collected
			</Paragraph>
			{RARITY_ORDER.map((rarity) => {
				const group = configs.filter((config) => rarityOf(config) === rarity);
				const [first] = group;
				if (!first) return null;

				return (
					<div key={rarity} className="flex flex-col gap-3">
						<header className={HEADER}>
							<RarityGlyph rarity={rarity} size="header" />
							<p className={NAME}>{rarity}</p>
							<span className={FIGURES}>
								<span>{RARITY_ODDS[rarity]}</span>
								<span>
									{spotsOf(first)} spot{spotsOf(first) > 1 ? "s" : ""}
								</span>
							</span>
							<p className={COUNT}>
								{group.length}/{group.length}
							</p>
						</header>
						<div className="flex flex-wrap gap-2">
							{group.map((config) => (
								<ConfigChip key={config.id} config={config} />
							))}
						</div>
					</div>
				);
			})}
		</Stack>
	);
};
