import { ContentSection } from "~/ui/ContentSection.component";
import type { ScreenTransition, ScreenWidth } from "~/ui/Screen.ui";

type ContentProps = {
	width?: ScreenWidth;
	transition?: ScreenTransition;
	center?: boolean;
	children: React.ReactNode;
};

const Content = ({ width, transition, center, children }: ContentProps) => (
	<ContentSection width={width} transition={transition} center={center}>
		{children}
	</ContentSection>
);

export default Content;
