interface StartRunScreenProps {
	isStarting: boolean;
	onStartRun: () => void;
}

export const StartRunScreen: React.FC<StartRunScreenProps> = ({
	isStarting,
	onStartRun,
}) => {
	return (
		<div className="p-4">
			<h1 className="text-2xl font-bold mb-4">Start Your Quiz Run</h1>
			<div className="text-center py-8">
				<h2 className="text-xl mb-4">
					You need an active run to answer polls
				</h2>
				<p className="text-gray-600 mb-6">
					Each run starts with 0 XP in all categories. Answer polls
					correctly to earn XP and build your streak!
				</p>
				<button
					onClick={onStartRun}
					disabled={isStarting}
					className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
				>
					{isStarting ? "Starting Run..." : "Start Run"}
				</button>
			</div>
		</div>
	);
};