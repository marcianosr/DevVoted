import { useEffect, useState, type ReactNode } from "react";

import { clsx } from "clsx";

import { Button } from "./Button.component";
import {
	clearScreenNavDirection,
	peekScreenNavDirection,
	setScreenNavDirection,
	type ScreenNavDirection,
} from "./screenNavDirection";

export type ScreenWidth = "narrow" | "default" | "wide";
export type ScreenTransition =
	"none" | "fade" | "slide-up" | "slide-right" | "slide-left";
export type ScreenAction = {
	label: string;
	onClick: () => void;
	disabled?: boolean;
	hint?: ReactNode;
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
const DIRECTION_TRANSITION: Record<ScreenNavDirection, ScreenTransition> = {
	forward: "slide-right",
	back: "slide-left",
};

export const Screen = ({
	children,
	width = "default",
	transition = "none",
	categoryCode,
	leftAction,
	rightAction,
	center = false,
}: ScreenProps) => {
	// Animate in from the side of the action that led here: the previous Screen
	// records a direction when its left/right action fires, this Screen consumes
	// it on mount. Falls back to the explicit `transition` prop when arrived at
	// without an action (initial load, direct URL). Captured once via the lazy
	// initializer so it survives the clear below.
	const [effectiveTransition] = useState<ScreenTransition>(() => {
		const direction = peekScreenNavDirection();
		return direction ? DIRECTION_TRANSITION[direction] : transition;
	});

	useEffect(() => {
		clearScreenNavDirection();
	}, []);

	const runAction = (action: ScreenAction, direction: ScreenNavDirection) => {
		setScreenNavDirection(direction);
		action.onClick();
	};

	return (
		<section
			data-category-theme={categoryCode}
			data-screen-transition={effectiveTransition}
			className={clsx(
				"w-full mx-auto px-4 py-8 md:py-16",
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
						<Button
							onClick={() => runAction(leftAction, "back")}
							disabled={leftAction.disabled}
						>
							{leftAction.label}
						</Button>
					)}
					{rightAction && (
						<div className="flex flex-col items-end gap-1">
							{rightAction.hint && (
								<small className="text-sm">{rightAction.hint}</small>
							)}
							<Button
								onClick={() => runAction(rightAction, "forward")}
								disabled={rightAction.disabled}
							>
								{rightAction.label}
							</Button>
						</div>
					)}
				</div>
			)}
		</section>
	);
};
