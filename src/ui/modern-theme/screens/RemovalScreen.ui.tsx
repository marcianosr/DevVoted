import type { ReactNode } from "react";

import { Action } from "../Action.ui";
import { Pick } from "../Pick.ui";
import { Text } from "../Text.ui";
import { Tooltip } from "../Tooltip.ui";

const SCREEN = "flex flex-col bg-theme-faint";

const HEADER =
	"flex flex-wrap items-start justify-between gap-4 border-b border-edge px-5 py-4";
const NAMING = "flex min-w-0 flex-col gap-0.5";

const BODY = "flex flex-col px-2 py-4";
const HEADING = "px-3 py-2";
const LIST = "flex flex-col";

const FOOTER =
	"flex flex-wrap items-center justify-between gap-4 border-t border-edge px-5 py-4";

export type RemovalConfig = {
	id: string;
	label: string;
	notes?: ReactNode;
};

export type RemovalScreenProps = {
	gateName: string;
	required: number;
	pollCount: number;
	configs: readonly RemovalConfig[];
	selectedIds: readonly string[];
	onToggle: (id: string) => void;
	onRemove: () => void;
	theme?: string;
};

const plural = (count: number, noun: string) =>
	`${count} ${noun}${count === 1 ? "" : "s"}`;

const instruct = (shortfall: number) => {
	if (shortfall > 0)
		return `Pick ${plural(shortfall, "more config")} to remove`;
	if (shortfall < 0) return `Unpick ${plural(-shortfall, "config")}`;
	return "Remove these and open the shop";
};

export const RemovalScreen = ({
	gateName,
	required,
	pollCount,
	configs,
	selectedIds,
	onToggle,
	onRemove,
	theme,
}: RemovalScreenProps) => {
	const picked = selectedIds.length;
	const shortfall = required - picked;
	const ready = shortfall === 0;

	return (
		<article data-gate-theme={theme} className={SCREEN}>
			<header className={HEADER}>
				<div className={NAMING}>
					<Text as="h2" size="title">
						{gateName} gate · remove {plural(required, "config")}
					</Text>
					<Text as="p" size="meta" tone="muted">
						Retry this gate
					</Text>
				</div>
			</header>

			<section className={BODY}>
				<Text as="h3" size="body" className={HEADING}>
					Pipeline
				</Text>
				<ul className={LIST}>
					{configs.map((config) => (
						<li key={config.id}>
							<Pick
								label={config.label}
								checked={selectedIds.includes(config.id)}
								onToggle={() => onToggle(config.id)}
								notes={config.notes}
							/>
						</li>
					))}
				</ul>
			</section>

			<div className={FOOTER}>
				<Text size="body" tone="muted">
					You are forced to remove {plural(required, "config")} from this run
					without deinstall refund!
				</Text>
				<Tooltip hint={instruct(shortfall)}>
					<Action
						label="Remove and go to shop"
						size="lg"
						emphasis="danger"
						disabled={!ready}
						onUse={onRemove}
					/>
				</Tooltip>
			</div>
		</article>
	);
};
