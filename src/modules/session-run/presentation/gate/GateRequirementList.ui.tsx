import type { Config } from "~/modules/session-run/configs/config.model";
import type { CheckStatus } from "~/modules/session-run/configs/effect.model";
import { Subtitle } from "~/ui/typography/Subtitle.component";
import { CheckList, PerkList } from "./CheckList.ui";

const perksOf = (
	configs: readonly Config[],
	checks: readonly CheckStatus[]
): readonly Config[] =>
	configs.filter(
		(config) => !checks.some((check) => check.sourceConfigId === config.id)
	);

type GateRequirementListProps = {
	checks: readonly CheckStatus[];
	configs: readonly Config[];
	gateNumber: number;
	pollsToGate: number;
	gateReward: number;
	compact?: boolean;
};

const CompactGate = ({
	checks,
	configs,
	gateNumber,
	pollsToGate,
	gateReward,
}: Omit<GateRequirementListProps, "compact">) => {
	const perks = perksOf(configs, checks);
	return (
		<div className="flex flex-col gap-2">
			<div className="flex items-baseline justify-between gap-2">
				<Subtitle>Pipelines · Gate #{gateNumber}</Subtitle>
				<span className="text-sm text-pewter">
					{pollsToGate} left · +{gateReward}KB
				</span>
			</div>
			{perks.length > 0 ? <PerkList perks={perks} /> : null}
			<CheckList checks={checks} configs={configs} />
		</div>
	);
};

export const GateRequirementList = ({
	checks,
	configs,
	gateNumber,
	pollsToGate,
	gateReward,
	compact,
}: GateRequirementListProps) => {
	if (compact)
		return (
			<CompactGate
				checks={checks}
				configs={configs}
				gateNumber={gateNumber}
				pollsToGate={pollsToGate}
				gateReward={gateReward}
			/>
		);

	const perks = perksOf(configs, checks);
	return (
		<div className="flex flex-col gap-3">
			<CheckList checks={checks} configs={configs} />

			{perks.length > 0 ? (
				<>
					<Subtitle>Pipeline perks</Subtitle>
					<PerkList perks={perks} />
				</>
			) : null}

			<Subtitle>
				Total reward if all pass:{" "}
				<span className="font-bold text-viridian">
					+{gateReward} KB storage
				</span>
			</Subtitle>
		</div>
	);
};
