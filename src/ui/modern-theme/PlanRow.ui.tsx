import { clsx } from "clsx";

import { Row } from "./Row.ui";
import { Text } from "./Text.ui";

const STEP = "cursor-pointer rounded-lg border transition-colors";
const IDLE = "border-edge-strong hover:border-control-edge";
const ON = "border-theme bg-theme-soft";

const CONTROL =
	"size-4 shrink-0 appearance-none rounded-full border border-control-edge transition-colors checked:border-theme checked:bg-theme focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cerulean disabled:cursor-not-allowed";

const LABEL = "w-24 shrink-0";
const TERMS = "min-w-0 flex-1";

export type PlanRowProps = {
	label: string;
	terms: string;
	held: boolean;
	free?: boolean;
	warns?: string;
	pick: { readonly disabled?: boolean; readonly onUse: () => void };
};

export const PlanRow = ({
	label,
	terms,
	held,
	free = false,
	warns,
	pick,
}: PlanRowProps) => (
	<Row
		as="label"
		spacing="tight"
		className={clsx(STEP, held ? ON : IDLE)}
		leading={
			<input
				type="radio"
				name="storage-plan"
				checked={held}
				disabled={pick.disabled}
				aria-label={[label, terms, warns].filter(Boolean).join(" ")}
				onChange={pick.onUse}
				className={CONTROL}
			/>
		}
		trailing={
			warns ? (
				<Text size="meta" tone="cinnabar">
					{warns}
				</Text>
			) : null
		}
	>
		<Text size="meta" tone={held ? "default" : "muted"} className={LABEL}>
			{label}
		</Text>
		<Text size="meta" tone={free ? "celadon" : "muted"} className={TERMS}>
			{terms}
		</Text>
	</Row>
);
