import type { ReactNode } from "react";

import { DexPanel } from "./DexPanel.ui";
import { Panel } from "./Panel.ui";

const LAYOUT =
	"grid w-full items-start gap-4 lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)]";
const FILTER =
	"flex w-full flex-wrap gap-2 border-b border-theme-faint px-4 py-3";
const DETAIL = "lg:sticky lg:top-4";

export type DexBrowserProps = {
	label: string;
	count: string;
	meta: string;
	note: string;
	filter?: ReactNode;
	rows: ReactNode;
	detail: ReactNode;
};

export const DexBrowser = ({
	label,
	count,
	meta,
	note,
	filter,
	rows,
	detail,
}: DexBrowserProps) => (
	<div className={LAYOUT}>
		<DexPanel label={label} count={count} meta={meta} note={note}>
			{filter === undefined ? null : <div className={FILTER}>{filter}</div>}
			<Panel.Rows>{rows}</Panel.Rows>
		</DexPanel>
		<div className={DETAIL}>{detail}</div>
	</div>
);

export type DexDetailProps = {
	label: string;
	meta?: ReactNode;
	children: ReactNode;
};

export const DexDetail = ({ label, meta, children }: DexDetailProps) => (
	<Panel>
		<Panel.Header label={label} meta={meta} />
		<Panel.Body>{children}</Panel.Body>
	</Panel>
);
