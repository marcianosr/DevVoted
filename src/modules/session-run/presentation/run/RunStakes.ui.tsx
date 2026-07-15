import { Title } from "~/ui/typography/Title.component";

type RunStakesProps = {
	victoryGate: number;
	requirement: number;
	requirementLabel: string;
	/** Extra always-on gate requirements added by slotted configs (coverage, cold start, …). */
	extraRequirements: readonly string[];
	gateReward: number;
};

/** A glanceable summary of what the whole run demands and pays — the stakes before the climb. */
export const RunStakes = ({
	victoryGate,
	requirement,
	requirementLabel,
	extraRequirements,
	gateReward,
}: RunStakesProps) => (
	<div className="rounded-xl border border-zinc-700 p-4">
		<Title as="h3" size="md">
			Run stakes
		</Title>
		<ul className="mt-2 flex list-disc flex-col gap-1 pl-5 text-sm text-white marker:text-pewter">
			<li>
				Clear <span className="font-bold text-white">{victoryGate} gates</span>{" "}
				to finish the run
			</li>
			<li>
				Every gate needs:
				<ul className="mt-1 flex list-disc flex-col gap-1 pl-5 marker:text-zinc-600">
					<li>
						<span className="font-bold text-cerulean">
							{requirement} correct {requirementLabel}
						</span>{" "}
						answer{requirement === 1 ? "" : "s"} (fixed, can&apos;t be removed)
					</li>
					{extraRequirements.map((demand) => (
						<li key={demand} className="text-white">
							{demand}
						</li>
					))}
				</ul>
			</li>
			<li>
				Fail a gate → you{" "}
				<span className="font-bold text-cinnabar">remove 1 config</span> and try
				again, deeper gates cost more
			</li>
			<li>
				Clear all {victoryGate} →{" "}
				<span className="font-bold text-viridian">
					+{gateReward} KB storage
				</span>
			</li>
		</ul>
	</div>
);
