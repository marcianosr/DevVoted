import type { ReactNode } from "react";

import { Storage, type StorageProps } from "./Storage.ui";
import { Swatch } from "./Swatch.ui";
import { Text } from "./Text.ui";

const HEADER =
	"flex flex-wrap items-start justify-between gap-4 border-b border-edge px-5 py-4";
const NAME = "flex min-w-0 items-start gap-3";
const NAMING = "flex min-w-0 flex-col gap-0.5";
const BADGE = "mt-1";
const LEDGER = "flex flex-col items-end gap-1";

export type ShopHeaderProps = {
	title: ReactNode;
	nextGate: ReactNode;
	storage: StorageProps;
	capNote?: ReactNode;
};

export const ShopHeader = ({
	title,
	nextGate,
	storage,
	capNote,
}: ShopHeaderProps) => (
	<header className={HEADER}>
		<div className={NAME}>
			<Swatch size="badge" className={BADGE} />
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
