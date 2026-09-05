import { clsx } from "clsx";
import type { ReactNode } from "react";
import {
	Config,
	describeConfig,
	slotsOf,
} from "~/modules/run/config/domain/config.model";
import { Badge } from "~/ui/Badge.component";
import { sizeFill } from "~/ui/sizes";
import { Tooltip } from "~/ui/Tooltip.component";
import { Paragraph } from "~/ui/typography/Paragraph.component";

const CHIP_SURFACE =
	"inline-flex shrink-0 items-center gap-1.5 rounded-sm align-middle border-1 border-edge-strong bg-surface-raised p-1 text-xs text-zinc-100";

const MARK = "flex shrink-0 items-center gap-0.5";
const BAR = "h-3 w-1 rounded-xs";

const TOOLTIP_SURFACE = "bg-surface border-edge-strong";

type ConfigChipProps = {
	config: Config;
	action?: ReactNode;
	price?: number;
	badge?: ReactNode;
	tooltip?: ReactNode;
	interactiveTooltip?: boolean;
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

const Slots = ({ config }: Pick<ConfigChipProps, "config">) => {
	const slots = slotsOf(config);
	const fill = sizeFill(slots);

	return (
		<span aria-hidden className={MARK}>
			{Array.from({ length: slots }, (_, index) => (
				<span key={index} className={clsx(BAR, fill)} />
			))}
		</span>
	);
};

const ChipLabel = ({
	config,
	action,
}: Pick<ConfigChipProps, "config" | "action">) => (
	<>
		<Slots config={config} />
		{config.label}
		{action ? <span className="ml-2 opacity-70">{action}</span> : null}
	</>
);

const ChipSurface = ({
	disabled,
	dimmed,
	onClick,
	ariaExpanded,
	children,
}: Pick<ConfigChipProps, "disabled" | "dimmed" | "onClick" | "ariaExpanded"> & {
	children: ReactNode;
}) => {
	const style = clsx(CHIP_SURFACE, dimmed && "opacity-40");

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
	if (tooltipHint !== undefined && !tooltipPinned)
		return (
			<Tooltip compact pinned={false} content={tooltipHint}>
				{chip}
			</Tooltip>
		);
	return (
		<Tooltip
			surfaceClassName={TOOLTIP_SURFACE}
			interactive={interactiveTooltip}
			pinned={tooltipHint !== undefined ? tooltipPinned : undefined}
			onDismiss={onTooltipDismiss}
			content={
				<span className="flex flex-col gap-1">
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
