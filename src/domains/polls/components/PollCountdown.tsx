import { useRouter } from "@tanstack/react-router";

import { useCountdownToMidnight } from "~/hooks/useCountdown";

export const PollCountdown = () => {
	const router = useRouter();
	const countdown = useCountdownToMidnight(() => {
		router.invalidate();
	});

	if (countdown.isExpired) {
		return (
			<div className="p-4 text-lg text-white sticky top-0 bg-black border-b border-white z-10">
				Loading new poll...
			</div>
		);
	}

	return (
		<div className="p-4 text-lg text-white sticky top-0 bg-black border-b border-white z-10">
			Next poll in {countdown.hours}h {countdown.minutes}m
		</div>
	);
};
