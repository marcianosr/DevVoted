import { Meter } from "./Meter.ui";
import { Text } from "./Text.ui";

// Fixed width so the header's middle does not resize as the number grows.
const STORAGE = "flex w-44 shrink-0 flex-col gap-1";
const AMOUNT = "flex items-baseline gap-1";

export type StorageProps = {
	plan: string;
	used: number;
	cap: number;
};

export const Storage = ({ plan, used, cap }: StorageProps) => (
	<div className={STORAGE}>
		<Text size="meta" tone="muted">
			{plan}
		</Text>
		<p className={AMOUNT}>
			<Text size="meta">
				{used} / {cap} KB
			</Text>
			<Text size="meta" tone="muted">
				stored
			</Text>
		</p>
		<Meter held={used} max={cap} label={`${used} of ${cap} KB stored`} />
	</div>
);
