import { type ReactNode, useState } from "react";
import type { Config } from "~/modules/session-run/configs/config.model";
import { Button } from "~/ui/Button.component";
import { ConfigChip } from "./ConfigChip.ui";

export type ChipAction = {
	label: string;
	onClick: () => void;
	disabled?: boolean;
};

type ConfigActionsProps = {
	config: Config;
	actions: readonly ChipAction[];
	badge?: ReactNode;
};

/** A config chip that reveals its contextual actions (sell/upgrade) as a popover on click. */
export const ConfigActions = ({
	config,
	actions,
	badge,
}: ConfigActionsProps) => {
	const [open, setOpen] = useState(false);
	return (
		<span className="relative inline-flex">
			<ConfigChip
				config={config}
				badge={badge}
				noTooltip={open}
				onClick={() => setOpen((wasOpen) => !wasOpen)}
			/>
			{open && actions.length > 0 ? (
				<span className="absolute left-0 top-full z-20 mt-1 flex min-w-max flex-col gap-1 rounded-lg border border-zinc-700 bg-zinc-900 p-1">
					{actions.map((action) => (
						<Button
							key={action.label}
							variant="primary"
							className="w-full whitespace-nowrap rounded-md text-xs"
							disabled={action.disabled}
							onClick={() => {
								action.onClick();
								setOpen(false);
							}}
						>
							{action.label}
						</Button>
					))}
				</span>
			) : null}
		</span>
	);
};
