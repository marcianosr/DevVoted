import { cva } from "class-variance-authority";
import type { ReactNode } from "react";
import { Config, describeConfig } from "~/modules/run/configs/config.model";
import { Badge } from "~/ui/Badge.component";
import { RARITY_COLORS, type Rarity } from "~/ui/rarityColors";
import { Tooltip } from "~/ui/Tooltip.component";
import { Paragraph } from "~/ui/typography/Paragraph.component";

const RARITY_KEYS = Object.keys(RARITY_COLORS) as Rarity[];

const rarityVariant = (
	pick: (colors: (typeof RARITY_COLORS)[Rarity]) => string
): Record<Rarity, string> =>
	Object.fromEntries(
		RARITY_KEYS.map((rarity) => [rarity, pick(RARITY_COLORS[rarity])])
	) as Record<Rarity, string>;

// Labels read white on every chip — rarity speaks through the border + tint.
const chipSurface = cva(
	"inline-flex shrink-0 items-center rounded-sm align-middle border-1 p-1 text-xs text-zinc-100",
	{
		variants: {
			rarity: rarityVariant((colors) => colors.border),
		},
		compoundVariants: RARITY_KEYS.map((rarity) => ({
			rarity,
			class: RARITY_COLORS[rarity].bg,
		})),
	}
);

const tooltipSurface = cva("bg-zinc-900", {
	variants: {
		rarity: rarityVariant((colors) => colors.border),
	},
});

const rarityLabel = cva("text-xs font-bold uppercase tracking-wide", {
	variants: {
		rarity: rarityVariant((colors) => colors.text),
	},
});

type ConfigChipProps = {
	config: Config;
	action?: ReactNode;
	subline?: ReactNode;
	price?: number;
	badge?: ReactNode;
	tooltip?: ReactNode;
	noTooltip?: boolean;
	compact?: boolean;
	disabled?: boolean;
	// Render the label bold (Configdex uses this; loadout leaves it normal).
	boldLabel?: boolean;
	onClick?: () => void;
};

const ChipLabel = ({
	config,
	action,
	boldLabel,
}: Pick<ConfigChipProps, "config" | "action" | "boldLabel">) => (
	<>
		{boldLabel ? (
			<span className="font-bold">{config.label}</span>
		) : (
			config.label
		)}
		{action ? <span className="ml-2 opacity-70">{action}</span> : null}
	</>
);

const ChipBody = ({
	config,
	action,
	subline,
	boldLabel,
}: Pick<ConfigChipProps, "config" | "action" | "subline" | "boldLabel">) =>
	subline ? (
		<span className="flex flex-col items-start gap-0.5">
			<span>
				<ChipLabel config={config} action={action} boldLabel={boldLabel} />
			</span>
			<span className="text-xs opacity-80">{subline}</span>
		</span>
	) : (
		<ChipLabel config={config} action={action} boldLabel={boldLabel} />
	);

const ChipSurface = ({
	config,
	disabled,
	onClick,
	children,
}: Pick<ConfigChipProps, "config" | "disabled" | "onClick"> & {
	children: ReactNode;
}) => {
	const style = chipSurface({
		rarity: config.rarity ?? "common",
	});

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

export const ConfigChip = ({
	config,
	action,
	subline,
	price,
	badge,
	tooltip,
	noTooltip,
	boldLabel,
	disabled,
	onClick,
}: ConfigChipProps) => {
	const level = config.level ?? 1;
	const corners = [
		badge ? <span key="badge">{badge}</span> : null,
		level > 1 ? <Badge key="level">L{level}</Badge> : null,
		price !== undefined ? (
			<Badge key="price" tone="price">{`${price}KB`}</Badge>
		) : null,
	].filter(Boolean);
	const surface = (
		<ChipSurface config={config} disabled={disabled} onClick={onClick}>
			<ChipBody
				config={config}
				action={action}
				subline={subline}
				boldLabel={boldLabel}
			/>
		</ChipSurface>
	);
	const chip =
		corners.length > 0 ? (
			<span className="relative inline-flex">
				<span className="absolute -right-2 -top-3 z-10 flex gap-1">
					{corners}
				</span>
				{surface}
			</span>
		) : (
			surface
		);
	if (noTooltip) return chip;
	const rarity = config.rarity ?? "common";
	return (
		<Tooltip
			surfaceClassName={tooltipSurface({ rarity })}
			content={
				<div className="flex flex-col gap-1">
					<span className={rarityLabel({ rarity })}>{rarity}</span>
					<Paragraph className="text-sm">
						{tooltip ?? describeConfig(config)}
					</Paragraph>
				</div>
			}
		>
			{chip}
		</Tooltip>
	);
};
