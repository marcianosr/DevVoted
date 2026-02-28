import { RunPathDisplayCompact } from "~/domains/gates/components/RunPathDisplay";
import type { CommunityGatePath } from "~/domains/gates/models/runGateHistory";

type CommunityGatePathsProps = {
	paths: CommunityGatePath[];
};

const UserMiniAvatar = ({
	userId,
	displayName,
	photoUrl,
}: {
	userId: string;
	displayName: string | null;
	photoUrl: string | null;
}) => {
	const initial = (displayName ?? userId).charAt(0).toUpperCase();

	if (photoUrl) {
		return (
			<img
				src={photoUrl}
				alt={displayName ?? "User"}
				title={displayName ?? userId}
				className="w-6 h-6 rounded-full shrink-0"
			/>
		);
	}

	return (
		<span
			className="w-6 h-6 rounded-full bg-gray-600 inline-flex items-center justify-center text-white text-xs shrink-0"
			title={displayName ?? userId}
		>
			{initial}
		</span>
	);
};

export const CommunityGatePaths = ({ paths }: CommunityGatePathsProps) => {
	if (paths.length === 0) {
		return null;
	}

	return (
		<section className="mt-6">
			<p className="text-xl mb-3">
				Gate paths taken by the community
				<span className="text-gray-500 text-base">({paths.length})</span>
			</p>
			<ul className="space-y-3">
				{paths.map((path) => (
					<li key={path.userId} className="flex items-center gap-3">
						<UserMiniAvatar
							userId={path.userId}
							displayName={path.displayName}
							photoUrl={path.photoUrl}
						/>
						<span className="text-sm text-gray-300 w-30 truncate">
							{path.displayName ?? "Anonymous"}
						</span>
						<RunPathDisplayCompact
							gatePath={path.gatePath}
							currentGateNumber={path.currentGateNumber}
						/>
					</li>
				))}
			</ul>
		</section>
	);
};
