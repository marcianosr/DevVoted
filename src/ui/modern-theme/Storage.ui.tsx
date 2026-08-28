import { Text } from "./Text.ui";

const STORAGE = "flex shrink-0 flex-col items-end";

export type StorageProps = {
	balanceKb: number;
};

export const Storage = ({ balanceKb }: StorageProps) => (
	<div className={STORAGE}>
		<Text size="body">{balanceKb} KB</Text>
		<Text size="meta" tone="muted">
			balance
		</Text>
	</div>
);
