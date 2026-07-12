import type { Config } from "~/modules/session-run/configs/config.model";
import { ConfigChip } from "../configs/ConfigChip.ui";

type PipelineProps = {
	configs: readonly Config[];
	slots: number;
	/** Ids added on the open reward screen — flagged with a "new" badge. */
	newConfigIds?: readonly string[];
	onRemove?: (configId: string) => void;
};

export const Pipeline = ({
	configs,
	slots,
	newConfigIds,
	onRemove,
}: PipelineProps) => (
	<div className="flex flex-wrap gap-3">
		{Array.from({ length: slots }, (_, index) => {
			const config = configs[index];
			return config ? (
				<div key={config.id} className="relative">
					{newConfigIds?.includes(config.id) ? (
						<span className="absolute -right-1 -top-2 z-10 rounded bg-viridian px-1.5 py-0.5 text-[10px] font-bold text-black">
							new
						</span>
					) : null}
					<ConfigChip
						config={config}
						action={onRemove ? "✕" : undefined}
						onClick={onRemove ? () => onRemove(config.id) : undefined}
					/>
				</div>
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
