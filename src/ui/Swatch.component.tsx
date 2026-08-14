import { cva } from "class-variance-authority";

type SwatchSize = "sm" | "md" | "lg" | "xl";

const swatch = cva("inline-block rounded bg-theme", {
	variants: {
		size: {
			sm: "h-3 w-3",
			md: "h-3.5 w-3.5",
			lg: "h-6 w-6",
			xl: "h-7 w-7",
		} satisfies Record<SwatchSize, string>,
	},
});

type SwatchProps = {
	size?: SwatchSize;
};

export const Swatch = ({ size = "md" }: SwatchProps) => (
	<span data-testid="swatch" className={swatch({ size })} />
);
