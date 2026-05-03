import ActiveCard from "~/domains/configs/components/Cards/ActiveCard";
import {
	getActiveConfigs,
	getStorageInfo,
} from "~/domains/economy/services/configManager.service";
import type { Run } from "~/domains/runs/models/run";
import { formatStorage } from "~/lib/storage";

type ConfigDeckFooterProps = {
	activeRun: Run;
};

export const ConfigDeckFooter = ({ activeRun }: ConfigDeckFooterProps) => {
	const activeConfigs = getActiveConfigs(activeRun);
	const { storageUsed, storageLimit } = getStorageInfo(activeRun);
	const usagePct = storageLimit > 0 ? (storageUsed / storageLimit) * 100 : 0;

	if (activeConfigs.length === 0) return null;

	return (
		<div className="fixed bottom-0 left-0 right-0 bg-black border-t border-theme z-50">
			<div className="max-w-5xl mx-auto px-4 py-2 space-y-2">
				<div className="flex items-center justify-between gap-4">
					<p className="text-base text-zinc-400 shrink-0">Active configs</p>
					<div className="flex items-center gap-2 text-sm text-zinc-500 min-w-0">
						<div className="w-24 h-1.5 bg-zinc-800 relative shrink-0">
							<div
								className="absolute inset-y-0 left-0 bg-cyan-400"
								style={{ width: `${Math.min(usagePct, 100)}%` }}
							/>
						</div>
						<span className="shrink-0">
							{formatStorage(storageUsed)} / {formatStorage(storageLimit)}
						</span>
					</div>
				</div>
				<ul className="flex gap-3 overflow-x-auto">
					{activeConfigs.map((config) => (
						<li key={config.id} className="shrink-0">
							<ActiveCard config={config} size="small" />
						</li>
					))}
				</ul>
			</div>
		</div>
	);
};
