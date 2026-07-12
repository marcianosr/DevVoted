import type { Config } from "~/modules/session-run/configs/config";
import { RARITY_COLORS } from "~/ui/rarityColors";
import { categoryTheme } from "~/ui/theme/categoryTheme";

type ConfigChipProps = {
	config: Config;
	/** Trailing label, e.g. "✕" or "draft ＋". Presence of onClick makes the chip interactive. */
	action?: string;
	onClick?: () => void;
};

/** A single config: rarity border + tint (RARITY_COLORS), category-colored label for Focus configs. */
export const ConfigChip = ({ config, action, onClick }: ConfigChipProps) => {
	const rarity = RARITY_COLORS[config.rarity ?? "common"];
	const themed = config.focusCategory
		? categoryTheme(config.focusCategory)
		: {};
	return (
		<button
			type="button"
			title={config.description}
			onClick={onClick}
			disabled={!onClick}
			{...themed}
			className={`rounded-lg border-2 px-3 py-2 text-sm font-semibold transition enabled:hover:brightness-125 ${rarity.border} ${rarity.bg}`}
		>
			<span className={config.focusCategory ? "text-theme" : "text-white"}>
				{config.label}
			</span>
			{(config.level ?? 1) > 1 ? (
				<span className="ml-1 text-pewter">L{config.level}</span>
			) : null}
			{action ? <span className="ml-2 text-pewter">{action}</span> : null}
		</button>
	);
};
