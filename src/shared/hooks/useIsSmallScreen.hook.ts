import { useSyncExternalStore } from "react";

const SMALL_SCREEN = "(width < 48rem)";

const smallScreenQuery = () =>
	typeof window === "undefined" || typeof window.matchMedia !== "function"
		? undefined
		: window.matchMedia(SMALL_SCREEN);

const subscribe = (onChange: () => void) => {
	const query = smallScreenQuery();
	query?.addEventListener("change", onChange);

	return () => query?.removeEventListener("change", onChange);
};

export const isSmallScreen = () => smallScreenQuery()?.matches ?? false;

const isSmallScreenOnTheServer = () => false;

export const useIsSmallScreen = () =>
	useSyncExternalStore(subscribe, isSmallScreen, isSmallScreenOnTheServer);
