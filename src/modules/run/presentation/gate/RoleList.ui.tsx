import type { ReactNode } from "react";
import { clsx } from "clsx";
import type { Config } from "~/modules/run/configs/config.model";
import type { CheckState } from "~/modules/run/configs/effect.model";
import type { RoleRow } from "~/modules/run/gate/configRole.model";
import { Badge } from "~/ui/Badge.component";
import type { StatusBadgeVariant } from "~/ui/StatusBadge.ui";
import {
	Paragraph,
	type ParagraphTone,
} from "~/ui/typography/Paragraph.component";
import type { ChipAction } from "../configs/ConfigActions.ui";
import {
	PipelineReportRow,
	type PipelineRowLayout,
} from "./PipelineReportRow.ui";

// A check's live state maps onto the shared status badge: a requirement in flight
// reads RUN, a dormant conditional SKIP, a settled one PASS/FAIL.
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

// A checkless config never reports progress — its value slot says so.
const rowValue = (row: RoleRow): string | undefined =>
	row.status ?? (row.state ? undefined : "passive");

/** An in-row action on a usable config — the answering screen's linter. */
export type RowUseAction = {
	readonly cost?: number;
	readonly ready: boolean;
	readonly onUse: () => void;
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

// The pipeline's open slots read as full-width segments spanning the line, so an
// empty slot looks like a length of unfilled pipe rather than a stray chip.
const EmptySlotRow = () => (
	<div className="py-3">
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

type RoleListProps = {
	rows: readonly RoleRow[];
	/** Row shape: "chip" (badge+chip report line, default) or "stacked" (the
	 * divided build-log rows every run pipeline surface shares). */
	layout?: PipelineRowLayout;
	onRemove?: (configId: string) => void;
	/** Total pipeline slots — unfilled ones render as empty rows. */
	slots?: number;
	/** When set, each config chip becomes a sell/upgrade popover (shop). */
	actionsFor?: (config: Config) => readonly ChipAction[];
	/** A usable config's in-row action (the answering screen's linter): the row
	 * carries a "use" button; its dot stays honest — gray skipped until used,
	 * live orange once the pledge is armed. */
	getUseAction?: (config: Config) => RowUseAction | undefined;
	/** Configs to mark with a "new" chip badge (freshly drafted). */
	newConfigIds?: readonly string[];
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
	layout = "chip",
	onRemove,
	slots,
	actionsFor,
	getUseAction,
	newConfigIds,
	trailing,
}: RoleListProps) => {
	const emptySlots = slots ? Math.max(0, slots - rows.length) : 0;
	const newBadge = (config: Config): ReactNode =>
		newConfigIds?.includes(config.id) ? (
			<Badge tone="positive">new</Badge>
		) : undefined;
	// Only the stacked build-log gets dividers and air; the report line and the
	// mid-run strip stay dense.
	const stacked = layout === "stacked";

	return (
		<div
			className={clsx("flex flex-col", stacked && "divide-y divide-zinc-700")}
		>
			{rows.map((row) => {
				// The use button replaces the value and makes the dormancy note
				// redundant; the state dot still tells the truth about the check.
				const action = getUseAction?.(row.config);
				return (
					<PipelineReportRow
						key={row.config.id}
						badge={roleBadge(row)}
						layout={layout}
						spacing={stacked ? "spacious" : undefined}
						config={row.config}
						description={row.description}
						descriptionTone={row.state === "failed" ? "cinnabar" : "muted"}
						gives={row.gives}
						needs={row.needs}
						costs={row.costs}
						note={action ? undefined : row.note}
						value={action ? undefined : rowValue(row)}
						valueTone={roleValueTone(row)}
						chipActions={actionsFor?.(row.config)}
						chipBadge={newBadge(row.config)}
						trailing={
							action
								? rowUseButton(action)
								: onRemove
									? removeButton(row, onRemove)
									: undefined
						}
					/>
				);
			})}
			{Array.from({ length: emptySlots }, (_, index) => (
				<EmptySlotRow key={`empty-${index}`} />
			))}
			{trailing ? <div className="py-3">{trailing}</div> : null}
		</div>
	);
};
