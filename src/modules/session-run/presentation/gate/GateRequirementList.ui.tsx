import type {
	CheckState,
	CheckStatus,
} from "~/modules/session-run/configs/effect";
import { Subtitle } from "~/ui/typography/Subtitle.component";

/** GitHub-style check indicators: running = orange dot, skipped = grey, success = green, failed = cross. */
const STATE_STYLE: Record<CheckState, { icon: string; className: string }> = {
	running: { icon: "●", className: "text-vermillion" },
	skipped: { icon: "⊘", className: "text-pewter" },
	success: { icon: "✓", className: "text-viridian" },
	failed: { icon: "✕", className: "text-cinnabar" },
};

export const GateRequirementList = ({
	checks,
}: {
	checks: readonly CheckStatus[];
}) => (
	<div className="rounded-lg bg-zinc-900 p-4">
		<Subtitle className="mb-2">This gate needs (all must pass)</Subtitle>
		<div className="flex flex-col gap-1">
			{checks.map((check) => {
				const style = STATE_STYLE[check.state];
				return (
					<div
						key={check.label}
						className="flex items-center justify-between text-sm"
					>
						<span className="text-white">
							<span className={style.className}>{style.icon}</span>{" "}
							{check.label}
						</span>
						<span className={style.className}>{check.progress}</span>
					</div>
				);
			})}
		</div>
	</div>
);
