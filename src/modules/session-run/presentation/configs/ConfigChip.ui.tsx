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
	badge?: ReactNode;
	tooltip?: ReactNode;
	noTooltip?: boolean;
	disabled?: boolean;
	onClick?: () => void;
};

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
	const corners = [
		badge ? <span key="badge">{badge}</span> : null,
		config.fixed ? <Badge key="fixed">fixed</Badge> : null,
		price !== undefined ? (
			<Badge key="price" tone="price">{`${price}KB`}</Badge>
		) : null,
	].filter(Boolean);
	const surface = (
		<ChipSurface config={config} disabled={disabled} onClick={onClick}>
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
			surfaceClassName={`${RARITY_COLORS[rarity].border} bg-zinc-900`}
			content={
				<div className="flex flex-col gap-1">
					<span
						className={`text-xs font-bold uppercase tracking-wide ${RARITY_COLORS[rarity].text}`}
					>
						{rarity}
					</span>
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
