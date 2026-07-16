type SwatchSize = "sm" | "md" | "lg" | "xl";

const SIZE: Record<SwatchSize, string> = {
	sm: "h-3 w-3",
	md: "h-3.5 w-3.5",
	lg: "h-6 w-6",
	xl: "h-7 w-7",
};

type SwatchProps = {
	size?: SwatchSize;
};

export const Swatch = ({ size = "md" }: SwatchProps) => (
	<span className={`inline-block rounded bg-theme ${SIZE[size]}`} />
);
