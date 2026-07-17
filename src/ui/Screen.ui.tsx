import { useEffect, useState, type ReactNode } from "react";

import { cva } from "class-variance-authority";

import { Button } from "./Button.component";
import { Popover } from "./Popover.component";
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

const screenSection = cva("w-full mx-auto px-4 py-8", {
	variants: {
		width: {
			narrow: "sm:max-w-2xl",
			default: "sm:max-w-5xl",
			wide: "sm:max-w-5xl",
		} satisfies Record<ScreenWidth, string>,
		center: {
			true: "flex-1 flex flex-col justify-center",
			false: "",
		},
	},
});

type FooterLayout = "both" | "right" | "left-or-none";

const footerLayoutOf = (
	left?: ScreenAction,
	right?: ScreenAction
): FooterLayout => {
	if (left && right) return "both";
	return right ? "right" : "left-or-none";
};

const screenFooter = cva("mt-8 flex items-center", {
	variants: {
		layout: {
			both: "justify-between",
			right: "justify-end",
			"left-or-none": "justify-start",
		} satisfies Record<FooterLayout, string>,
	},
});

type ScreenProps = {
	children: ReactNode;
	width?: ScreenWidth;
	transition?: ScreenTransition;
	categoryCode?: string;
	leftAction?: ScreenAction;
	rightAction?: ScreenAction;
	center?: boolean;
};

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
			className={screenSection({ width, center })}
		>
			{children}
			{(leftAction || rightAction) && (
				<div
					className={screenFooter({
						layout: footerLayoutOf(leftAction, rightAction),
					})}
				>
					{leftAction && (
						<Button
							onClick={() => runAction(leftAction, "back")}
							disabled={leftAction.disabled}
						>
							{leftAction.label}
						</Button>
					)}
					{rightAction &&
						(rightAction.hint ? (
							<Popover
								triggerAs="span"
								ariaLabel={`Why "${rightAction.label}" is unavailable`}
								content={<p className="max-w-xs text-sm">{rightAction.hint}</p>}
							>
								<Button
									onClick={() => runAction(rightAction, "forward")}
									disabled={rightAction.disabled}
								>
									{rightAction.label}
								</Button>
							</Popover>
						) : (
							<Button
								onClick={() => runAction(rightAction, "forward")}
								disabled={rightAction.disabled}
							>
								{rightAction.label}
							</Button>
						))}
				</div>
			)}
		</section>
	);
};
