import { useEffect, useRef } from "react";

import { clsx } from "clsx";

type DialogProps = {
	isOpen: boolean;
	onClose: () => void;
	children: React.ReactNode;
	className?: string;
};

export const Dialog = ({
	isOpen,
	onClose,
	children,
	className,
}: DialogProps) => {
	const dialogRef = useRef<HTMLDialogElement>(null);

	useEffect(() => {
		const dialog = dialogRef.current;
		if (!dialog) return;

		if (isOpen) {
			dialog.showModal();
		} else {
			dialog.close();
		}
	}, [isOpen]);

	return (
		<dialog
			ref={dialogRef}
			onClose={onClose}
			className={clsx(
				"backdrop:bg-black backdrop:opacity-70 p-0 m-auto border border-white bg-gray-950 text-gray-200",
				className
			)}
		>
			{children}
		</dialog>
	);
};
