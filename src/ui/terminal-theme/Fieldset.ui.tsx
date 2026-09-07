import type { ReactNode } from "react";

import { clsx } from "clsx";

import { Text } from "./Text.ui";

const BOX = "flex flex-col gap-2 rounded-lg border border-edge px-3 pt-1 pb-3";
const LEGEND = "px-1";

export type FieldsetProps = {
	legend: string;
	children: ReactNode;
	className?: string;
};

export const Fieldset = ({ legend, children, className }: FieldsetProps) => (
	<fieldset className={clsx(BOX, className)}>
		<legend className={LEGEND}>
			<Text size="caption" tone="muted">
				{legend}
			</Text>
		</legend>
		{children}
	</fieldset>
);
