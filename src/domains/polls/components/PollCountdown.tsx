import { useCountdownToMidnight } from "~/hooks/useCountdown";

export const PollCountdown = () => {
	const countdown = useCountdownToMidnight();

	if (countdown.isExpired) {
		return null;
	}

	return (
		<div className="p-4 text-lg text-white sticky top-0 bg-black border-b border-white z-10">
			Next poll in {countdown.hours}h {countdown.minutes}m
		</div>
	);
};
