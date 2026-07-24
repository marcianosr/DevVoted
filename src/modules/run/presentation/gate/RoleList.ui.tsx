import type { ReactNode } from "react";
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
import { PipelineReportRow } from "./PipelineReportRow.ui";

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

// The pipeline's open slots read as full-width segments spanning the line, so an
// empty slot looks like a length of unfilled pipe rather than a stray chip.
const EmptySlotRow = () => (
	<div className="py-1">
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
	onRemove?: (configId: string) => void;
	/** Total free (non-fixed) slots — unfilled ones render as empty rows. */
	slots?: number;
	/** When set, each config chip becomes a sell/upgrade popover (shop). */
	actionsFor?: (config: Config) => readonly ChipAction[];
	/** Configs to mark with a "new" chip badge (freshly drafted). */
	newConfigIds?: readonly string[];
	/** A control rendered as the final row — the shop's "expand pipeline". */
	trailing?: ReactNode;
};

const removeButton = (row: RoleRow, onRemove: (configId: string) => void) =>
	row.config.fixed ? undefined : (
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
	newConfigIds,
	trailing,
}: RoleListProps) => {
	const filledFreeSlots = rows.filter((row) => !row.config.fixed).length;
	const emptySlots = slots ? Math.max(0, slots - filledFreeSlots) : 0;
	const newBadge = (config: Config): ReactNode =>
		newConfigIds?.includes(config.id) ? (
			<Badge tone="positive">new</Badge>
		) : undefined;

	return (
		<div className="flex flex-col">
			{rows.map((row) => (
				<PipelineReportRow
					key={row.config.id}
					badge={roleBadge(row)}
					config={row.config}
					description={row.description}
					descriptionTone={row.state === "failed" ? "cinnabar" : "muted"}
					value={row.status}
					valueTone={roleValueTone(row)}
					chipActions={actionsFor?.(row.config)}
					chipBadge={newBadge(row.config)}
					trailing={onRemove ? removeButton(row, onRemove) : undefined}
				/>
			))}
			{Array.from({ length: emptySlots }, (_, index) => (
				<EmptySlotRow key={`empty-${index}`} />
			))}
			{trailing ? <div className="py-1">{trailing}</div> : null}
		</div>
	);
};
