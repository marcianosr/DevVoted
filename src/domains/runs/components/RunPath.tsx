import { clsx } from "clsx";

import { GATE_BY_HTTP_CODE } from "~/domains/runs/data/httpGates";
import { DIFFICULTY_COLORS } from "~/domains/runs/utils/gateDifficultyStyles";

type RunPathProps = {
	gatePath: number[];
};

export const RunPath = ({ gatePath }: RunPathProps) => (
	<ol className="flex items-center gap-1 flex-wrap">
		{gatePath.map((code, index) => {
			const gate = GATE_BY_HTTP_CODE[code];
			const textClass = gate
				? DIFFICULTY_COLORS[gate.difficulty].text
				: "text-gray-400";

			return (
				<li key={index} className="flex items-center gap-1">
					{index > 0 && <span className="text-gray-600">→</span>}
					<span className={clsx("font-bold", textClass)}>{code}</span>
				</li>
			);
		})}
		<li className="flex items-center gap-1">
			<span className="text-gray-600">→</span>
			<span className="text-gray-500">?</span>
		</li>
	</ol>
);
