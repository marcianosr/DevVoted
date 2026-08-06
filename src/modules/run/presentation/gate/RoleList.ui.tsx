import type { ReactNode } from "react";
import type { Config } from "~/modules/run/configs/config.model";
import {
	describeConfig,
	givesOf,
	needsOf,
} from "~/modules/run/configs/config.model";
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
import { PipelineTable } from "./PipelineTable.ui";

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

const roleBadge = (row: RoleRow): StatusBadgeVariant =>
	row.state ? STATE_BADGE[row.state] : "skip";

const roleValueTone = (row: RoleRow): ParagraphTone =>
	row.state ? STATE_VALUE_TONE[row.state] : "muted";

const rowValue = (row: RoleRow): string | undefined =>
	row.status ?? (row.state ? undefined : "passive");

export type RowUseAction = {
	readonly cost?: number;
	readonly ready: boolean;
	readonly onUse: () => void;
};

export type SlotPreview = {
	readonly config: Config;
	readonly onAdd: () => void;
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

type RoleListProps = {
	rows: readonly RoleRow[];
	onRemove?: (configId: string) => void;
	slots?: number;
	actionsFor?: (config: Config) => readonly ChipAction[];
	getUseAction?: (config: Config) => RowUseAction | undefined;
	trailingFor?: (config: Config) => ReactNode;
	newConfigIds?: readonly string[];
	preview?: SlotPreview;
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
	trailing,
}: RoleListProps) => {
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
					badge="skip"
					layout="table"
					ghost
					config={preview.config}
					description={describeConfig(preview.config)}
					gives={givesOf(preview.config)}
					needs={needsOf(preview.config)}
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
			{trailing ? <div className="col-span-3 py-2">{trailing}</div> : null}
		</PipelineTable>
	);
};
