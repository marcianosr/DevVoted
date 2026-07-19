import { cva } from "class-variance-authority";
import { useState, type ReactNode } from "react";

type SummaryDropdownProps = {
	trigger: ReactNode;
	children: ReactNode;
	panelClassName?: string;
	triggerClassName?: string;
};

const chevron = cva("text-pewter transition-transform", {
	variants: {
		open: {
			true: "rotate-180",
			false: "",
		},
	},
});

export const SummaryDropdown = ({
	trigger,
	children,
	panelClassName = "",
	triggerClassName = "",
}: SummaryDropdownProps) => {
	const [open, setOpen] = useState(false);
	return (
		<div className="relative">
			<button
				type="button"
				onClick={() => setOpen((isOpen) => !isOpen)}
				className={`flex cursor-pointer items-center gap-1.5 ${triggerClassName}`}
			>
				{trigger}
				<span className={chevron({ open })}>▾</span>
			</button>
			{open ? (
				<div
					className={`absolute right-0 top-full z-20 mt-2 rounded-lg border border-zinc-700 bg-zinc-900 p-3 ${panelClassName}`}
				>
					{children}
				</div>
			) : null}
		</div>
	);
};
