import { ReactNode } from "react";

import { Screen } from "~/ui/Screen.ui";
import type { ScreenTransition, ScreenWidth } from "~/ui/Screen.ui";

type ContentSectionProps = {
	categoryCode?: string;
	width?: ScreenWidth;
	transition?: ScreenTransition;
	center?: boolean;
	children: ReactNode;
};

export const ContentSection = ({
	categoryCode,
	width,
	transition,
	center,
	children,
}: ContentSectionProps) => (
	<Screen
		categoryCode={categoryCode}
		width={width}
		transition={transition}
		center={center}
	>
		{children}
	</Screen>
);
