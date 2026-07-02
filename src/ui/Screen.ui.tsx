import type { ReactNode } from "react";

import { clsx } from "clsx";

import { PrimaryButton } from "./PrimaryButton.component";

export type ScreenWidth = "narrow" | "default" | "wide";
export type ScreenTransition = "none" | "fade" | "slide-up";
export type ScreenAction = {
	label: string;
	onClick: () => void;
	disabled?: boolean;
};

const WIDTH_CLASSES: Record<ScreenWidth, string> = {
	narrow: "sm:max-w-2xl",
	default: "sm:max-w-5xl",
	wide: "sm:max-w-7xl",
};

// Pin actions to their screen edge: both apart, or a lone action to its side.
const footerJustify = (left?: ScreenAction, right?: ScreenAction) => {
	if (left && right) return "justify-between";
	return right ? "justify-end" : "justify-start";
};

type ScreenProps = {
	children: ReactNode;
	width?: ScreenWidth;
	transition?: ScreenTransition;
	categoryCode?: string;
	leftAction?: ScreenAction;
	rightAction?: ScreenAction;
	/** Grow to fill the layout and vertically center the content (short pages). */
	center?: boolean;
};

/**
 * The shared outer frame for every full-page screen: responsive centered width,
 * optional category theme, an optional CSS mount-in transition (driven by
 * @starting-style in app.css via the data-screen-transition attribute), and an
 * optional footer with actions pinned to each screen edge.
 *
 * All screen wrappers (Content, ContentSection) delegate here so screen sizing
 * and motion live in one place.
 */
export const Screen = ({
	children,
	width = "default",
	transition = "none",
	categoryCode,
	leftAction,
	rightAction,
	center = false,
}: ScreenProps) => (
	<section
		data-category-theme={categoryCode}
		data-screen-transition={transition}
		className={clsx(
			"w-full mx-auto p-4",
			WIDTH_CLASSES[width],
			center && "flex-1 flex flex-col justify-center"
		)}
	>
		{children}
		{(leftAction || rightAction) && (
			<div
				className={`mt-8 flex items-center ${footerJustify(leftAction, rightAction)}`}
			>
				{leftAction && (
					<PrimaryButton
						onClick={leftAction.onClick}
						disabled={leftAction.disabled}
					>
						{leftAction.label}
					</PrimaryButton>
				)}
				{rightAction && (
					<PrimaryButton
						onClick={rightAction.onClick}
						disabled={rightAction.disabled}
					>
						{rightAction.label}
					</PrimaryButton>
				)}
			</div>
		)}
	</section>
);
