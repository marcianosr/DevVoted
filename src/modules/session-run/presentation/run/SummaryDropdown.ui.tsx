import { useState, type ReactNode } from "react";

type SummaryDropdownProps = {
	trigger: ReactNode;
	children: ReactNode;
	panelClassName?: string;
};

export const SummaryDropdown = ({
	trigger,
	children,
	panelClassName = "",
}: SummaryDropdownProps) => {
	const [open, setOpen] = useState(false);
	return (
		<div className="relative">
			<button
				type="button"
				onClick={() => setOpen((isOpen) => !isOpen)}
				className="flex cursor-pointer items-center gap-1.5"
			>
				{trigger}
				<span
					className={`text-pewter transition-transform ${open ? "rotate-180" : ""}`}
				>
					▾
				</span>
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
