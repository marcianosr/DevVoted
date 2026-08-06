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
import { Subtitle } from "~/ui/typography/Subtitle.component";
import { Title } from "~/ui/typography/Title.component";
import { ConfigChip } from "../configs/ConfigChip.ui";
import { RoleList, type RowUseAction } from "../gate/RoleList.ui";
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
	/** Total pipeline slots — shown in the pipeline header when provided. */
	slots?: number;
	category: CategoryCode;
	question: string;
	codeBlock?: string;
	codeSandboxUrl?: string;
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
	slots,
	category,
	question,
	codeBlock,
	codeSandboxUrl,
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
}: AnsweringScreenProps) => {
	// The linter acts from its own pipeline row: it offers the "use" button
	// instead of a separate button on the poll card. The row's dot stays an
	// honest "skipped" until the linter is used — the button is the affordance.
	const lintActionFor = (config: Config): RowUseAction | undefined => {
		if (!canLint || !linter || !onLint || config.id !== linter.id)
			return undefined;
		return { cost: lintCost, ready: lintReady ?? true, onUse: onLint };
	};

	return (
		<div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-10">
			<div className="flex flex-1 flex-col gap-6">
				<PollCard
					category={category}
					question={question}
					codeBlock={codeBlock}
					codeSandboxUrl={codeSandboxUrl}
					answerType={answerType}
					options={options}
					selectedOptionIds={selectedOptionIds}
					disabledOptionIds={disabledOptionIds}
					correctOptionIds={correctOptionIds}
					chosenOptionIds={chosenOptionIds}
					onSelect={onSelect}
				/>
				{revealScore ? (
					<div className="flex flex-col gap-4">
						<hr className="border-theme border-t" />
						<ScoreEquationChips
							isCorrect={revealScore.isCorrect}
							baseCoverage={revealScore.baseCoverage}
							bonuses={scoreBonusRows(revealScore, configs)}
							earnedCoverage={revealScore.earnedCoverage}
							difficulty={revealScore.difficulty}
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
						<Button
							className="rounded-lg"
							disabled={!canSubmit}
							onClick={onSubmit}
						>
							Submit answer →
						</Button>
					)}
				</div>
			</div>
			<div className="space-y-2 border-t border-zinc-800 pt-4 lg:pt-0 lg:shrink-0 lg:border-t-0 lg:pl-8 lg:border-l">
				<header>
					<Title as="h3">Your pipeline</Title>
					{slots ? (
						<Subtitle>
							{configs.length} of {slots} slots used
						</Subtitle>
					) : null}
				</header>
				<RoleList
					rows={roleRows(configs, checks)}
					getUseAction={lintActionFor}
				/>
			</div>
		</div>
	);
};
