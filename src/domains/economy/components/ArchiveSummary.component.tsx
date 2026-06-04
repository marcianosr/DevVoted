import { useArchiveState } from "~/domains/economy/hooks/useArchiveState";
import { formatStorageDetailed } from "~/lib/storage";

type ArchiveSummaryProps = {
	userId: string;
};

export const ArchiveSummary = ({ userId }: ArchiveSummaryProps) => {
	const { data, isLoading, error } = useArchiveState(userId);

	if (isLoading) {
		return (
			<div className="border border-cyan-900 p-4">
				<p>Loading storage…</p>
			</div>
		);
	}

	if (error || !data) {
		return (
			<div className="border border-red-900 p-4">
				<p className="text-red-400 text-sm">
					Couldn&apos;t load your storage — try again later.
				</p>
			</div>
		);
	}

	return (
		<div className="space-y-2">
			<h2 className="text-4xl">Storage</h2>
			<p className="text-xl">
				Unused storage saved to disk at the end of each run.
			</p>
			<p className="text-3xl text-emerald-300">
				{formatStorageDetailed(data.archivedStorage)}
			</p>
			<p className="text-xl">
				{data.ownedBorderIds.length} border
				{data.ownedBorderIds.length === 1 ? "" : "s"} owned
			</p>
		</div>
	);
};
