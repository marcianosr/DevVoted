import type { Config } from "~/modules/session-run/configs/config.model";
import { Badge } from "~/ui/Badge.component";
import { ConfigChip } from "../configs/ConfigChip.ui";

type PipelineProps = {
	configs: readonly Config[];
	slots: number;
	newConfigIds?: readonly string[];
	onRemove?: (configId: string) => void;
};

export const Pipeline = ({
	configs,
	slots,
	newConfigIds,
	onRemove,
}: PipelineProps) => {
	const fixed = configs.filter((config) => config.fixed);
	const free = configs.filter((config) => !config.fixed);
	return (
		<div className="flex flex-wrap gap-3">
			{fixed.map((config) => (
				<ConfigChip
					key={config.id}
					config={config}
					badge={<Badge>fixed</Badge>}
				/>
			))}
			{Array.from({ length: slots }, (_, index) => {
				const config = free[index];
				return config ? (
					<ConfigChip
						key={config.id}
						config={config}
						badge={
							newConfigIds?.includes(config.id) ? (
								<Badge tone="positive">new</Badge>
							) : undefined
						}
						action={onRemove ? "✕" : undefined}
						onClick={onRemove ? () => onRemove(config.id) : undefined}
					/>
				) : (
					<div
						key={`empty-${index}`}
						className="rounded-lg border-2 border-dashed border-zinc-600 px-6 py-2 text-sm text-zinc-500"
					>
						empty
					</div>
				);
			})}
		</div>
	);
};
