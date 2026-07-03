import type { ReactNode } from "react";

type ColumnsProps = {
	/** The narrower 1/3 side column. When absent, `main` spans the full width. */
	aside?: ReactNode;
	/** The wider 2/3 primary column. */
	main: ReactNode;
};

/**
 * A responsive 1/3 · 2/3 split: stacked on small screens, side by side from md
 * up with the columns top-aligned. With no `aside`, `main` takes the full width
 * so callers don't need to branch on optional side content.
 */
export const Columns = ({ aside, main }: ColumnsProps) => {
	if (!aside) return <>{main}</>;

	return (
		<div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
			<div className="md:col-span-1">{aside}</div>
			<div className="md:col-span-2">{main}</div>
		</div>
	);
};
