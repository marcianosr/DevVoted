import { plural } from "~/shared/lib/displayValue";
import { formatStorageDetailed } from "~/shared/lib/storage";

const COPY = {
	heading: "Storage",
	blurb: "Unused storage saved to disk at the end of each run.",
	loading: "Loading storage…",
	error: "Couldn't load your storage — try again later.",
	border: "border",
} as const;

export type ArchiveSummaryProps =
	| { status: "loading" }
	| { status: "error" }
	| { status: "ready"; archivedStorage: number; ownedBorderCount: number };

export const ArchiveSummary = (props: ArchiveSummaryProps) => {
	if (props.status === "loading") {
		return (
			<div className="border border-theme p-4">
				<p>{COPY.loading}</p>
			</div>
		);
	}

	if (props.status === "error") {
		return (
			<div className="border border-cinnabar p-4">
				<p className="text-cinnabar text-sm">{COPY.error}</p>
			</div>
		);
	}

	return (
		<div className="space-y-2">
			<h2 className="text-4xl">{COPY.heading}</h2>
			<p className="text-xl">{COPY.blurb}</p>
			<p className="text-3xl text-celadon">
				{formatStorageDetailed(props.archivedStorage)}
			</p>
			<p className="text-xl">
				{plural(props.ownedBorderCount, COPY.border)} owned
			</p>
		</div>
	);
};
