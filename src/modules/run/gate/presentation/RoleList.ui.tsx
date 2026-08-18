import type { ReactNode } from "react";
import type { Config } from "~/modules/run/config/domain/config.model";
import {
	describeConfig,
	givesOf,
} from "~/modules/run/config/domain/config.model";
import type { RoleRow } from "~/modules/run/gate/domain/configRole.model";
import { Badge } from "~/ui/Badge.component";
import type { StatusBadgeVariant } from "~/ui/StatusBadge.ui";
import { Paragraph } from "~/ui/typography/Paragraph.component";
import type { ChipAction } from "~/modules/run/config/presentation/ConfigActions.ui";
import {
	describeRow,
	PipelineReportRow,
} from "~/modules/run/pipeline/presentation/PipelineReportRow.ui";
import {
	PipelineTable,
	SlotNumberCell,
} from "~/modules/run/pipeline/presentation/PipelineTable.ui";

/** Configs demand nothing (ADR-035): every row is a neutral bullet. Kept as a
 * fn so the one place the dot semantics change is here. */
export const roleBadge = (_row: RoleRow): StatusBadgeVariant => "skip";

export type RowUseAction = {
	readonly cost?: number;
	readonly ready: boolean;
	readonly onUse: () => void;
};

export type SlotPreview = {
	readonly config: Config;
	readonly onAdd: () => void;
	readonly hint?: ReactNode;
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

const EmptySlotRow = ({ slot }: { slot: number }) => (
	<>
		<SlotNumberCell slot={slot} />
		<div className="col-start-2 col-span-3 py-2">
			<Paragraph
				as="span"
				size="xs"
				tone="muted"
				className="block w-full rounded-lg border border-dashed border-edge-strong px-4 py-2 text-center"
			>
				empty slot
			</Paragraph>
		</div>
	</>
);

type RoleListProps = {
	rows: readonly RoleRow[];
	onRemove?: (configId: string) => void;
	slots?: number;
	actionsFor?: (config: Config) => readonly ChipAction[];
	getUseAction?: (config: Config) => RowUseAction | undefined;
	trailingFor?: (config: Config) => ReactNode;
	newConfigIds?: readonly string[];
	/** Configs an audit has switched off right now (ADR-038). Only the answering
	 * screen passes them: before the gate there is nothing down yet, and showing
	 * a roll the player has not reached would be a spoiler. */
	offlineConfigIds?: readonly string[];
	preview?: SlotPreview;
	trailing?: ReactNode;
	foldIdleRows?: boolean;
};

const removeButton = (row: RoleRow, onRemove: (configId: string) => void) => (
	<button
		type="button"
		onClick={() => onRemove(row.config.id)}
		aria-label={`Remove ${row.config.label}`}
		className="shrink-0 cursor-pointer text-xl text-pewter transition-colors hover:text-cinnabar"
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
	offlineConfigIds,
	preview,
	trailing,
	foldIdleRows = false,
}: RoleListProps) => {
	const emptySlots = slots
		? Math.max(0, slots - rows.length - (preview ? 1 : 0))
		: 0;
	const isOffline = (config: Config): boolean =>
		offlineConfigIds?.includes(config.id) ?? false;

	// One badge slot, and offline wins it: a config that is switched off has
	// nothing to celebrate about being new.
	const chipBadge = (config: Config): ReactNode => {
		if (isOffline(config)) return <Badge tone="neutral">offline</Badge>;
		return newConfigIds?.includes(config.id) ? (
			<Badge tone="positive">new</Badge>
		) : undefined;
	};

	const previewSlot = rows.length + 1;
	const firstEmptySlot = previewSlot + (preview ? 1 : 0);

	return (
		<PipelineTable numbered>
			{rows.map((row, index) => {
				// A switched-off config sells nothing: its "use" press would charge the
				// fee for an effect the audit has already taken away.
				const action = isOffline(row.config)
					? undefined
					: getUseAction?.(row.config);
				return (
					<PipelineReportRow
						key={row.config.id}
						slotNumber={index + 1}
						badge={roleBadge(row)}
						layout="table"
						config={row.config}
						description={describeRow(row.config, row.reason)}
						gives={row.gives}
						costs={row.costs}
						chipActions={actionsFor?.(row.config)}
						chipBadge={chipBadge(row.config)}
						offline={isOffline(row.config)}
						// An offline row opens by itself: the struck-through effect is the
						// point, and it is worth nothing folded away.
						defaultOpen={
							isOffline(row.config) ? true : foldIdleRows ? false : undefined
						}
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
					slotNumber={previewSlot}
					badge="skip"
					layout="table"
					ghost
					config={preview.config}
					description={describeConfig(preview.config)}
					gives={givesOf(preview.config)}
					costs={preview.config.costs}
					trailing={preview.hint}
					activateLabel={`Add ${preview.config.label} to your pipeline`}
					onActivate={preview.onAdd}
				/>
			) : null}
			{Array.from({ length: emptySlots }, (_, index) => (
				<EmptySlotRow key={`empty-${index}`} slot={firstEmptySlot + index} />
			))}
			{trailing}
		</PipelineTable>
	);
};
