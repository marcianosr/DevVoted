import { useState } from "react";

import { GateOptionCard } from "~/domains/gates/components/GateOptionCard";
import type { GateType } from "~/domains/gates/models/gateType";
import { PrimaryButton } from "~/ui/PrimaryButton";

type GateSelectionModalProps = {
	isOpen: boolean;
	options: GateType[];
	currentGateTypeCode: string;
	gateNumber: number;
	onSelect: (gateTypeCode: string) => void;
	isLoading?: boolean;
};

export const GateSelectionModal = ({
	isOpen,
	options,
	currentGateTypeCode,
	gateNumber,
	onSelect,
	isLoading = false,
}: GateSelectionModalProps) => {
	const [selectedCode, setSelectedCode] = useState<string>(currentGateTypeCode);

	if (!isOpen) {
		return null;
	}

	const handleConfirm = () => {
		onSelect(selectedCode);
	};

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
			<div className="bg-gray-900 border border-gray-700 rounded-xl p-6 max-w-lg w-full mx-4">
				<div className="text-center mb-6">
					<h2 className="text-2xl font-bold text-white mb-2">Gate Passed!</h2>
					<p className="text-gray-400">
						Choose your path for Gate {gateNumber + 1}
					</p>
				</div>

				<div className="space-y-3 mb-6">
					{options.map((gateType) => (
						<GateOptionCard
							key={gateType.code}
							gateType={gateType}
							isSelected={selectedCode === gateType.code}
							onClick={() => setSelectedCode(gateType.code)}
							isCurrent={gateType.code === currentGateTypeCode}
						/>
					))}
				</div>

				<PrimaryButton
					onClick={handleConfirm}
					disabled={isLoading}
					isLoading={isLoading}
					className="w-full"
				>
					Continue with {options.find((o) => o.code === selectedCode)?.name}
				</PrimaryButton>
			</div>
		</div>
	);
};
