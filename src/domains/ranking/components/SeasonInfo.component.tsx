import { SeasonInfo as SeasonInfoUI } from "~/ui/ranking/SeasonInfo.ui";

import type { Season } from "../models/season.model";
import { calculateDaysRemaining } from "../utils/seasonUtils";

type SeasonInfoProps = {
	season: Season;
};

export const SeasonInfo = ({ season }: SeasonInfoProps) => (
	<SeasonInfoUI
		name={season.name}
		daysRemaining={calculateDaysRemaining(season.endDate)}
	/>
);
