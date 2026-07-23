import type { ParagraphTone } from "~/ui/typography/Paragraph.component";

const ACCURACY_HIGH = 70;
const ACCURACY_MID = 40;

export const accuracyTone = (accuracy: number): ParagraphTone => {
	if (accuracy >= ACCURACY_HIGH) return "viridian";
	if (accuracy >= ACCURACY_MID) return "saffron";
	return "cinnabar";
};
