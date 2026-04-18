import { Config } from "~/domains/configs/models/config";
import { ShopPreview } from "~/domains/economy/components/ShopPreview";
import type { ExposedConfigDeck } from "~/domains/runs/api/queries";
import type { ScoreCalculation } from "~/domains/score/services/score.service";
import type { CategoryCode } from "~/domains/shared/categories";

import type { CommunityStats } from "../api/queries";
import type { PollOption } from "../models/pollOption";
import SelectedOptionsSummary from "./SelectedOptionsSummary";

type PollResultsSectionProps = {
	options: PollOption[];
	selectedOptions: string[];
	score?: ScoreCalculation;
	communityStats?: CommunityStats;
	categoryCode: CategoryCode;
	explanation?: string | null;
	exposedConfigDeck?: ExposedConfigDeck | null;
	offeredConfigs: (Config & { originalCost?: number })[];
};

export const PollResultsSection = ({
	options,
	selectedOptions,
	score,
	communityStats,
	categoryCode,
	explanation,
	exposedConfigDeck,
	offeredConfigs,
}: PollResultsSectionProps) => (
	<>
		<SelectedOptionsSummary
			options={options}
			selectedOptions={selectedOptions}
			score={score}
			communityStats={communityStats}
			categoryCode={categoryCode}
			explanation={explanation}
			exposedConfigDeck={exposedConfigDeck}
		/>
		<ShopPreview offeredConfigs={offeredConfigs} />
	</>
);
