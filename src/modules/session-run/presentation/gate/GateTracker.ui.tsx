import { Subtitle } from "~/ui/typography/Subtitle.component";

type GateTrackerProps = {
	total: number;
	cleared: number;
};

/** The climb at a glance: which gates are cleared, which is current, which lie ahead. */
export const GateTracker = ({ total, cleared }: GateTrackerProps) => (
	<div className="flex flex-col gap-2">
		<Subtitle>The climb</Subtitle>
		<div className="flex flex-wrap gap-2">
			{Array.from({ length: total }, (_, index) => {
				const gate = index + 1;
				const done = gate <= cleared;
				const now = gate === cleared + 1;
				const border = done
					? "border-viridian"
					: now
						? "border-saffron"
						: "border-zinc-700";
				const accent = done
					? "text-viridian"
					: now
						? "text-saffron"
						: "text-pewter";
				return (
					<div
						key={gate}
						className={`flex min-w-16 flex-col items-center rounded-lg border px-3 py-2 ${border}`}
					>
						<span className={`text-xs font-bold ${accent}`}>Gate {gate}</span>
						<span className="text-sm text-white">
							{done ? "✓ done" : now ? "now" : "ahead"}
						</span>
					</div>
				);
			})}
		</div>
	</div>
);
