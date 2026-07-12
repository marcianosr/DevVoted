import {
	Config,
	describeConfig,
} from "~/modules/session-run/configs/config.model";
import { RARITY_COLORS } from "~/ui/rarityColors";

type ConfigChipProps = {
	config: Config;
	/** Trailing label, e.g. "✕" or "draft ＋". Presence of onClick makes the chip interactive. */
	action?: string;
	onClick?: () => void;
};

/** A single config, styled entirely by its rarity: border + tint + text (RARITY_COLORS). */
export const ConfigChip = ({ config, action, onClick }: ConfigChipProps) => {
	const rarity = RARITY_COLORS[config.rarity ?? "common"];
	return (
		<button
			type="button"
			title={describeConfig(config)}
			onClick={onClick}
			disabled={!onClick}
			className={`rounded-lg border-2 px-3 py-2 text-sm font-semibold transition enabled:hover:brightness-125 ${rarity.border} ${rarity.bg} ${rarity.text}`}
		>
			{config.label}
			{(config.level ?? 1) > 1 ? (
				<span className="ml-1 opacity-70">L{config.level}</span>
			) : null}
			{action ? <span className="ml-2 opacity-70">{action}</span> : null}
		</button>
	);
};
