import type { ReactNode } from "react";
import type { Config } from "~/modules/run/configs/config.model";
import { StatusBadge, type StatusBadgeVariant } from "~/ui/StatusBadge.ui";
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
};

// The one row shape shared by every pipeline reporter: a solid status badge, the
// source config's chip, the demand it makes, and the right-aligned value it moves.
// Callers own the semantics (which badge, which tones); the layout lives here once.
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
}: PipelineReportRowProps) => (
	<div className="flex items-start gap-3 py-1">
		<span className="shrink-0">
			<StatusBadge variant={badge} />
		</span>
		<span className="shrink-0">
			{chipActions ? (
				<ConfigActions
					config={config}
					actions={chipActions}
					badge={chipBadge}
				/>
			) : (
				<ConfigChip config={config} badge={chipBadge} noTooltip />
			)}
		</span>
		<Paragraph
			as="span"
			size="sm"
			tone={descriptionTone}
			className="min-w-0 flex-1"
		>
			{description}
		</Paragraph>
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
		{trailing ? <span className="shrink-0">{trailing}</span> : null}
	</div>
);
