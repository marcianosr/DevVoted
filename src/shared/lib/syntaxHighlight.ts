import css from "highlight.js/lib/languages/css";
import java from "highlight.js/lib/languages/java";
import javascript from "highlight.js/lib/languages/javascript";
import typescript from "highlight.js/lib/languages/typescript";
import xml from "highlight.js/lib/languages/xml";

export const highlightOptions = {
	detect: true,
	languages: {
		css,
		java,
		javascript,
		js: javascript,
		typescript,
		ts: typescript,
		html: xml,
		vue: xml,
		xml,
	},
};
