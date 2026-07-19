import { cva } from "class-variance-authority";
import { clsx } from "clsx";
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

// Compact chips (pipeline rows) are ghost outlines: thin border, no fill.
// inline-flex + shrink-0: a squeezed row wraps its description text, never
// the chip's own dot/label.
const chipSurface = cva(
	"inline-flex shrink-0 items-center rounded-lg align-middle text-sm font-semibold",
	{
		variants: {
			rarity: rarityVariant((colors) => clsx(colors.border, colors.text)),
			compact: {
				true: "border px-2.5 py-1",
				false: "border-2 px-3 py-2",
			},
		},
		compoundVariants: RARITY_KEYS.map((rarity) => ({
			rarity,
			compact: false as const,
			class: RARITY_COLORS[rarity].bg,
		})),
		defaultVariants: { compact: false },
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
	/** Pipeline rows show "fixed" inline next to the chip instead. */
	noFixedBadge?: boolean;
	/** Ghost outline for inline row contexts: thin border, no fill, tight padding. */
	compact?: boolean;
	disabled?: boolean;
	onClick?: () => void;
};

const ChipLabel = ({
	config,
	action,
}: Pick<ConfigChipProps, "config" | "action">) => (
	<>
		{config.label}
		{action ? <span className="ml-2 opacity-70">{action}</span> : null}
	</>
);

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

const ChipSurface = ({
	config,
	disabled,
	onClick,
	compact,
	children,
}: Pick<ConfigChipProps, "config" | "disabled" | "onClick" | "compact"> & {
	children: ReactNode;
}) => {
	const style = chipSurface({
		rarity: config.rarity ?? "common",
		compact: compact ?? false,
	});
	const dot = compact ? (
		<span
			className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-current"
			aria-hidden
		/>
	) : null;
	return onClick ? (
		<button
			type="button"
			onClick={onClick}
			disabled={disabled}
			className={`${style} cursor-pointer transition enabled:hover:brightness-125 disabled:cursor-not-allowed disabled:opacity-40`}
		>
			{dot}
			{children}
		</button>
	) : (
		<span className={style}>
			{dot}
			{children}
		</span>
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
	noFixedBadge,
	compact,
	disabled,
	onClick,
}: ConfigChipProps) => {
	const level = config.level ?? 1;
	const corners = [
		badge ? <span key="badge">{badge}</span> : null,
		level > 1 ? <Badge key="level">L{level}</Badge> : null,
		config.fixed && !noFixedBadge ? <Badge key="fixed">fixed</Badge> : null,
		price !== undefined ? (
			<Badge key="price" tone="price">{`${price}KB`}</Badge>
		) : null,
	].filter(Boolean);
	const surface = (
		<ChipSurface
			config={config}
			disabled={disabled}
			onClick={onClick}
			compact={compact}
		>
			<ChipBody config={config} action={action} subline={subline} />
		</ChipSurface>
	);
	const chip =
		corners.length > 0 ? (
			<span className="relative inline-flex">
				<span className="absolute -right-1 -top-2 z-10 flex gap-1">
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
