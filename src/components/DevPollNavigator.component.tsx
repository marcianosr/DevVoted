import { useNavigate } from "@tanstack/react-router";
import { addDays, format } from "date-fns";

import { DevPollNavigatorUI } from "~/ui/DevPollNavigatorUI.component";

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
		<DevPollNavigatorUI
			currentDate={currentDate}
			hasCustomDate={hasCustomDate}
			onRandomPoll={handleRandomPoll}
			onResetToToday={handleResetToToday}
		/>
	);
};
