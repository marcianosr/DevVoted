import type { ReactNode } from "react";
import type { Config } from "~/modules/run/configs/config.model";
import { StatusLine, type StatusLineSpacing } from "~/ui/runs/StatusLine.ui";
import type { StatusBadgeVariant } from "~/ui/StatusBadge.ui";
import {
	Paragraph,
	type ParagraphTone,
} from "~/ui/typography/Paragraph.component";
import { type ChipAction, ConfigActions } from "../configs/ConfigActions.ui";
import { ConfigChip } from "../configs/ConfigChip.ui";

/**
 * The two pipeline row shapes: the legacy badge+chip report line, and the
 * stacked build-log row every run pipeline surface shares (configure,
 * answering). Stacked swaps the badge for a dot.
 */
export type PipelineRowLayout = "chip" | "stacked";

type PipelineReportRowProps = {
	badge: StatusBadgeVariant;
	layout?: PipelineRowLayout;
	spacing?: StatusLineSpacing;
	config: Config;
	description: ReactNode;
	descriptionTone?: ParagraphTone;
	/** Benefit phrase — stacked rows show it as a labeled "gives" line. */
	gives?: string;
	/** Check demand — stacked rows show it as a labeled "needs" line. */
	needs?: string;
	/** Price phrase — stacked rows show it as a labeled "costs" line. */
	costs?: string;
	/** Footnote under the description — a dormant check's "skipped". */
	note?: ReactNode;
	value?: ReactNode;
	valueTone?: ParagraphTone;
	chipActions?: readonly ChipAction[];
	chipBadge?: ReactNode;
	trailing?: ReactNode;
	onRemove?: (configId: string) => void;
	removable?: boolean;
};

export const PipelineReportRow = ({
	badge,
	layout = "chip",
	spacing,
	config,
	description,
	descriptionTone = "muted",
	gives,
	needs,
	costs,
	note,
	value,
	valueTone = "default",
	chipActions,
	chipBadge,
	trailing,
	onRemove,
	removable = false,
}: PipelineReportRowProps) => {
	const labeledLine = (label: string, text: string, tone: ParagraphTone) => (
		<span className="flex gap-3">
			<Paragraph as="span" size="xs" tone="faint" className="w-12 shrink-0">
				{label}
			</Paragraph>
			<Paragraph as="span" size="xs" tone={tone}>
				{text}
			</Paragraph>
		</span>
	);

	const noteBlock = note ? (
		<Paragraph as="span" size="xs" tone="faint" className="block">
			{note}
		</Paragraph>
	) : null;

	// When the row has chip actions (the shop's sell/upgrade popover), the chip
	// is the stacked heading, since it is the click target.
	const stackedHeading = chipActions ? (
		<span className="mb-1 block">
			<ConfigActions config={config} actions={chipActions} badge={chipBadge} />
		</span>
	) : (
		<Paragraph as="span" size="sm" className="block font-bold">
			{config.label}
		</Paragraph>
	);

	const stackedLine = (
		<>
			{stackedHeading}
			{gives || needs || costs ? (
				<>
					{gives ? labeledLine("gives", gives, "viridian") : null}
					{needs ? labeledLine("needs", needs, "default") : null}
					{costs ? labeledLine("costs", costs, "vermillion") : null}
				</>
			) : (
				description
			)}
			{noteBlock}
		</>
	);

	// The chip sits in a fixed column so varying chip widths don't stagger
	// descriptions.
	const chipColumn = (
		<span className="flex w-28 shrink-0 items-center gap-1.5">
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
	);

	const line = {
		chip: (
			<>
				{description}
				{noteBlock}
			</>
		),
		stacked: stackedLine,
	}[layout];

	const leading = {
		chip: chipColumn,
		stacked: undefined,
	}[layout];

	return (
		<StatusLine
			badge={badge}
			indicator={layout === "chip" ? "badge" : "dot"}
			spacing={spacing}
			line={line}
			lineTone={descriptionTone}
			lineSize="sm"
			leading={leading}
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
};
