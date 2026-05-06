import { Slide } from "./Slide";
import { SlideCounter } from "./SlideCounter";
import { slides } from "./slides";
import { usePresentationKeys } from "./usePresentationKeys.hook";

import type { Slide as SlideType } from "./types";

type PresentationProps = {
	customSlides?: SlideType[];
};

export const Presentation = ({ customSlides }: PresentationProps) => {
	const slideData = customSlides ?? slides;
	const { currentIndex, total, isFullscreen, toggleFullscreen } =
		usePresentationKeys({
			totalSlides: slideData.length,
		});

	return (
		<div className="fixed inset-0 bg-gray-950 overflow-hidden">
			<div
				className="flex h-full transition-transform duration-300 ease-out"
				style={{
					transform: `translateX(-${currentIndex * 100}vw)`,
				}}
			>
				{slideData.map((slide) => (
					<div key={slide.id} className="w-screen h-full shrink-0">
						<Slide slide={slide} />
					</div>
				))}
			</div>

			<SlideCounter current={currentIndex + 1} total={total} />

			{/* Fullscreen toggle button */}
			<button
				onClick={toggleFullscreen}
				className="fixed top-6 right-6 p-2 text-gray-500 hover:text-gray-300 transition-colors"
				title={isFullscreen ? "Exit fullscreen (F)" : "Enter fullscreen (F)"}
			>
				{isFullscreen ? (
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="24"
						height="24"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
					>
						<polyline points="4 14 10 14 10 20" />
						<polyline points="20 10 14 10 14 4" />
						<line x1="14" y1="10" x2="21" y2="3" />
						<line x1="3" y1="21" x2="10" y2="14" />
					</svg>
				) : (
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="24"
						height="24"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
					>
						<polyline points="15 3 21 3 21 9" />
						<polyline points="9 21 3 21 3 15" />
						<line x1="21" y1="3" x2="14" y2="10" />
						<line x1="3" y1="21" x2="10" y2="14" />
					</svg>
				)}
			</button>

			<div className="fixed bottom-6 left-6 text-xs text-gray-600 font-mono">
				<span className="opacity-50">
					← → Space to navigate | Home/End for first/last | F for fullscreen
				</span>
			</div>
		</div>
	);
};
