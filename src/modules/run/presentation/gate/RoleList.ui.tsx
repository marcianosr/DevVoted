import type { ReactNode } from "react";
import { clsx } from "clsx";
import type { Config } from "~/modules/run/configs/config.model";
import { describeConfig } from "~/modules/run/configs/config.model";
import type { CheckState } from "~/modules/run/configs/effect.model";
import type { RoleRow } from "~/modules/run/gate/configRole.model";
import { Badge } from "~/ui/Badge.component";
import { GainBar } from "~/ui/runs/GainBar.ui";
import type { StatusBadgeVariant } from "~/ui/StatusBadge.ui";
import {
	Paragraph,
	type ParagraphTone,
} from "~/ui/typography/Paragraph.component";
import type { ChipAction } from "../configs/ConfigActions.ui";
import { PipelineReportRow } from "./PipelineReportRow.ui";
import { PipelineTable } from "./PipelineTable.ui";

// A check's live state maps onto the shared status dot: a requirement in flight
// reads running, a dormant conditional skipped, a settled one pass/fail.
const STATE_BADGE: Record<CheckState, StatusBadgeVariant> = {
	running: "run",
	skipped: "skip",
	success: "pass",
	failed: "fail",
};

const STATE_VALUE_TONE: Record<CheckState, ParagraphTone> = {
	running: "saffron",
	skipped: "muted",
	success: "viridian",
	failed: "cinnabar",
};

// Perks back no check, so they carry no state — they read as an always-on bonus.
const roleBadge = (row: RoleRow): StatusBadgeVariant =>
	row.state ? STATE_BADGE[row.state] : "perk";

const roleValueTone = (row: RoleRow): ParagraphTone =>
	row.state ? STATE_VALUE_TONE[row.state] : "muted";

// A checkless config never reports progress — its state cell says so.
const rowValue = (row: RoleRow): string | undefined =>
	row.status ?? (row.state ? undefined : "passive");

/** An in-row action on a usable config — the answering screen's linter. */
export type RowUseAction = {
	readonly cost?: number;
	readonly ready: boolean;
	readonly onUse: () => void;
};

/** A bench config the player is eyeing — rendered as a would-be row in the
 * next open slot; activating the row commits it (onSlot). */
export type SlotPreview = {
	readonly config: Config;
	readonly onAdd: () => void;
};

/** The next coverage-gated slot (ADR-008) — rendered as a locked slot with
 * live unlock progress after the open ones. */
export type NextSlotUnlock = {
	readonly number: number;
	readonly unlockAtPct: number;
	readonly coveragePct: number;
};

const rowUseButton = (action: RowUseAction) => (
	<button
		type="button"
		onClick={action.onUse}
		disabled={!action.ready}
		className="shrink-0 cursor-pointer rounded border border-celadon px-2 py-0.5 text-xs text-celadon transition enabled:hover:bg-celadon enabled:hover:text-black disabled:cursor-not-allowed disabled:opacity-40"
	>
		use{action.cost === undefined ? "" : ` ${action.cost}KB`}
	</button>
);

// The pipeline's open slots read as full-width segments spanning the table, so
// an empty slot looks like a length of unfilled pipe rather than a stray chip.
const EmptySlotRow = () => (
	<div className="col-span-3 py-2">
		<Paragraph
			as="span"
			size="xs"
			tone="muted"
			className="block w-full rounded-lg border-2 border-dashed border-zinc-700 px-4 py-2 text-center"
		>
			empty slot
		</Paragraph>
	</div>
);

// The next coverage-gated slot: the same dashed pipe segment, carrying its
// unlock demand, your live coverage, and a bar of the progress between them.
const LockedSlotRow = ({ slot }: { slot: NextSlotUnlock }) => {
	const unlocked = slot.coveragePct >= slot.unlockAtPct;
	return (
		<div className="col-span-3 py-2">
			<div className="flex items-center gap-4 rounded-lg border-2 border-dashed border-zinc-700 px-4 py-3">
				<div className="flex min-w-0 flex-1 flex-col gap-1.5">
					<Paragraph as="span" size="sm" className="font-bold">
						Slot {slot.number}
					</Paragraph>
					<Paragraph as="span" size="sm" tone="muted">
						unlocks at{" "}
						<span className="font-bold text-zinc-100">{slot.unlockAtPct}%</span>{" "}
						coverage · you have{" "}
						<span className="font-bold text-viridian">{slot.coveragePct}%</span>
					</Paragraph>
					<span className="max-w-56">
						<GainBar
							from={0}
							to={slot.coveragePct}
							cap={slot.unlockAtPct}
							label={`coverage toward slot ${slot.number}`}
						/>
					</span>
				</div>
				<Paragraph
					as="span"
					size="xs"
					tone={unlocked ? "celadon" : "faint"}
					className={clsx(
						"shrink-0 rounded border px-2 py-0.5",
						unlocked ? "border-celadon" : "border-zinc-700"
					)}
				>
					{unlocked ? "unlocked" : "locked"}
				</Paragraph>
			</div>
		</div>
	);
};

type RoleListProps = {
	rows: readonly RoleRow[];
	onRemove?: (configId: string) => void;
	/** Total pipeline slots — unfilled ones render as empty rows. */
	slots?: number;
	/** When set, each config chip becomes a sell/upgrade popover (shop). */
	actionsFor?: (config: Config) => readonly ChipAction[];
	/** A usable config's in-row action (the answering screen's linter): the row
	 * carries a "use" button and the ▸ usable mark while its check is dormant —
	 * the dot turns honest (live orange) once the pledge is armed. */
	getUseAction?: (config: Config) => RowUseAction | undefined;
	/** Per-row trailing controls — the shop's upgrade/sell buttons. Wins over
	 * the use/remove defaults when it returns something. */
	trailingFor?: (config: Config) => ReactNode;
	/** Configs to mark with a "new" chip badge (freshly drafted). */
	newConfigIds?: readonly string[];
	/** The configure screen's hovered bench config, occupying one would-be slot. */
	preview?: SlotPreview;
	/** The next coverage-gated slot, shown locked after the open ones. */
	nextSlot?: NextSlotUnlock;
	/** A control rendered as the final row — the shop's "expand pipeline". */
	trailing?: ReactNode;
};

const removeButton = (row: RoleRow, onRemove: (configId: string) => void) => (
	<button
		type="button"
		onClick={() => onRemove(row.config.id)}
		aria-label={`Remove ${row.config.label}`}
		className="shrink-0 cursor-pointer text-lg text-pewter transition-colors hover:text-cinnabar"
	>
		✕
	</button>
);

export const RoleList = ({
	rows,
	onRemove,
	slots,
	actionsFor,
	getUseAction,
	trailingFor,
	newConfigIds,
	preview,
	nextSlot,
	trailing,
}: RoleListProps) => {
	// The preview occupies one would-be slot, so the open count shrinks with it.
	const emptySlots = slots
		? Math.max(0, slots - rows.length - (preview ? 1 : 0))
		: 0;
	const newBadge = (config: Config): ReactNode =>
		newConfigIds?.includes(config.id) ? (
			<Badge tone="positive">new</Badge>
		) : undefined;

	return (
		<PipelineTable>
			{rows.map((row) => {
				const action = getUseAction?.(row.config);
				return (
					<PipelineReportRow
						key={row.config.id}
						badge={roleBadge(row)}
						layout="table"
						usable={Boolean(action)}
						config={row.config}
						description={row.description}
						descriptionTone={row.state === "failed" ? "cinnabar" : "muted"}
						gives={row.gives}
						needs={row.needs}
						costs={row.costs}
						note={row.note}
						value={action ? undefined : rowValue(row)}
						valueTone={roleValueTone(row)}
						chipActions={actionsFor?.(row.config)}
						chipBadge={newBadge(row.config)}
						trailing={
							trailingFor?.(row.config) ??
							(action
								? rowUseButton(action)
								: onRemove
									? removeButton(row, onRemove)
									: undefined)
						}
					/>
				);
			})}
			{preview ? (
				<PipelineReportRow
					badge="perk"
					layout="table"
					ghost
					config={preview.config}
					description={describeConfig(preview.config)}
					gives={preview.config.gives}
					needs={preview.config.needs}
					costs={preview.config.costs}
					trailing={
						<Paragraph as="span" size="sm" tone="celadon">
							click to add
						</Paragraph>
					}
					onActivate={preview.onAdd}
				/>
			) : null}
			{Array.from({ length: emptySlots }, (_, index) => (
				<EmptySlotRow key={`empty-${index}`} />
			))}
			{nextSlot ? <LockedSlotRow slot={nextSlot} /> : null}
			{trailing ? <div className="col-span-3 py-2">{trailing}</div> : null}
		</PipelineTable>
	);
};
