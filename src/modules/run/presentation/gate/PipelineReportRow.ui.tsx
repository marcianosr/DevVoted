import type { ReactNode } from "react";
import { clsx } from "clsx";
import type { Config } from "~/modules/run/configs/config.model";
import { rarityOf } from "~/modules/run/configs/config.model";
import { FoldableRow, type Fold } from "~/ui/FoldableRow.ui";
import { RARITY_COLORS } from "~/ui/rarityColors";
import { StatusLine, type StatusLineSpacing } from "~/ui/runs/StatusLine.ui";
import type { StatusBadgeVariant } from "~/ui/StatusBadge.ui";
import { StatusDot, type StatusDotVariant } from "~/ui/StatusDot.ui";
import {
	Paragraph,
	type ParagraphTone,
} from "~/ui/typography/Paragraph.component";
import { type ChipAction, ConfigActions } from "../configs/ConfigActions.ui";
import { ConfigChip } from "../configs/ConfigChip.ui";
import { SlotNumberCell } from "./PipelineTable.ui";

export type PipelineRowLayout = "chip" | "table";

// Numbers carry the payload of a detail sentence ("Then all coverage earns
// ×1.5") — they read bright while the prose around them stays muted. The
// capture group makes every odd split part a number token.
const NUMBER_TOKEN = /(×[\d.]+|[+−-][\d.]+(?:%|KB)?)/;

const emphasizeNumbers = (text: string): ReactNode =>
	text.split(NUMBER_TOKEN).map((part, index) =>
		index % 2 === 1 ? (
			<span key={`${part}-${index}`} className="font-bold text-zinc-100">
				{part}
			</span>
		) : (
			part
		)
	);

type PipelineReportRowProps = {
	badge: StatusBadgeVariant;
	layout?: PipelineRowLayout;
	spacing?: StatusLineSpacing;
	config: Config;
	description: ReactNode;
	descriptionTone?: ParagraphTone;
	gives?: string;
	needs?: string;
	costs?: string;
	note?: ReactNode;
	value?: ReactNode;
	valueTone?: ParagraphTone;
	chipActions?: readonly ChipAction[];
	chipBadge?: ReactNode;
	trailing?: ReactNode;
	onRemove?: (configId: string) => void;
	removable?: boolean;
	mark?: StatusDotVariant;
	dimmed?: boolean;
	onActivate?: () => void;
	/** Spoken name for an activatable (preview) row. */
	activateLabel?: string;
	ghost?: boolean;
	/** Slot this row occupies, shown in the table's leading gutter. */
	slotNumber?: number;
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
	mark,
	dimmed = false,
	onActivate,
	activateLabel,
	ghost = false,
	slotNumber,
}: PipelineReportRowProps) => {
	const noteBlock = note ? (
		<Paragraph as="span" size="xs" tone="faint" className="block">
			{note}
		</Paragraph>
	) : null;

	const trailingBlock = (
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
				<button
					type="button"
					aria-label={`Remove ${config.label}`}
					onClick={() => onRemove(config.id)}
					className="shrink-0 cursor-pointer font-bold text-cinnabar"
				>
					✕
				</button>
			) : trailing ? (
				<span className="shrink-0">{trailing}</span>
			) : null}
		</>
	);

	if (layout === "chip") {
		return (
			<StatusLine
				badge={badge}
				indicator="badge"
				spacing={spacing}
				line={
					<>
						{description}
						{noteBlock}
					</>
				}
				lineTone={descriptionTone}
				lineSize="sm"
				leading={
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
				}
				trailing={trailingBlock}
			/>
		);
	}

	const rarity = rarityOf(config);
	const failed = badge === "fail";

	const summaryCells = ({ expanded, toggle }: Fold) => (
		<>
			<span className="col-start-1 row-start-1 flex items-center self-stretch">
				<StatusDot variant={mark ?? badge} />
			</span>
			<span className="col-start-2 row-start-1 flex flex-wrap items-center gap-x-2 gap-y-0.5">
				{chipActions ? (
					<ConfigActions
						config={config}
						actions={chipActions}
						badge={chipBadge}
					/>
				) : ghost ? (
					<ConfigChip config={config} badge={chipBadge} noTooltip />
				) : (
					<ConfigChip
						config={config}
						badge={chipBadge}
						noTooltip
						ariaExpanded={expanded}
						onClick={toggle}
					/>
				)}
			</span>
			<span className="col-start-3 row-start-1 flex items-center justify-end gap-3 self-stretch">
				{trailingBlock}
			</span>
		</>
	);

	// The rule runs under the status mark, not under the config chip: the eye
	// follows the mark's column down the list, so hanging the detail off it reads
	// as one thread per row instead of two staggered starts.
	const detail = (
		<span className="col-span-3 col-start-1 row-start-2 mt-1.5 flex flex-col gap-1 border-l border-zinc-700 pl-3">
			{needs ? (
				<Paragraph as="span" size="sm" tone={failed ? "cinnabar" : "default"}>
					{needs}
				</Paragraph>
			) : gives || costs ? (
				<Paragraph as="span" size="xs" tone="muted">
					No condition
				</Paragraph>
			) : null}
			{gives ? (
				<Paragraph as="span" size="xs" tone="muted">
					{emphasizeNumbers(gives)}
				</Paragraph>
			) : null}
			{costs ? (
				<Paragraph as="span" size="xs" tone="vermillion">
					{costs}
				</Paragraph>
			) : null}
			{!gives && !needs && !costs ? (
				<Paragraph as="span" size="xs" tone={descriptionTone}>
					{description}
				</Paragraph>
			) : null}
			{noteBlock}
		</span>
	);

	// A ghost boxes the row in a dashed rarity border; the negative margin
	// gives the border room without knocking its cells out of column. Legendary
	// dashes go static fuchsia (the gradient ring can't dash).
	const ghostBox = clsx(
		"-mx-3 rounded-lg border-2 border-dashed px-3",
		rarity === "legendary" ? "border-fuchsia" : RARITY_COLORS[rarity].border
	);

	return (
		<>
			{slotNumber === undefined ? null : <SlotNumberCell slot={slotNumber} />}
			<FoldableRow
				summary={summaryCells}
				detail={detail}
				onActivate={onActivate}
				activateLabel={activateLabel}
				foldable={!chipActions}
				className={clsx(ghost && ghostBox, dimmed && "opacity-50")}
				placement={
					slotNumber === undefined ? undefined : "col-start-2 col-span-3"
				}
			/>
		</>
	);
};
