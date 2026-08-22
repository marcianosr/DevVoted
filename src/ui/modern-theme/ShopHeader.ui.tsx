import type { ReactNode } from "react";

import { Storage, type StorageProps } from "./Storage.ui";
import { Text } from "./Text.ui";

const HEADER =
	"flex flex-wrap items-start justify-between gap-4 border-b border-edge px-5 py-4";
const NAMING = "flex min-w-0 flex-col gap-0.5";
const LEDGER = "flex flex-col items-end gap-1";

export type ShopHeaderProps = {
	/** The shop is the gate's, so it wears the gate's name: "Lavender shop". */
	title: ReactNode;
	/** Where the exit leads, e.g. "gate 4". */
	nextGate: ReactNode;
	storage: StorageProps;
	/** What happens to storage held past the cap, when there is such a warning. */
	capNote?: ReactNode;
};

export const ShopHeader = ({
	title,
	nextGate,
	storage,
	capNote,
}: ShopHeaderProps) => (
	<header className={HEADER}>
		<div className={NAMING}>
			<Text as="h2" size="title">
				{title}
			</Text>
			<p>
				<Text size="meta" tone="muted">
					next up ·{" "}
				</Text>
				<Text size="meta" tone="theme">
					{nextGate}
				</Text>
			</p>
		</div>

		<div className={LEDGER}>
			<Storage {...storage} />
			{capNote ? (
				<Text size="meta" tone="saffron">
					{capNote}
				</Text>
			) : null}
		</div>
	</header>
);
