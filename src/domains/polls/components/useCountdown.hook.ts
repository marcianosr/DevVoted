import { useEffect, useRef, useState } from "react";

type CountdownResult = {
	hours: number;
	minutes: number;
	seconds: number;
	isExpired: boolean;
};

const getTimeUntilMidnight = (): CountdownResult => {
	const now = new Date();
	const midnight = new Date(now);
	midnight.setDate(midnight.getDate() + 1);
	midnight.setHours(0, 0, 0, 0);

	const diff = midnight.getTime() - now.getTime();

	if (diff <= 0) {
		return { hours: 0, minutes: 0, seconds: 0, isExpired: true };
	}

	const hours = Math.floor(diff / (1000 * 60 * 60));
	const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
	const seconds = Math.floor((diff % (1000 * 60)) / 1000);

	return { hours, minutes, seconds, isExpired: false };
};

export const useCountdownToMidnight = (
	onExpire?: () => void
): CountdownResult => {
	const [timeLeft, setTimeLeft] =
		useState<CountdownResult>(getTimeUntilMidnight);
	const hasExpiredRef = useRef(false);

	useEffect(() => {
		const interval = setInterval(() => {
			const newTime = getTimeUntilMidnight();
			setTimeLeft(newTime);

			if (newTime.isExpired && !hasExpiredRef.current) {
				hasExpiredRef.current = true;
				onExpire?.();
				// Reset after a short delay to start counting to next midnight
				setTimeout(() => {
					hasExpiredRef.current = false;
				}, 2000);
			}
		}, 1000);

		return () => clearInterval(interval);
	}, [onExpire]);

	return timeLeft;
};

export const formatCountdown = ({
	hours,
	minutes,
	seconds,
}: CountdownResult): string => {
	const pad = (n: number) => n.toString().padStart(2, "0");
	return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
};
