import type { CategoryCode } from "~/shared/lib/categories";
import type {
	AnswerOutcome,
	AnswerType,
} from "~/modules/run/run/domain/run.model";
import type { Config } from "~/modules/run/config/domain/config.model";
import type { CheckStatus } from "~/modules/run/config/domain/effect.model";
import { roleRows } from "~/modules/run/gate/domain/configRole.model";
import { isStakeFatal } from "~/modules/run/run/domain/rules.model";
import type { AnswerScore } from "~/modules/run/run/application/runView.viewmodel";
import { Button } from "~/ui/Button.component";
import {
	ScoreEquationChips,
	type ScoreBonusRow,
} from "~/modules/run/run/presentation/ScoreEquationChips.ui";
import { Paragraph } from "~/ui/typography/Paragraph.component";
import { Subtitle } from "~/ui/typography/Subtitle.component";
import { Title } from "~/ui/typography/Title.component";
import { ConfigChip } from "~/modules/run/config/presentation/ConfigChip.ui";
import {
	RoleList,
	type RowUseAction,
} from "~/modules/run/gate/presentation/RoleList.ui";
import {
	PollCard,
	PollOption,
} from "~/modules/run/poll/presentation/PollCard.ui";
import { PollOutcomeBar } from "~/modules/run/run/presentation/PollOutcomeBar.ui";

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

/**
 * What a failed gate would cost, inline in the pipeline subtitle rather than as a
 * callout: the strip quota grows with depth (`dropCount`), so from around gate 4 a
 * three-config build owes more than it holds and one bad window strips it bare —
 * which is death (ADR-017). Reading red is the only warning a player gets that
 * today's window is sudden death, so it has to sit where the stakes are read.
 */
const StakeOnFailure = ({
	strips,
	configs,
}: {
	strips: number;
	configs: number;
}) => {
	const fatal = isStakeFatal(strips, configs);
	return (
		<Paragraph as="span" size="xs" tone={fatal ? "cinnabar" : "saffron"}>
			{fatal
				? `a fail peels all ${configs} — run over`
				: `a fail peels ${strips}`}
		</Paragraph>
	);
};

type AnsweringScreenProps = {
	configs: readonly Config[];
	checks: readonly CheckStatus[];
	/** Total pipeline slots — shown in the pipeline header when provided. */
	slots?: number;
	/** Configs a failed gate would peel at this depth — omitted, no warning shown. */
	stripsOnFailure?: number;
	category: CategoryCode;
	question: string;
	codeBlock?: string;
	codeSandboxUrl?: string;
	answerType: AnswerType;
	options: readonly PollOption[];
	/**
	 * This gate's answers so far — the poll bar's colours. Required, not optional
	 * with an empty default: a screen missing them renders five grey dashes, which
	 * looks like a fresh gate rather than like a bug.
	 */
	pollOutcomes: readonly AnswerOutcome[];
	pollsPerGate: number;
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
	stripsOnFailure,
	category,
	question,
	codeBlock,
	codeSandboxUrl,
	answerType,
	options,
	pollOutcomes,
	pollsPerGate,
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
	const lintActionFor = (config: Config): RowUseAction | undefined => {
		if (!canLint || !linter || !onLint || config.id !== linter.id)
			return undefined;
		return { cost: lintCost, ready: lintReady ?? true, onUse: onLint };
	};

	return (
		<div className="grid gap-6 lg:grid-cols-[20rem_minmax(0,1fr)] lg:items-start lg:gap-10">
			<div className="flex min-w-0 flex-col gap-6 lg:order-2">
				<span className="flex flex-col gap-2">
					<PollOutcomeBar outcomes={pollOutcomes} pollsPerGate={pollsPerGate} />
					<Paragraph as="span" size="xs" tone="pewter">
						{pollOutcomes.length} of {pollsPerGate} polls
					</Paragraph>
				</span>
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
			<div className="space-y-2 border-t border-zinc-800 pt-4 lg:order-1 lg:border-t-0 lg:border-r lg:pt-0 lg:pr-8">
				<header>
					<Title as="h3">Your pipeline</Title>
					{slots ? (
						<Subtitle>
							{configs.length} of {slots} slots used
							{stripsOnFailure === undefined ? null : (
								<>
									{" · "}
									<StakeOnFailure
										strips={stripsOnFailure}
										configs={configs.length}
									/>
								</>
							)}
						</Subtitle>
					) : null}
				</header>
				<RoleList
					rows={roleRows(configs, checks)}
					getUseAction={lintActionFor}
					foldIdleRows
				/>
			</div>
		</div>
	);
};
