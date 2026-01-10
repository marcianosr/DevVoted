import { PollAccuracyStats } from "../api/queries";

type PollAccuracyRatioProps = {
	accuracyStats: PollAccuracyStats;
};

const PollAccuracyRatio = ({ accuracyStats }: PollAccuracyRatioProps) => {
	const { full, partial, wrong, total } = accuracyStats;

	if (total === 0) {
		return null;
	}

	const correctPercentage = Math.round((full / total) * 100);
	const partialPercentage = Math.round((partial / total) * 100);
	const wrongPercentage = Math.round((wrong / total) * 100);

	return (
		<div className="mt-6 pt-4 border-t border-theme/50">
			<p className="text-lg mb-2">Today&apos;s accuracy</p>
			<div className="flex gap-4 items-center">
				{correctPercentage > 0 && (
					<span className="text-green-400 text-xl font-medium">
						{correctPercentage}% correct
					</span>
				)}
				{partialPercentage > 0 && (
					<span className="text-yellow-400 text-xl font-medium">
						{partialPercentage}% partial
					</span>
				)}
				{wrongPercentage > 0 && (
					<span className="text-red-400 text-xl font-medium">
						{wrongPercentage}% wrong
					</span>
				)}
			</div>
			<div className="flex h-3 mt-2 rounded overflow-hidden">
				{correctPercentage > 0 && (
					<div
						className="bg-green-400"
						style={{ width: `${correctPercentage}%` }}
					/>
				)}
				{partialPercentage > 0 && (
					<div
						className="bg-yellow-400"
						style={{ width: `${partialPercentage}%` }}
					/>
				)}
				{wrongPercentage > 0 && (
					<div
						className="bg-red-400"
						style={{ width: `${wrongPercentage}%` }}
					/>
				)}
			</div>
		</div>
	);
};

export default PollAccuracyRatio;
