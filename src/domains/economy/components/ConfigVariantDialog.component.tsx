import { useEffect, useRef } from "react";

import { Config, ConfigVariant } from "~/domains/economy/models/config.model";
import { formatStorage } from "~/lib/storage";
import { Button } from "~/ui/Button.component";

export type ConfigVariantDialogProps = {
	isOpen: boolean;
	config: Config;
	onChoose: (variantId: string) => void;
	onCancel: () => void;
};

export const ConfigVariantDialog = ({
	isOpen,
	config,
	onChoose,
	onCancel,
}: ConfigVariantDialogProps) => {
	const dialogRef = useRef<HTMLDialogElement>(null);

	useEffect(() => {
		const dialog = dialogRef.current;
		if (!dialog) return;

		if (isOpen) {
			dialog.showModal();
			return;
		}
		dialog.close();
	}, [isOpen]);

	const variants = config.variants ?? [];

	return (
		<dialog
			ref={dialogRef}
			onClose={onCancel}
			className="backdrop:bg-black backdrop:opacity-50 rounded-lg p-0 max-w-lg m-auto border border-theme bg-gray-900 text-gray-200"
			aria-labelledby="config-variant-dialog-title"
		>
			<div className="p-6">
				<h2
					id="config-variant-dialog-title"
					className="text-xl mb-2 text-white"
				>
					{config.name} — choose a policy
				</h2>
				<p className="text-gray-400 mb-4 text-sm">
					This choice is permanent for the rest of your run. Cost:{" "}
					{formatStorage(config.cost)}.
				</p>

				<ul className="flex flex-col gap-3 mb-6">
					{variants.map((variant: ConfigVariant) => (
						<li key={variant.id}>
							<button
								type="button"
								onClick={() => onChoose(variant.id)}
								className="w-full text-left border border-theme rounded p-3 hover:bg-gray-800 cursor-pointer transition-colors"
							>
								<div className="font-semibold text-white">{variant.label}</div>
								<div className="text-sm text-gray-400 mt-1">
									{variant.description}
								</div>
							</button>
						</li>
					))}
				</ul>

				<div className="flex justify-end">
					<Button variant="secondary" onClick={onCancel}>
						Cancel
					</Button>
				</div>
			</div>
		</dialog>
	);
};
