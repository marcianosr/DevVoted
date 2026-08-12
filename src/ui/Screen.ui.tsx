import { useEffect, useState, type ReactNode } from "react";

import { cva } from "class-variance-authority";

import type { SwatchTheme } from "~/modules/run/gate/swatch.model";

import { Button, type ButtonVariant } from "./Button.component";
import { Popover } from "./Popover.component";
import { Paragraph } from "./typography/Paragraph.component";
import {
	clearScreenNavDirection,
	peekScreenNavDirection,
	setScreenNavDirection,
	type ScreenNavDirection,
} from "./screenNavDirection";

export type ScreenWidth = "narrow" | "default" | "wide";
export type ScreenTheme = "cinnabar" | "celadon";
export type ScreenTransition =
	"none" | "fade" | "slide-up" | "slide-right" | "slide-left";
export type ScreenAction = {
	label: string;
	onClick: () => void;
	disabled?: boolean;
	hint?: ReactNode;
	/** The footer button's tone — "danger" marks a click that ends the run (ADR-031). */
	variant?: ButtonVariant;
};

const screenSection = cva("w-full mx-auto px-4 py-4 sm:py-8", {
	variants: {
		width: {
			narrow: "sm:max-w-2xl",
			default: "sm:max-w-6xl",
			wide: "sm:max-w-6xl",
		} satisfies Record<ScreenWidth, string>,
		center: {
			true: "flex-1 flex flex-col justify-center",
			false: "",
		},
	},
});

type FooterLayout = "both" | "right" | "left-or-none";

const footerLayoutOf = (
	hasLeft: boolean,
	right?: ScreenAction
): FooterLayout => {
	if (hasLeft && right) return "both";
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
	gateTheme?: SwatchTheme;
	theme?: ScreenTheme;
	leftAction?: ScreenAction;
	rightAction?: ScreenAction;
	footerNote?: ReactNode;
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
	gateTheme,
	theme,
	leftAction,
	rightAction,
	footerNote,
	center = false,
}: ScreenProps) => {
	const [effectiveTransition] = useState<ScreenTransition>(() => {
		const direction = peekScreenNavDirection();
		return direction ? DIRECTION_TRANSITION[direction] : transition;
	});

	useEffect(() => {
		clearScreenNavDirection();
	}, []);

	useEffect(() => {
		if (!gateTheme) return;
		document.body.setAttribute("data-gate-theme", gateTheme);
		return () => document.body.removeAttribute("data-gate-theme");
	}, [gateTheme]);

	useEffect(() => {
		if (!theme) return;
		document.body.setAttribute("data-screen-theme", theme);
		return () => document.body.removeAttribute("data-screen-theme");
	}, [theme]);

	const runAction = (action: ScreenAction, direction: ScreenNavDirection) => {
		setScreenNavDirection(direction);
		action.onClick();
	};

	const leftSide =
		footerNote || leftAction ? (
			<span className="flex items-center gap-4">
				{footerNote && (
					<Paragraph as="span" tone="muted">
						{footerNote}
					</Paragraph>
				)}
				{leftAction && (
					<Button
						onClick={() => runAction(leftAction, "back")}
						disabled={leftAction.disabled}
						variant={leftAction.variant}
					>
						{leftAction.label}
					</Button>
				)}
			</span>
		) : null;

	return (
		<section
			data-gate-theme={gateTheme}
			data-screen-theme={theme}
			data-screen-transition={effectiveTransition}
			className={screenSection({ width, center })}
		>
			{children}
			{(leftSide || rightAction) && (
				<div
					className={screenFooter({
						layout: footerLayoutOf(leftSide !== null, rightAction),
					})}
				>
					{leftSide}
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
									variant={rightAction.variant}
								>
									{rightAction.label}
								</Button>
							</Popover>
						) : (
							<Button
								onClick={() => runAction(rightAction, "forward")}
								disabled={rightAction.disabled}
								variant={rightAction.variant}
							>
								{rightAction.label}
							</Button>
						))}
				</div>
			)}
		</section>
	);
};
