import type { ReactNode } from "react";

import { clsx } from "clsx";

import { Row } from "./Row.ui";
import { Text } from "./Text.ui";

const PICK =
	"cursor-pointer rounded-md transition-colors hover:bg-surface-raised";
const PICKED = "bg-cinnabar/5 hover:bg-cinnabar/10";

const CONTROL =
	"size-4 shrink-0 appearance-none rounded border border-control-edge transition-colors checked:border-cinnabar checked:bg-cinnabar focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cerulean";

const STRUCK = "line-through";
const NOTES = "flex flex-wrap items-center gap-2";

export type PickProps = {
	label: ReactNode;
	checked: boolean;
	onToggle: (checked: boolean) => void;
	notes?: ReactNode;
};

export const Pick = ({ label, checked, onToggle, notes }: PickProps) => (
	<Row
		as="label"
		spacing="compact"
		className={clsx(PICK, checked && PICKED)}
		leading={
			<input
				type="checkbox"
				checked={checked}
				onChange={(event) => onToggle(event.target.checked)}
				className={CONTROL}
			/>
		}
	>
		<Text size="body" className={clsx(checked && STRUCK)}>
			{label}
		</Text>
		{notes ? <span className={NOTES}>{notes}</span> : null}
	</Row>
);
