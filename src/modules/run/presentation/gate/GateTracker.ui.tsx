import { cva } from "class-variance-authority";
import { Subtitle } from "~/ui/typography/Subtitle.component";

type GateTrackerProps = {
	total: number;
	cleared: number;
};

type GateState = "done" | "now" | "ahead";

const gateStateOf = (gate: number, cleared: number): GateState => {
	if (gate <= cleared) return "done";
	if (gate === cleared + 1) return "now";
	return "ahead";
};

const LABEL: Record<GateState, string> = {
	done: "✓ done",
	now: "now",
	ahead: "ahead",
};

const gateTile = cva(
	"flex min-w-16 flex-col items-center rounded-lg border px-3 py-2",
	{
		variants: {
			state: {
				done: "border-viridian",
				now: "border-saffron",
				ahead: "border-zinc-700",
			} satisfies Record<GateState, string>,
		},
	}
);

const gateAccent = cva("text-xs font-bold", {
	variants: {
		state: {
			done: "text-viridian",
			now: "text-saffron",
			ahead: "text-pewter",
		} satisfies Record<GateState, string>,
	},
});

export const GateTracker = ({ total, cleared }: GateTrackerProps) => (
	<div className="flex flex-col gap-2">
		<Subtitle>The climb</Subtitle>
		<div className="flex flex-wrap gap-2">
			{Array.from({ length: total }, (_, index) => {
				const gate = index + 1;
				const state = gateStateOf(gate, cleared);
				return (
					<div key={gate} className={gateTile({ state })}>
						<span className={gateAccent({ state })}>Gate {gate}</span>
						<span className="text-sm text-white">{LABEL[state]}</span>
					</div>
				);
			})}
		</div>
	</div>
);
