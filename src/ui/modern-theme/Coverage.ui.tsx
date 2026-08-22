import { Fold } from "./Fold.ui";
import { Meter } from "./Meter.ui";
import { Text } from "./Text.ui";

const BODY = "flex flex-col gap-4 pt-1";
const NOTES = "flex flex-col";

export type CoverageProps = {
	held: number;
	projected: number;
	required: number;
	max?: number;
	defaultOpen?: boolean;
};

export const Coverage = ({
	held,
	projected,
	required,
	max = 100,
	defaultOpen = true,
}: CoverageProps) => (
	<Fold
		title="Coverage"
		defaultOpen={defaultOpen}
		value={
			<Text size="meta" tone="muted">
				{held}% / {required}%
			</Text>
		}
	>
		<div className={BODY}>
			<Meter
				held={held}
				projected={projected}
				max={max}
				label={`${held} percent covered of ${required} required`}
			/>
			<div className={NOTES}>
				<Text as="p" size="meta" tone="muted">
					+{projected}% projected
				</Text>
				<Text as="p" size="meta" tone="muted">
					{required}% required
				</Text>
			</div>
		</div>
	</Fold>
);
