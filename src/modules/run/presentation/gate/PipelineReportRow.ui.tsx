import type { ReactNode } from "react";
import type { Config } from "~/modules/run/configs/config.model";
import { StatusLine } from "~/ui/runs/StatusLine.ui";
import type { StatusBadgeVariant } from "~/ui/StatusBadge.ui";
import {
	Paragraph,
	type ParagraphTone,
} from "~/ui/typography/Paragraph.component";
import { type ChipAction, ConfigActions } from "../configs/ConfigActions.ui";
import { ConfigChip } from "../configs/ConfigChip.ui";

type PipelineReportRowProps = {
	badge: StatusBadgeVariant;
	config: Config;
	description: ReactNode;
	descriptionTone?: ParagraphTone;
	value?: ReactNode;
	valueTone?: ParagraphTone;
	/** When set, the chip becomes a click-to-open sell/upgrade popover (shop). */
	chipActions?: readonly ChipAction[];
	/** A corner badge on the chip — the shop's "new" marker. */
	chipBadge?: ReactNode;
	trailing?: ReactNode;
	/** When set, the entire row becomes clickable to remove this config. */
	onRemove?: (configId: string) => void;
	/** Whether this config can be removed. */
	removable?: boolean;
};

export const PipelineReportRow = ({
	badge,
	config,
	description,
	descriptionTone = "muted",
	value,
	valueTone = "default",
	chipActions,
	chipBadge,
	trailing,
	onRemove,
	removable = false,
}: PipelineReportRowProps) => (
	<StatusLine
		badge={badge}
		line={description}
		lineTone={descriptionTone}
		lineSize="sm"
		leading={
			<span className="flex items-center gap-1.5">
				{chipActions ? (
					<ConfigActions
						config={config}
						actions={chipActions}
						badge={chipBadge}
						noFixedBadge
					/>
				) : (
					<ConfigChip
						config={config}
						badge={chipBadge}
						noTooltip
						noFixedBadge
					/>
				)}
				{config.fixed ? (
					<span
						className="shrink-0 text-pewter"
						aria-label="Fixed config"
						title="Fixed — can't be removed"
					>
						🔒
					</span>
				) : null}
			</span>
		}
		trailing={
			<>
				{value != null ? (
					<Paragraph
						as="span"
						size="sm"
						tone={valueTone}
						className="shrink-0 text-right font-bold tabular-nums"
					>
						{value}
					</Paragraph>
				) : null}
				{removable && onRemove ? (
					<span className="shrink-0 text-cinnabar font-bold">✕</span>
				) : trailing ? (
					<span className="shrink-0">{trailing}</span>
				) : null}
			</>
		}
		onActivate={removable && onRemove ? () => onRemove(config.id) : undefined}
	/>
);
