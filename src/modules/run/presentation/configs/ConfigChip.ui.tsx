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
	price?: number;
	badge?: ReactNode;
	tooltip?: ReactNode;
	/** The tooltip panel carries its own buttons, so the pointer must reach it. */
	interactiveTooltip?: boolean;
	/**
	 * Compact hover caption ("Click to install") shown INSTEAD of the panel until
	 * the chip is clicked. Requires the parent to drive `tooltipPinned` from its
	 * own click handler — the hint itself never opens the panel.
	 */
	tooltipHint?: ReactNode;
	tooltipPinned?: boolean;
	onTooltipDismiss?: () => void;
	noTooltip?: boolean;
	compact?: boolean;
	disabled?: boolean;
	dimmed?: boolean;
	onClick?: () => void;
	ariaExpanded?: boolean;
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

const ChipSurface = ({
	config,
	disabled,
	dimmed,
	onClick,
	ariaExpanded,
	children,
}: Pick<
	ConfigChipProps,
	"config" | "disabled" | "dimmed" | "onClick" | "ariaExpanded"
> & {
	children: ReactNode;
}) => {
	const style = clsx(
		chipSurface({ rarity: config.rarity ?? "common" }),
		dimmed && "opacity-40"
	);

	return onClick ? (
		<button
			type="button"
			onClick={onClick}
			disabled={disabled}
			aria-expanded={ariaExpanded}
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
	price,
	badge,
	tooltip,
	interactiveTooltip,
	tooltipHint,
	tooltipPinned,
	onTooltipDismiss,
	noTooltip,
	disabled,
	dimmed,
	onClick,
	ariaExpanded,
}: ConfigChipProps) => {
	const level = config.level ?? 1;
	const corners = [
		badge ? <span key="badge">{badge}</span> : null,
		level > 1 ? (
			<Badge key="level" size="corner">
				L{level}
			</Badge>
		) : null,
		price !== undefined ? (
			<Badge key="price" tone="price" size="corner">{`${price}KB`}</Badge>
		) : null,
	].filter(Boolean);
	const surface = (
		<ChipSurface
			config={config}
			disabled={disabled}
			dimmed={dimmed}
			onClick={onClick}
			ariaExpanded={ariaExpanded}
		>
			<ChipLabel config={config} action={action} />
		</ChipSurface>
	);
	const chip =
		corners.length > 0 ? (
			<span className="relative inline-flex">
				<span className="absolute -right-1 -top-2.5 z-10 flex gap-1">
					{corners}
				</span>
				{surface}
			</span>
		) : (
			surface
		);
	if (noTooltip) return chip;
	const rarity = config.rarity ?? "common";
	// `pinned={false}` keeps the hint controlled-shut: a touch tap must not pin
	// the caption itself, because the chip's click is what swaps in the panel.
	if (tooltipHint !== undefined && !tooltipPinned)
		return (
			<Tooltip compact pinned={false} content={tooltipHint}>
				{chip}
			</Tooltip>
		);
	return (
		<Tooltip
			surfaceClassName={tooltipSurface({ rarity })}
			interactive={interactiveTooltip}
			pinned={tooltipHint !== undefined ? tooltipPinned : undefined}
			onDismiss={onTooltipDismiss}
			content={
				<span className="flex flex-col gap-1">
					<span className={rarityLabel({ rarity })}>{rarity}</span>
					{tooltip ?? (
						<Paragraph className="text-sm">{describeConfig(config)}</Paragraph>
					)}
				</span>
			}
		>
			{chip}
		</Tooltip>
	);
};
