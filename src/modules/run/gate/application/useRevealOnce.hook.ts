import { useCallback, useLayoutEffect, useState } from "react";

const SEEN_PREFIX = "devvoted:outcome-reveal:";
const SEEN = "1";

const hasSeen = (key: string): boolean => {
	try {
		return window.sessionStorage.getItem(SEEN_PREFIX + key) !== null;
	} catch {
		return false;
	}
};

const markSeen = (key: string) => {
	try {
		window.sessionStorage.setItem(SEEN_PREFIX + key, SEEN);
	} catch {
		return;
	}
};

export type RevealOnce = {
	playing: boolean;
	done: () => void;
};

export const useRevealOnce = (key: string): RevealOnce => {
	const [playingKey, setPlayingKey] = useState<string | null>(null);

	useLayoutEffect(() => {
		if (hasSeen(key)) return;
		markSeen(key);
		setPlayingKey(key);
	}, [key]);

	const done = useCallback(() => setPlayingKey(null), []);

	return { playing: playingKey === key, done };
};
