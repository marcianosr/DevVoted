import { useEffect, useRef, useState } from "react";

import { DEVVOTED_LAUNCH_DATE } from "~/config/app";
import type { CommunityStats } from "~/domains/polls/api/communityStats.queries";
import type { RunCategoryCoverage } from "~/domains/runs/models/runCategoryCoverage.model";
import type { PipelineEvaluationContext } from "~/domains/runs/services/pipelineEvaluator.service";
import {
	buildDailyResultShare,
	getBuildNumber,
	DEVVOTED_URL,
} from "~/domains/runs/utils/buildDailyResultShare";
import { toDailyResultShareData } from "~/domains/runs/utils/toDailyResultShareData";
import { DailyResultShare as DailyResultShareUI } from "~/ui/runs/DailyResultShare.ui";

const COPIED_RESET_MS = 2000;

type DailyResultShareProps = {
	currentDate: string;
	categoryCoverage: RunCategoryCoverage[];
	windowContext: PipelineEvaluationContext;
	gateCleared: boolean;
	community: CommunityStats;
	viewerIsCorrect: boolean;
	todayCategoryName: string;
	/** Account-level daily-login streak. Omitted until that feature ships. */
	streakDays?: number;
};

const openShareIntent = (text: string) => {
	const intent = new URL("https://twitter.com/intent/tweet");
	intent.searchParams.set("text", text);
	intent.searchParams.set("url", DEVVOTED_URL);
	window.open(intent.toString(), "_blank", "noopener,noreferrer");
};

/**
 * Wires live run + community data to the presentational share card: builds the
 * ego-safe text via the pure builder, owns the clipboard side-effect and the
 * transient "copied" state, and opens the share intent. No HTML/CSS here.
 */
export const DailyResultShare = ({
	currentDate,
	categoryCoverage,
	windowContext,
	gateCleared,
	community,
	viewerIsCorrect,
	todayCategoryName,
	streakDays,
}: DailyResultShareProps) => {
	const [copied, setCopied] = useState(false);
	const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

	useEffect(
		() => () => {
			if (resetTimer.current) clearTimeout(resetTimer.current);
		},
		[]
	);

	const preview = buildDailyResultShare(
		toDailyResultShareData({
			dayNumber: getBuildNumber(DEVVOTED_LAUNCH_DATE, currentDate),
			categoryCoverage,
			windowContext,
			gateCleared,
			community,
			viewerIsCorrect,
			todayCategoryName,
			streakDays,
		})
	);

	const handleCopy = async () => {
		await navigator.clipboard.writeText(preview);
		setCopied(true);
		if (resetTimer.current) clearTimeout(resetTimer.current);
		resetTimer.current = setTimeout(() => setCopied(false), COPIED_RESET_MS);
	};

	return (
		<DailyResultShareUI
			preview={preview}
			copied={copied}
			onCopy={handleCopy}
			onShare={() => openShareIntent(preview)}
		/>
	);
};
