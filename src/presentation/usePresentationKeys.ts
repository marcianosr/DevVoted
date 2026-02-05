import { useCallback, useEffect, useState } from "react";

import type { PresentationActions, PresentationState } from "./types";

type UsePresentationKeysOptions = {
	totalSlides: number;
	initialSlide?: number;
};

type UsePresentationKeysReturn = PresentationState &
	PresentationActions & {
		isFullscreen: boolean;
		toggleFullscreen: () => void;
	};

export const usePresentationKeys = ({
	totalSlides,
	initialSlide = 0,
}: UsePresentationKeysOptions): UsePresentationKeysReturn => {
	const [currentIndex, setCurrentIndex] = useState(initialSlide);
	const [isFullscreen, setIsFullscreen] = useState(false);

	const isFirst = currentIndex === 0;
	const isLast = currentIndex === totalSlides - 1;

	const next = useCallback(() => {
		setCurrentIndex((prev) => Math.min(prev + 1, totalSlides - 1));
	}, [totalSlides]);

	const prev = useCallback(() => {
		setCurrentIndex((prev) => Math.max(prev - 1, 0));
	}, []);

	const goTo = useCallback(
		(index: number) => {
			const clampedIndex = Math.max(0, Math.min(index, totalSlides - 1));
			setCurrentIndex(clampedIndex);
		},
		[totalSlides]
	);

	const goToFirst = useCallback(() => {
		setCurrentIndex(0);
	}, []);

	const goToLast = useCallback(() => {
		setCurrentIndex(totalSlides - 1);
	}, [totalSlides]);

	const toggleFullscreen = useCallback(() => {
		if (!document.fullscreenElement) {
			document.documentElement.requestFullscreen().catch(() => {
				// Fullscreen request failed - browser may block it
			});
		} else {
			document.exitFullscreen();
		}
	}, []);

	// Sync fullscreen state with browser
	useEffect(() => {
		const handleFullscreenChange = () => {
			setIsFullscreen(Boolean(document.fullscreenElement));
		};

		document.addEventListener("fullscreenchange", handleFullscreenChange);
		return () =>
			document.removeEventListener("fullscreenchange", handleFullscreenChange);
	}, []);

	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			// Ignore if user is typing in an input
			if (
				event.target instanceof HTMLInputElement ||
				event.target instanceof HTMLTextAreaElement
			) {
				return;
			}

			switch (event.key) {
				case "ArrowRight":
				case " ":
					event.preventDefault();
					next();
					break;
				case "ArrowLeft":
					event.preventDefault();
					prev();
					break;
				case "Home":
					event.preventDefault();
					goToFirst();
					break;
				case "End":
					event.preventDefault();
					goToLast();
					break;
				case "f":
				case "F":
					event.preventDefault();
					toggleFullscreen();
					break;
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [next, prev, goToFirst, goToLast, toggleFullscreen]);

	return {
		currentIndex,
		total: totalSlides,
		isFirst,
		isLast,
		isFullscreen,
		next,
		prev,
		goTo,
		goToFirst,
		goToLast,
		toggleFullscreen,
	};
};
