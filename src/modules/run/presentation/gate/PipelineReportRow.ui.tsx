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

const NUMBER_TOKEN = /(×[\d.]+|[+−-][\d.]+(?:%|KB)?)/;

export const emphasizeNumbers = (text: string): ReactNode =>
	text.split(NUMBER_TOKEN).map((part, index) =>
		index % 2 === 1 ? (
			<span key={`${part}-${index}`} className="font-bold text-zinc-100">
				{part}
			</span>
		) : (
			part
		)
	);

export const FactRow = ({
	icon,
	tone,
	value,
}: {
	icon: string;
	tone: ParagraphTone;
	value: ReactNode;
}) => (
	<div className="flex items-center gap-3 py-2">
		<Paragraph as="span" tone={tone} className="w-1 shrink-0 font-bold">
			{icon}
		</Paragraph>
		<Paragraph as="span" tone={tone}>
			{value}
		</Paragraph>
	</div>
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
	activateLabel?: string;
	ghost?: boolean;
	slotNumber?: number;
	defaultOpen?: boolean;
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
	defaultOpen,
}: PipelineReportRowProps) => {
	const noteBlock = note ? (
		<Paragraph as="span" size="xs" tone="faint" className="block">
			{note}
		</Paragraph>
	) : null;

	const renderTrailing = (hideWhenOpenClass?: string) => (
		<>
			{value != null ? (
				<Paragraph
					as="span"
					size="sm"
					tone={valueTone}
					className={clsx(
						"shrink-0 text-right font-bold tabular-nums",
						hideWhenOpenClass
					)}
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
				trailing={renderTrailing()}
			/>
		);
	}

	const rarity = rarityOf(config);

	const summaryCells = ({
		expanded,
		toggle,
		marker,
		summaryOnlyClass,
	}: Fold) => (
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
				{renderTrailing(summaryOnlyClass)}
				{marker}
			</span>
		</>
	);

	const detail = ({ detailClass }: Fold) => (
		<span
			className={clsx(
				"col-span-3 col-start-1 row-start-2 mt-1.5 flex-col gap-1",
				detailClass
			)}
		>
			<div className="flex flex-col divide-y divide-dashed divide-zinc-800">
				{needs ? (
					<FactRow icon="!" tone="cinnabar" value={needs} />
				) : gives || costs ? (
					<Paragraph as="span" size="xs" tone="muted">
						No condition
					</Paragraph>
				) : null}
				{gives ? (
					<FactRow icon="v" tone="viridian" value={emphasizeNumbers(gives)} />
				) : null}
				{(value != null || note) && (needs || gives) ? (
					<FactRow
						icon="○"
						tone={value != null ? valueTone : "muted"}
						value={value ?? note}
					/>
				) : null}
			</div>
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
			{needs || gives ? null : noteBlock}
		</span>
	);

	const ghostBox = clsx(
		"rounded-lg px-3",
		rarity === "legendary"
			? `border-1 ${RARITY_COLORS.legendary.border}`
			: `border-1 border-dashed ${RARITY_COLORS[rarity].border}`
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
				defaultOpen={defaultOpen}
				className={clsx(ghost && ghostBox, dimmed && "opacity-50")}
				placement={
					slotNumber === undefined ? undefined : "col-start-2 col-span-3"
				}
			/>
		</>
	);
};
