import {
	Config,
	describeConfig,
} from "~/modules/session-run/configs/config.model";
import { RARITY_COLORS } from "~/ui/rarityColors";
import { Tooltip } from "~/ui/Tooltip.component";
import { Paragraph } from "~/ui/typography/Paragraph.component";

type ConfigChipProps = {
	config: Config;
	/** Trailing label, e.g. "✕", "draft ＋", "→ L2 · 60KB". */
	action?: string;
	/** Interactive but currently unavailable (can't afford / no room). */
	disabled?: boolean;
	onClick?: () => void;
};

/** The one config token everywhere: rarity-styled, with a hover tooltip of its family + description. */
export const ConfigChip = ({
	config,
	action,
	disabled,
	onClick,
}: ConfigChipProps) => {
	const rarity = RARITY_COLORS[config.rarity ?? "common"];
	const level = config.level ?? 1;
	const style = `rounded-lg border-2 px-3 py-2 text-sm font-semibold ${rarity.border} ${rarity.bg} ${rarity.text}`;
	const body = (
		<>
			{config.label}
			{level > 1 ? <span className="ml-1 opacity-70">L{level}</span> : null}
			{action ? <span className="ml-2 opacity-70">{action}</span> : null}
		</>
	);
	const tip = (
		<>
			<span className="text-xs uppercase tracking-wide text-pewter">
				{config.family}
			</span>
			<Paragraph className="mt-1 text-sm">{describeConfig(config)}</Paragraph>
		</>
	);
	return (
		<Tooltip content={tip}>
			{onClick ? (
				<button
					type="button"
					onClick={onClick}
					disabled={disabled}
					className={`${style} cursor-pointer transition enabled:hover:brightness-125 disabled:cursor-not-allowed disabled:opacity-40`}
				>
					{body}
				</button>
			) : (
				<span className={style}>{body}</span>
			)}
		</Tooltip>
	);
};
