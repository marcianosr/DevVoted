import { clsx } from "clsx";

import { Row } from "./Row.ui";
import { Text } from "./Text.ui";

const STEP = "rounded-lg border transition-colors";
const PICKABLE = "cursor-pointer";
const IDLE = "border-edge-strong hover:border-control-edge";
const ON = "border-theme bg-theme-soft";
const LOCKED = "border-transparent opacity-50";

const CONTROL =
	"size-4 shrink-0 appearance-none rounded-full border border-control-edge transition-colors checked:border-theme checked:bg-theme focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cerulean disabled:cursor-not-allowed";

const SEALED =
	"size-4 shrink-0 rounded-full border border-dashed border-zinc-700";

const LABEL = "w-20 shrink-0";
const MAKES = "w-20 shrink-0";
const TERMS = "min-w-0 flex-1";

export type ExtraSpotRowProps = {
	label: string;
	makes: string;
	terms: string;
	settled?: boolean;
	held: boolean;
	pick?: { readonly disabled?: boolean; readonly onUse: () => void };
	opensAt?: string;
};

export const ExtraSpotRow = ({
	label,
	makes,
	terms,
	settled = false,
	held,
	pick,
	opensAt,
}: ExtraSpotRowProps) => {
	const columns = (
		<>
			<Text size="meta" tone={held ? "default" : "muted"} className={LABEL}>
				{label}
			</Text>
			<Text size="meta" tone="muted" className={MAKES}>
				{makes}
			</Text>
			<Text size="meta" tone={settled ? "celadon" : "muted"} className={TERMS}>
				{terms}
			</Text>
		</>
	);

	if (!pick)
		return (
			<Row
				spacing="tight"
				className={clsx(STEP, LOCKED)}
				leading={<span aria-hidden className={SEALED} />}
				trailing={
					opensAt ? (
						<Text size="meta" tone="muted">
							{opensAt}
						</Text>
					) : null
				}
			>
				{columns}
			</Row>
		);

	return (
		<Row
			as="label"
			spacing="tight"
			className={clsx(STEP, PICKABLE, held ? ON : IDLE)}
			leading={
				<input
					type="radio"
					name="extra-spots"
					checked={held}
					disabled={pick.disabled}
					aria-label={[label, makes, terms].join(" ")}
					onChange={pick.onUse}
					className={CONTROL}
				/>
			}
		>
			{columns}
		</Row>
	);
};
