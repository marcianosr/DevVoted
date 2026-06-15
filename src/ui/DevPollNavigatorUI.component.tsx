type DevPollNavigatorUIProps = {
	currentDate: string;
	hasCustomDate: boolean;
	onRandomPoll: () => void;
	onResetToToday: () => void;
};

export const DevPollNavigatorUI = ({
	currentDate,
	hasCustomDate,
	onRandomPoll,
	onResetToToday,
}: DevPollNavigatorUIProps) => (
	<div className="max-w-5xl mx-auto mb-4 flex gap-2 items-center">
		<button
			type="button"
			onClick={onRandomPoll}
			className="px-3 py-1 text-xs bg-yellow-600 hover:bg-yellow-500 text-black rounded"
		>
			Random Poll
		</button>
		{hasCustomDate && (
			<button
				type="button"
				onClick={onResetToToday}
				className="px-3 py-1 text-xs bg-gray-600 hover:bg-gray-500 text-white rounded"
			>
				Today
			</button>
		)}
		<span className="text-xs text-gray-500">Viewing: {currentDate}</span>
	</div>
);
