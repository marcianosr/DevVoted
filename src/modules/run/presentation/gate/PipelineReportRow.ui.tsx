import {
	useState,
	type KeyboardEvent,
	type MouseEvent,
	type ReactNode,
} from "react";
import { clsx } from "clsx";
import type { Config } from "~/modules/run/configs/config.model";
import { rarityOf } from "~/modules/run/configs/config.model";
import { RARITY_COLORS } from "~/ui/rarityColors";
import { StatusLine, type StatusLineSpacing } from "~/ui/runs/StatusLine.ui";
import type { StatusBadgeVariant } from "~/ui/StatusBadge.ui";
import { StatusDot } from "~/ui/StatusDot.ui";
import {
	Paragraph,
	type ParagraphTone,
} from "~/ui/typography/Paragraph.component";
import { type ChipAction, ConfigActions } from "../configs/ConfigActions.ui";
import { ConfigChip } from "../configs/ConfigChip.ui";

/**
 * The two pipeline row shapes: the legacy badge+chip report line, and the
 * collapsible table row every run pipeline surface shares (configure,
 * answering, gate report, shop) — one line of mark · rarity-underlined name ·
 * counter, tapping it folds open the detail block.
 */
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

// Clicks and keys on the row toggle its detail — unless they land on one of
// the row's own controls (use, ✕, the shop's chip popover).
const hitsRowControl = (event: { target: EventTarget }): boolean =>
	event.target instanceof HTMLElement &&
	event.target.closest("button") !== null;

type PipelineReportRowProps = {
	badge: StatusBadgeVariant;
	layout?: PipelineRowLayout;
	spacing?: StatusLineSpacing;
	config: Config;
	description: ReactNode;
	descriptionTone?: ParagraphTone;
	/** Benefit sentence — the detail's effect line. */
	gives?: string;
	/** Check demand sentence — leads the detail. */
	needs?: string;
	/** Price sentence — joins the detail, toned as a cost. */
	costs?: string;
	/** Footnote in the detail — a streak check's warning. */
	note?: ReactNode;
	value?: ReactNode;
	valueTone?: ParagraphTone;
	chipActions?: readonly ChipAction[];
	chipBadge?: ReactNode;
	trailing?: ReactNode;
	onRemove?: (configId: string) => void;
	removable?: boolean;
	/** The row carries a use button: a dormant check's dot becomes the ▸
	 * usable mark (armed/settled checks keep their honest dot). */
	usable?: boolean;
	/** Replaces the fold toggle — the configure preview's whole-row
	 * "click to add". */
	onActivate?: () => void;
	/** A would-be row (the configure preview): boxed in a dashed rarity border
	 * with its detail always open, like a brochure for the slot it stands in
	 * for. */
	ghost?: boolean;
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
	usable = false,
	onActivate,
	ghost = false,
}: PipelineReportRowProps) => {
	// Detail is open by default — a tap on the name folds the row to one line.
	const [expanded, setExpanded] = useState(true);

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

	// The rarity-underlined name is the fold toggle — a real button, so the
	// row never wraps its inner controls (use, ✕, the shop's chip popover) in
	// an outer button role. Chip rows swap the name for the popover chip and
	// keep their detail pinned open. A ghost's whole row activates instead, so
	// its name stays plain text.
	const nameText = (
		<Paragraph
			as="span"
			size="sm"
			className={clsx(
				"font-bold underline decoration-2 underline-offset-4",
				RARITY_COLORS[rarity].decoration
			)}
		>
			{config.label}
		</Paragraph>
	);

	const configCell = (
		<span className="col-start-2 row-start-1 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
			{chipActions ? (
				<ConfigActions
					config={config}
					actions={chipActions}
					badge={chipBadge}
				/>
			) : (
				<>
					{ghost ? (
						nameText
					) : (
						<button
							type="button"
							aria-expanded={expanded}
							onClick={() => setExpanded((open) => !open)}
							className="cursor-pointer text-left"
						>
							{nameText}
						</button>
					)}
					{chipBadge}
				</>
			)}
		</span>
	);

	// The folded-open detail: demand first, then the effect it unlocks, then
	// price, footnote, and rarity — a sentence-per-line story of the config.
	const detail = (
		<span className="col-span-2 col-start-2 row-start-2 mt-1.5 flex flex-col gap-1 border-l border-zinc-700 pl-3">
			{needs ? (
				<Paragraph as="span" size="sm" tone={failed ? "cinnabar" : "default"}>
					{needs}
				</Paragraph>
			) : null}
			{gives ? (
				<Paragraph as="span" size="sm" tone="muted">
					{emphasizeNumbers(gives)}
				</Paragraph>
			) : null}
			{costs ? (
				<Paragraph as="span" size="sm" tone="vermillion">
					{costs}
				</Paragraph>
			) : null}
			{!gives && !needs && !costs ? (
				<Paragraph as="span" size="sm" tone={descriptionTone}>
					{description}
				</Paragraph>
			) : null}
			{noteBlock}
			<span className={clsx("text-xs", RARITY_COLORS[rarity].text)}>
				{rarity}
			</span>
		</span>
	);

	// The whole row is a convenience tap target for the same fold toggle (or
	// the ghost's commit); the name button carries the keyboard/SR path, so
	// the row itself takes no button role.
	const handleClick = (event: MouseEvent<HTMLDivElement>) => {
		if (hitsRowControl(event)) return;
		if (onActivate) {
			onActivate();
			return;
		}
		if (chipActions) return;
		setExpanded((open) => !open);
	};

	const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
		if (event.key === "Enter" || event.key === " ") {
			event.preventDefault();
			onActivate?.();
		}
	};

	// A ghost boxes the row in a dashed rarity border; the negative margin
	// gives the border room without knocking its cells out of column. Legendary
	// dashes take the animated border-color (the gradient ring can't dash).
	const ghostBox = clsx(
		"-mx-3 rounded-lg border-2 border-dashed px-3",
		rarity === "legendary" ? "prismatic-border" : RARITY_COLORS[rarity].border
	);

	return (
		<div
			className={clsx(
				"col-span-3 grid grid-cols-subgrid items-start gap-x-4 py-2",
				ghost && ghostBox,
				"cursor-pointer transition-colors hover:bg-zinc-900/60"
			)}
			onClick={handleClick}
			role={ghost ? "button" : undefined}
			tabIndex={ghost ? 0 : undefined}
			onKeyDown={ghost ? handleKeyDown : undefined}
		>
			<span className="col-start-1 row-start-1 flex h-5 items-center">
				<StatusDot variant={usable && badge === "skip" ? "use" : badge} />
			</span>
			{configCell}
			<span className="col-start-3 row-start-1 flex items-center justify-end gap-3">
				{trailingBlock}
			</span>
			{expanded ? detail : null}
		</div>
	);
};
