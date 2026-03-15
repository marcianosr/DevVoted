import { Dialog } from "~/components/Dialog";
import type { HttpGate } from "~/domains/runs/models/httpGate";
import { GateCard } from "~/domains/runs/components/GateCard";
import { PrimaryButton } from "~/ui/PrimaryButton";

type GateChoiceDialogProps = {
	isOpen: boolean;
	options: [HttpGate, HttpGate];
	onSelect: (gate: HttpGate) => void;
	onClose: () => void;
};

export const GateChoiceDialog = ({
	isOpen,
	options,
	onSelect,
	onClose,
}: GateChoiceDialogProps) => (
	<Dialog isOpen={isOpen} onClose={onClose} className="max-w-2xl w-full">
		<div className="p-6">
			<h2 className="text-2xl mb-2">Gate Passed!</h2>
			<p className="text-gray-400 mb-6">Choose your next gate to triage.</p>
			<div className="grid grid-cols-2 gap-4">
				{options.map((gate) => (
					<div key={gate.httpCode} className="flex flex-col gap-2">
						<GateCard gate={gate} />
						<PrimaryButton onClick={() => onSelect(gate)}>
							Select gate {gate.httpCode}
						</PrimaryButton>
					</div>
				))}
			</div>
		</div>
	</Dialog>
);
