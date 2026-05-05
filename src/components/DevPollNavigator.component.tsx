import { useNavigate } from "@tanstack/react-router";
import { addDays, format } from "date-fns";

type DevPollNavigatorProps = {
	currentDate: string;
	hasCustomDate: boolean;
};

const getRandomDate = () => {
	const daysOffset = Math.floor(Math.random() * 365) - 180;
	return format(addDays(new Date(), daysOffset), "yyyy-MM-dd");
};

export const DevPollNavigator = ({
	currentDate,
	hasCustomDate,
}: DevPollNavigatorProps) => {
	const navigate = useNavigate();

	if (process.env.NODE_ENV !== "development") {
		return null;
	}

	const handleRandomPoll = () => {
		navigate({
			to: "/daily-poll",
			search: { date: getRandomDate() },
		});
	};

	const handleResetToToday = () => {
		navigate({
			to: "/daily-poll",
			search: {},
		});
	};

	return (
		<div className="max-w-5xl mx-auto mb-4 flex gap-2 items-center">
			<button
				type="button"
				onClick={handleRandomPoll}
				className="px-3 py-1 text-xs bg-yellow-600 hover:bg-yellow-500 text-black rounded"
			>
				Random Poll
			</button>
			{hasCustomDate && (
				<button
					type="button"
					onClick={handleResetToToday}
					className="px-3 py-1 text-xs bg-gray-600 hover:bg-gray-500 text-white rounded"
				>
					Today
				</button>
			)}
			<span className="text-xs text-gray-500">Viewing: {currentDate}</span>
		</div>
	);
};
