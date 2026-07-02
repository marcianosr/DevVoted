import type { ReactNode } from "react";

type PollActionButtonProps = {
	children: ReactNode;
	disabled?: boolean;
	onClick: () => void;
};

export const PollActionButton = ({
	children,
	disabled = false,
	onClick,
}: PollActionButtonProps) => (
	<button
		type="button"
		disabled={disabled}
		onClick={onClick}
		className={`px-6 py-3.5 text-base font-semibold transition-colors ${
			disabled
				? "bg-zinc-800 text-gray-500 cursor-not-allowed"
				: "bg-theme text-black cursor-pointer hover:opacity-90"
		}`}
	>
		{children}
	</button>
);
