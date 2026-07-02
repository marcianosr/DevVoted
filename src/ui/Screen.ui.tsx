import type { ReactNode } from "react";

export type ScreenWidth = "narrow" | "default" | "wide";
export type ScreenTransition = "none" | "fade" | "slide-up";

const WIDTH_CLASSES: Record<ScreenWidth, string> = {
	narrow: "sm:max-w-2xl",
	default: "sm:max-w-5xl",
	wide: "sm:max-w-7xl",
};

type ScreenProps = {
	children: ReactNode;
	width?: ScreenWidth;
	transition?: ScreenTransition;
	categoryCode?: string;
};

/**
 * The shared outer frame for every full-page screen: responsive centered width,
 * optional category theme, and an optional CSS mount-in transition (driven by
 * @starting-style in app.css via the data-screen-transition attribute).
 *
 * All screen wrappers (Content, ContentSection) delegate here so screen sizing
 * and motion live in one place.
 */
export const Screen = ({
	children,
	width = "default",
	transition = "none",
	categoryCode,
}: ScreenProps) => (
	<section
		data-category-theme={categoryCode}
		data-screen-transition={transition}
		className={`w-full ${WIDTH_CLASSES[width]} mx-auto p-4`}
	>
		{children}
	</section>
);
