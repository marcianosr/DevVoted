import type { ReactNode } from "react";
import {
	Config,
	describeConfig,
} from "~/modules/session-run/configs/config.model";
import { Badge } from "~/ui/Badge.component";
import { RARITY_COLORS } from "~/ui/rarityColors";
import { Tooltip } from "~/ui/Tooltip.component";
import { Paragraph } from "~/ui/typography/Paragraph.component";

type ConfigChipProps = {
	config: Config;
	action?: ReactNode;
	subline?: ReactNode;
	price?: number;
	/** A corner badge (e.g. "new"). Overrides `price`, which renders a price badge for you. */
	badge?: ReactNode;
	/** Overrides the default hover tooltip (the config's effect) with custom content. */
	tooltip?: ReactNode;
	/** Suppress the hover tooltip — e.g. inside an `overflow-hidden` list that would clip it. */
	noTooltip?: boolean;
	disabled?: boolean;
	onClick?: () => void;
};

/** The label line: config name, level marker, and an optional trailing action glyph. */
const ChipLabel = ({
	config,
	action,
}: Pick<ConfigChipProps, "config" | "action">) => {
	const level = config.level ?? 1;
	return (
		<>
			{config.label}
			{level > 1 ? <span className="ml-1 opacity-70">L{level}</span> : null}
			{action ? <span className="ml-2 opacity-70">{action}</span> : null}
		</>
	);
};

/** The chip's inner content: the label, with an optional subline stacked beneath it. */
const ChipBody = ({
	config,
	action,
	subline,
}: Pick<ConfigChipProps, "config" | "action" | "subline">) =>
	subline ? (
		<span className="flex flex-col items-start gap-0.5">
			<span>
				<ChipLabel config={config} action={action} />
			</span>
			<span className="text-xs opacity-80">{subline}</span>
		</span>
	) : (
		<ChipLabel config={config} action={action} />
	);

/** The rarity-styled surface: a button when interactive, otherwise a static span. */
const ChipSurface = ({
	config,
	disabled,
	onClick,
	children,
}: Pick<ConfigChipProps, "config" | "disabled" | "onClick"> & {
	children: ReactNode;
}) => {
	const rarity = RARITY_COLORS[config.rarity ?? "common"];
	const style = `rounded-lg border-2 px-3 py-2 text-sm font-semibold ${rarity.border} ${rarity.bg} ${rarity.text}`;
	return onClick ? (
		<button
			type="button"
			onClick={onClick}
			disabled={disabled}
			className={`${style} cursor-pointer transition enabled:hover:brightness-125 disabled:cursor-not-allowed disabled:opacity-40`}
		>
			{children}
		</button>
	) : (
		<span className={style}>{children}</span>
	);
};

/** A config as a rarity-styled chip: hover for its effect, with an optional corner badge and action. */
export const ConfigChip = ({
	config,
	action,
	subline,
	price,
	badge,
	tooltip,
	noTooltip,
	disabled,
	onClick,
}: ConfigChipProps) => {
	const corner =
		badge ??
		(config.fixed ? <Badge>fixed</Badge> : null) ??
		(price !== undefined ? <Badge tone="price">{price}KB</Badge> : null);
	const surface = (
		<ChipSurface config={config} disabled={disabled} onClick={onClick}>
			<ChipBody config={config} action={action} subline={subline} />
		</ChipSurface>
	);
	const chip = corner ? (
		<span className="relative inline-flex">
			{corner}
			{surface}
		</span>
	) : (
		surface
	);
	if (noTooltip) return chip;
	return (
		<Tooltip
			content={
				<Paragraph className="mt-1 text-sm">
					{tooltip ?? describeConfig(config)}
				</Paragraph>
			}
		>
			{chip}
		</Tooltip>
	);
};
