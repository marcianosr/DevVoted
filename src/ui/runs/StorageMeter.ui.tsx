import { formatStorage } from "~/lib/storage";

type StorageMeterProps = {
	used: number; // bytes currently occupied
	limit: number; // total capacity in bytes
	delta?: number; // bytes gained this event, shown as a +badge
};

const toPercentage = (used: number, limit: number) =>
	limit <= 0 ? 0 : Math.max(0, Math.min(100, (used / limit) * 100));

export const StorageMeter = ({ used, limit, delta }: StorageMeterProps) => (
	<div className="flex flex-col gap-2">
		<div className="flex items-baseline justify-between">
			<span className="text-sm text-gray-400">Storage</span>
			<span className="text-sm text-gray-300">
				{formatStorage(used)} / {formatStorage(limit)}
				{delta !== undefined && delta > 0 && (
					<span className="ml-2 text-green-400">+{formatStorage(delta)}</span>
				)}
			</span>
		</div>
		<div className="h-3 w-full bg-zinc-800 overflow-hidden">
			<div
				className="h-full bg-green-500 transition-all"
				style={{ width: `${toPercentage(used, limit)}%` }}
			/>
		</div>
	</div>
);
