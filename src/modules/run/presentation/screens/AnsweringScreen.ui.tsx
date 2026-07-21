import type { CategoryCode } from "~/domains/shared/categories";
import type { AnswerType } from "~/modules/run/climb/run.model";
import type { Config } from "~/modules/run/configs/config.model";
import type { CheckStatus } from "~/modules/run/configs/effect.model";
import { roleRows } from "~/modules/run/gate/configRole.model";
import type { AnswerScore } from "~/modules/run/view/runView.viewmodel";
import { Button } from "~/ui/Button.component";
import {
	ScoreEquationChips,
	type ScoreBonusRow,
} from "~/ui/runs/ScoreEquationChips.ui";
import { Title } from "~/ui/typography/Title.component";
import { ConfigChip } from "../configs/ConfigChip.ui";
import { RoleList } from "../gate/RoleList.ui";
import { PollCard, PollOption } from "../poll/PollCard.ui";

/** Chips begin after the option badges have popped in (~620ms of pops). */
const REVEAL_SCORE_START_MS = 500;

/**
 * Turns the reveal's coverage breakdown into equation chips: the streak bonus as
 * a plain chip, then each contributing config as its real ConfigChip (resolved
 * from the equipped pipeline). Base and total are handled by ScoreEquationChips.
 */
const scoreBonusRows = (
	score: AnswerScore,
	configs: readonly Config[]
): ScoreBonusRow[] => {
	const rows: ScoreBonusRow[] =
		score.streakBonus !== 0
			? [{ label: "streak", value: score.streakBonus }]
			: [];
	for (const bonus of score.configBonuses) {
		const config = configs.find((entry) => entry.id === bonus.configId);
		if (!config) continue;
		rows.push({
			label: config.label,
			value: bonus.value,
			chip: <ConfigChip config={config} noTooltip />,
		});
	}
	return rows;
};

type AnsweringScreenProps = {
	configs: readonly Config[];
	checks: readonly CheckStatus[];
	category: CategoryCode;
	question: string;
	answerType: AnswerType;
	options: readonly PollOption[];
	selectedOptionIds?: readonly string[];
	disabledOptionIds?: readonly string[];
	/** When set, the poll is in its post-submit reveal: options go inert and show ✓/✕. */
	correctOptionIds?: readonly string[];
	chosenOptionIds?: readonly string[];
	/** The just-answered poll's coverage breakdown — shown as the reveal's chip equation. */
	revealScore?: AnswerScore;
	canLint?: boolean;
	lintReady?: boolean;
	linter?: Config;
	lintCost?: number;
	canSubmit: boolean;
	onSelect: (optionId: string) => void;
	onSubmit: () => void;
	/** Advances past the reveal to the next poll — the player triggers it, not a timer. */
	onNext: () => void;
	onLint?: () => void;
};

export const AnsweringScreen = ({
	configs,
	checks,
	category,
	question,
	answerType,
	options,
	selectedOptionIds,
	disabledOptionIds,
	correctOptionIds,
	chosenOptionIds,
	revealScore,
	canLint,
	lintReady,
	linter,
	lintCost,
	canSubmit,
	onSelect,
	onSubmit,
	onNext,
	onLint,
}: AnsweringScreenProps) => (
	<div className="flex flex-col gap-6">
		<PollCard
			category={category}
			question={question}
			answerType={answerType}
			options={options}
			selectedOptionIds={selectedOptionIds}
			disabledOptionIds={disabledOptionIds}
			correctOptionIds={correctOptionIds}
			chosenOptionIds={chosenOptionIds}
			canLint={canLint}
			lintReady={lintReady}
			linter={linter}
			lintCost={lintCost}
			onSelect={onSelect}
			onLint={onLint}
		/>
		{revealScore ? (
			<div className="flex flex-col gap-4">
				<hr className="border-theme border-t" />
				<ScoreEquationChips
					isCorrect={revealScore.isCorrect}
					baseCoverage={revealScore.baseCoverage}
					bonuses={scoreBonusRows(revealScore, configs)}
					earnedCoverage={revealScore.earnedCoverage}
					animated
					startDelayMs={REVEAL_SCORE_START_MS}
				/>
			</div>
		) : null}
		<div className="flex justify-end">
			{correctOptionIds !== undefined ? (
				<Button className="rounded-lg" onClick={onNext}>
					Next →
				</Button>
			) : (
				<Button className="rounded-lg" disabled={!canSubmit} onClick={onSubmit}>
					Submit answer →
				</Button>
			)}
		</div>
		<div className="space-y-2">
			<Title as="h3" size="sm">
				Pipelines status
			</Title>
			<RoleList rows={roleRows(configs, checks)} />
		</div>
	</div>
);
