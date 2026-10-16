import type { KantoColor } from "~/ui/kanto-theme/colors";
import { Figures } from "./Figures.ui";
import { Typography, type TypographyTag } from "~/ui/kanto-theme/Typography.ui";

const VARIANT = "prose";

export type ProseProps = {
	text: string;
	as?: TypographyTag;
	gain?: KantoColor;
};

export const Prose = ({ text, as, gain }: ProseProps) => (
	<Typography variant={VARIANT} as={as}>
		<Figures text={text} gain={gain} />
	</Typography>
);
