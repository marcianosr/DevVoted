import { format } from "date-fns";

export const getTodayDateString = () => {
	// return "2025-11-02";
	return format(new Date(), "yyyy-MM-dd");
};
