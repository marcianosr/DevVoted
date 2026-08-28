import type { ReactNode } from "react";
import type { Config } from "~/modules/run/config/domain/config.model";
import {
	describeConfig,
	givesOf,
} from "~/modules/run/config/domain/config.model";
import type { RoleRow } from "~/modules/run/gate/domain/configRole.model";
import { Badge } from "~/ui/Badge.component";
import { Tooltip } from "~/ui/Tooltip.component";
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
	freeSpots?: number;
	actionsFor?: (config: Config) => readonly ChipAction[];
	getUseAction?: (config: Config) => RowUseAction | undefined;
	trailingFor?: (config: Config) => ReactNode;
	newConfigIds?: readonly string[];
	upgradedConfigId?: string;
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
	freeSpots,
	actionsFor,
	getUseAction,
	trailingFor,
	newConfigIds,
	upgradedConfigId,
	offlineConfigIds,
	preview,
	trailing,
	foldIdleRows = false,
}: RoleListProps) => {
	const emptySlots = Math.max(0, (freeSpots ?? 0) - (preview ? 1 : 0));
	const isOffline = (config: Config): boolean =>
		offlineConfigIds?.includes(config.id) ?? false;

	const chipBadge = (config: Config): ReactNode => {
		if (isOffline(config)) return <Badge tone="neutral">offline</Badge>;
		if (config.id === upgradedConfigId)
			return (
				<Tooltip compact nested content="Upgraded! Dependabot merged it, free.">
					<Badge tone="legendary" pulse>
						upgraded
					</Badge>
				</Tooltip>
			);
		return newConfigIds?.includes(config.id) ? (
			<Badge tone="positive">new</Badge>
		) : undefined;
	};

	const previewSlot = rows.length + 1;
	const firstEmptySlot = previewSlot + (preview ? 1 : 0);

	return (
		<PipelineTable numbered>
			{rows.map((row, index) => {
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
