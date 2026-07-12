import type { Config } from "~/modules/session-run/configs/config.model";
import { ConfigChip } from "../configs/ConfigChip.ui";

type PipelineProps = {
	configs: readonly Config[];
	slots: number;
	onRemove?: (configId: string) => void;
};

export const Pipeline = ({ configs, slots, onRemove }: PipelineProps) => (
	<div className="flex flex-wrap gap-3">
		{Array.from({ length: slots }, (_, index) => {
			const config = configs[index];
			return config ? (
				<ConfigChip
					key={config.id}
					config={config}
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
