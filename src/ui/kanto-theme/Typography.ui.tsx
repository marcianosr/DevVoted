import type { ReactNode } from "react";

export type TypographyVariant =
	| "headline"
	| "title"
	| "subtitle"
	| "paragraph"
	| "caption"
	| "label"
	| "hint"
	| "accent";

export type TypographyTag = "h1" | "h2" | "h3" | "p" | "span";

const FAINT = "text-theme-faint";
const SOFT = "text-theme-soft";
const MUTED = "text-theme-muted";
const FULL = "text-theme";

type VariantStyle = {
	style: string;
	tag: TypographyTag;
	tone: string;
};

const VARIANT = {
	headline: {
		style: "text-display font-extrabold",
		tag: "h1",
		tone: FAINT,
	},
	title: {
		style: "text-base font-extrabold tracking-wide",
		tag: "h2",
		tone: FAINT,
	},
	subtitle: { style: "text-sm font-bold", tag: "h2", tone: FAINT },
	paragraph: { style: "text-base font-normal", tag: "p", tone: FAINT },
	caption: { style: "text-sm font-normal", tag: "span", tone: SOFT },
	label: { style: "text-xs font-bold", tag: "span", tone: SOFT },
	hint: { style: "text-xs font-normal", tag: "p", tone: MUTED },
	accent: { style: "text-sm font-bold", tag: "span", tone: FULL },
} satisfies Record<TypographyVariant, VariantStyle>;

export type TypographyProps = {
	children: ReactNode;
	variant: TypographyVariant;
	as?: TypographyTag;
};

export const Typography = ({ children, variant, as }: TypographyProps) => {
	const { style, tag, tone } = VARIANT[variant];
	const Tag = as ?? tag;

	return <Tag className={`${tone} ${style}`}>{children}</Tag>;
};
