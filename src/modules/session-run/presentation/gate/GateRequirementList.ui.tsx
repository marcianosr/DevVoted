import type {
	CheckState,
	CheckStatus,
} from "~/modules/session-run/configs/effect.model";
import { Subtitle } from "~/ui/typography/Subtitle.component";
import { Title } from "~/ui/typography/Title.component";

const STATE_COLOR: Record<CheckState, string> = {
	running: "bg-vermillion",
	skipped: "bg-pewter",
	success: "bg-viridian",
	failed: "bg-cinnabar",
};

const STATE_TEXT: Record<CheckState, string> = {
	running: "text-vermillion",
	skipped: "text-pewter",
	success: "text-viridian",
	failed: "text-cinnabar",
};

type GateRequirementListProps = {
	checks: readonly CheckStatus[];
	gateNumber: number;
	pollsToGate: number;
	gateReward: number;
};

/** The gate as a CI-Pipelines panel: a header summary + one bar-tracked check per row. */
export const GateRequirementList = ({
	checks,
	gateNumber,
	pollsToGate,
	gateReward,
}: GateRequirementListProps) => (
	<div className="overflow-hidden rounded-xl border border-zinc-700">
		<header className="flex flex-col gap-1 border-b border-zinc-700 p-4">
			<div className="flex items-baseline justify-between">
				<Title as="h2">Pipelines</Title>
				<Subtitle>Gate #{gateNumber}</Subtitle>
			</div>
			<Subtitle>
				{pollsToGate} poll{pollsToGate === 1 ? "" : "s"} left · {checks.length}{" "}
				active check{checks.length === 1 ? "" : "s"} · all must pass
			</Subtitle>
			<Subtitle>
				Total reward if all pass:{" "}
				<span className="font-bold text-viridian">
					+{gateReward} KB storage
				</span>
			</Subtitle>
		</header>
		<ul>
			{checks.map((check) => {
				const pct =
					check.target > 0
						? Math.min(100, Math.round((check.current / check.target) * 100))
						: 0;
				return (
					<li
						key={check.label}
						className="border-b border-zinc-800 p-4 last:border-b-0"
					>
						<div className="mb-2 flex items-center justify-between">
							<span className="flex items-center gap-2 font-bold text-cerulean">
								<span
									className={`inline-block h-2.5 w-2.5 rounded-full ${STATE_COLOR[check.state]}`}
								/>
								{check.label}
							</span>
							<span className={STATE_TEXT[check.state]}>{check.progress}</span>
						</div>
						<div className="h-2 overflow-hidden rounded bg-zinc-800">
							<div
								className={`h-full rounded ${STATE_COLOR[check.state]}`}
								style={{ width: `${pct}%` }}
							/>
						</div>
					</li>
				);
			})}
		</ul>
	</div>
);
