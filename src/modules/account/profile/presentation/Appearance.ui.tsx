import type { ReactNode } from "react";

const STACK = "flex w-full flex-col gap-6";

export type AppearanceProps = {
	preview: ReactNode;
	borders: ReactNode;
	titles: ReactNode;
};

export const Appearance = ({ preview, borders, titles }: AppearanceProps) => (
	<div className={STACK}>
		{preview}
		{borders}
		{titles}
	</div>
);
