import type { Rarity } from "~/modules/session-run/configs/config.model";
import { RARITY_COLORS } from "~/ui/rarityColors";
import { Subtitle } from "~/ui/typography/Subtitle.component";

const RARITIES: readonly Rarity[] = ["common", "uncommon", "rare", "legendary"];

/** Teaches the rarity language: each tier's border + tint (RARITY_COLORS). */
export const RarityLegend = () => (
	<div className="flex flex-wrap items-center gap-3">
		<Subtitle>Rarity =</Subtitle>
		{RARITIES.map((rarity) => {
			const colors = RARITY_COLORS[rarity];
			return (
				<span
					key={rarity}
					className={`rounded border-2 px-2 py-1 text-xs ${colors.border} ${colors.bg} ${colors.text}`}
				>
					{rarity}
				</span>
			);
		})}
	</div>
);
