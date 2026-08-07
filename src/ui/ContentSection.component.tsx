import { ReactNode } from "react";

import { Screen } from "~/ui/Screen.ui";
import type { ScreenTransition, ScreenWidth } from "~/ui/Screen.ui";

type ContentSectionProps = {
	width?: ScreenWidth;
	transition?: ScreenTransition;
	center?: boolean;
	children: ReactNode;
};

export const ContentSection = ({
	width,
	transition,
	center,
	children,
}: ContentSectionProps) => (
	<Screen width={width} transition={transition} center={center}>
		{children}
	</Screen>
);
