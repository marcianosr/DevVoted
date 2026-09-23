import { useArchiveState } from "~/modules/account/profile/application/useArchiveState.hook";
import { ArchiveSummary as ArchiveSummaryUI } from "~/modules/account/profile/presentation/ArchiveSummary.ui";

type ArchiveSummaryProps = {
	userId: string;
};

export const ArchiveSummary = ({ userId }: ArchiveSummaryProps) => {
	const { data, isLoading, error } = useArchiveState(userId);

	if (isLoading) return <ArchiveSummaryUI status="loading" />;
	if (error || !data) return <ArchiveSummaryUI status="error" />;

	return (
		<ArchiveSummaryUI
			status="ready"
			archivedStorage={data.archivedStorage}
			ownedBorderCount={data.ownedBorderIds.length}
		/>
	);
};
