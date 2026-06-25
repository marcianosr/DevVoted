import { formatStorage, formatStorageDetailed } from "~/lib/storage";

export type StorageBreakdownProps = {
	storageUsed: number;
	storageLimit: number;
	storageAvailable: number;
	configsStorage: number;
	rerollsStorage: number;
	deinstallPenalty: number;
	injectedArchive?: number;
	recentGain?: number | null;
};

export const StorageBreakdown = ({
	storageUsed,
	storageLimit,
	storageAvailable,
	configsStorage,
	rerollsStorage,
	deinstallPenalty,
	injectedArchive = 0,
	recentGain = null,
}: StorageBreakdownProps) => {
	const usagePercentage =
		storageLimit > 0 ? (storageUsed / storageLimit) * 100 : 0;

	return (
		<div className="space-y-4">
			<div className="flex items-baseline justify-between gap-2">
				<h3 className="text-xl text-cyan-400">Storage</h3>
				{recentGain !== null && recentGain > 0 && (
					<span className="text-emerald-300 text-sm border border-emerald-400 px-2 py-0.5 animate-pulse">
						+{formatStorage(recentGain)} just earned
					</span>
				)}
			</div>

			<div className="space-y-1">
				<div className="flex items-center gap-4">
					<div className="flex-1 h-4 border border-white/50 relative">
						<div
							className="h-full bg-white/80 transition-all duration-500"
							style={{ width: `${Math.min(usagePercentage, 100)}%` }}
						/>
					</div>
					<span className="text-sm whitespace-nowrap">
						{formatStorage(storageUsed)} /{" "}
						<span className={recentGain !== null ? "text-emerald-300" : ""}>
							{formatStorageDetailed(storageLimit)}
						</span>
					</span>
				</div>

				{storageAvailable > 0 && (
					<p className="text-green-500 text-sm">
						{formatStorageDetailed(storageAvailable)} available
					</p>
				)}
			</div>

			<div className="space-y-2">
				<h4 className="text-sm text-gray-400">Breakdown</h4>
				<dl className="space-y-1 text-sm">
					{injectedArchive > 0 && (
						<div className="flex justify-between text-amber-300">
							<dt>Injected from archive</dt>
							<dd>+{formatStorage(injectedArchive)}</dd>
						</div>
					)}
					<div className="flex justify-between">
						<dt>Active configs</dt>
						<dd>{formatStorage(configsStorage)}</dd>
					</div>
					<div className="flex justify-between">
						<dt>Rebuilds</dt>
						<dd>{formatStorage(rerollsStorage)}</dd>
					</div>
					<div className="flex justify-between">
						<dt>Junk</dt>
						<dd>{formatStorage(deinstallPenalty)}</dd>
					</div>
				</dl>
			</div>
		</div>
	);
};
