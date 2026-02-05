export type SlideType = "title" | "content" | "code" | "image";

export type KantoColor =
	| "pallet"
	| "viridian"
	| "pewter"
	| "cerulean"
	| "vermillion"
	| "lavender"
	| "celadon"
	| "fuchsia"
	| "saffron"
	| "cinnabar"
	| "indigo"
	| "seafoam"
	| "prismatic";

export type CodeBlock = {
	language: string;
	content: string;
};

export type ImageBlock = {
	src: string;
	alt: string;
};

export type BaseSlide = {
	id: string;
	accentColor?: KantoColor;
};

export type TitleSlide = BaseSlide & {
	type: "title";
	title: string;
	subtitle?: string;
	images?: ImageBlock[];
};

export type ContentSlide = BaseSlide & {
	type: "content";
	title: string;
	subtitle?: string;
	bullets: string[];
};

export type CodeSlide = BaseSlide & {
	type: "code";
	title: string;
	code: CodeBlock;
};

export type ImageSlide = BaseSlide & {
	type: "image";
	title?: string;
	image: ImageBlock;
};

export type Section = {
	heading: string;
	bullets: string[];
	icon?: string;
};

export type SectionsSlide = BaseSlide & {
	type: "sections";
	title: string;
	sections: Section[];
};

export type ComponentSlide = BaseSlide & {
	type: "component";
	title?: string;
	componentId: string;
};

export type Slide =
	| TitleSlide
	| ContentSlide
	| CodeSlide
	| ImageSlide
	| SectionsSlide
	| ComponentSlide;

export type PresentationState = {
	currentIndex: number;
	total: number;
	isFirst: boolean;
	isLast: boolean;
};

export type PresentationActions = {
	next: () => void;
	prev: () => void;
	goTo: (index: number) => void;
	goToFirst: () => void;
	goToLast: () => void;
};
