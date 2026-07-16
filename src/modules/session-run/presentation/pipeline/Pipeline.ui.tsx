import type { ReactNode } from "react";
import type { Config } from "~/modules/session-run/configs/config.model";
import { Badge } from "~/ui/Badge.component";
import { Tooltip } from "~/ui/Tooltip.component";
import { type ChipAction, ConfigActions } from "../configs/ConfigActions.ui";
import { ConfigChip } from "../configs/ConfigChip.ui";

type PipelineProps = {
	configs: readonly Config[];
	slots: number;
	newConfigIds?: readonly string[];
	onRemove?: (configId: string) => void;
	/** When set, each config chip becomes an action popover (shop: sell/upgrade). */
	actionsFor?: (config: Config) => readonly ChipAction[];
	/** A tile rendered after the slots — the shop's "expand pipeline" control. */
	trailing?: ReactNode;
};

export const Pipeline = ({
	configs,
	slots,
	newConfigIds,
	onRemove,
	actionsFor,
	trailing,
}: PipelineProps) => {
	const fixed = configs.filter((config) => config.fixed);
	const free = configs.filter((config) => !config.fixed);
	const newBadge = (config: Config) =>
		newConfigIds?.includes(config.id) ? (
			<Badge tone="positive">new</Badge>
		) : undefined;
	return (
		<div className="flex flex-wrap gap-3">
			{fixed.map((config) =>
				actionsFor ? (
					<ConfigActions
						key={config.id}
						config={config}
						actions={actionsFor(config)}
					/>
				) : (
					<ConfigChip key={config.id} config={config} />
				)
			)}
			{Array.from({ length: slots }, (_, index) => {
				const config = free[index];
				if (config && actionsFor)
					return (
						<ConfigActions
							key={config.id}
							config={config}
							badge={newBadge(config)}
							actions={actionsFor(config)}
						/>
					);
				return config ? (
					<ConfigChip
						key={config.id}
						config={config}
						badge={newBadge(config)}
						action={onRemove ? "✕" : undefined}
						onClick={onRemove ? () => onRemove(config.id) : undefined}
					/>
				) : (
					<Tooltip
						key={`empty-${index}`}
						content="You can add configs here from the shop!"
					>
						<span className="rounded-lg border-2 border-dashed border-zinc-600 px-6 py-2 text-sm text-zinc-500">
							empty
						</span>
					</Tooltip>
				);
			})}
			{trailing}
		</div>
	);
};
