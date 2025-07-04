type PollStatusProps = {
	hasAnswered: boolean;
};

export const PollStatus = ({ hasAnswered }: PollStatusProps) => {
	if (!hasAnswered) return null;

	return (
		<div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
			<p className="text-blue-800 font-medium">
				✅ You have already answered this poll
			</p>
		</div>
	);
};