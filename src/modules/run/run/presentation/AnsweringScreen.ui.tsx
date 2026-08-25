import type { AnswerOutcome } from "~/modules/run/run/domain/runPoll.model";
import type { Config } from "~/modules/run/config/domain/config.model";
import { roleRows } from "~/modules/run/gate/domain/configRole.model";
import type { AuditView } from "~/modules/run/run/application/gateStake.viewmodel";
import type {
	AnswerReveal,
	AnswerScore,
} from "~/modules/run/run/application/answerScore.viewmodel";
import type { PollView } from "~/modules/run/run/application/pollView.viewmodel";
import type { PollClockProps } from "~/modules/run/run/presentation/PollClock.ui";
import type { PaidActions } from "~/modules/run/run/application/paidActions.viewmodel";
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
	type PollSplitView,
} from "~/modules/run/poll/presentation/PollCard.ui";
import { PollOutcomeBar } from "~/modules/run/run/presentation/PollOutcomeBar.ui";
import { PollClock } from "~/modules/run/run/presentation/PollClock.ui";
import {
	UpcomingCategories,
	type UpcomingCategoriesProps,
} from "~/modules/run/run/presentation/UpcomingCategories.ui";

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
	/** The gate's live audits — their cues stay on screen the whole window,
	 * because a rule like the mirror changes how every poll should be played. */
	audits?: readonly AuditView[];
	/** Configs an audit has taken offline for this poll (ADR-038). */
	offlineConfigs?: readonly Config[];
	/** The gate mirrors its polls: the card asks for the incorrect options. */
	mirroredPolls?: boolean;
	/** A Timeout audit's clock. One object because a rail with no cap cannot be
	 * drawn, so the pair is all-or-nothing. */
	clock?: PollClockProps;
	/** Total pipeline slots — shown in the pipeline header when provided. */
	slots?: number;
	poll: PollView;
	/**
	 * This gate's answers so far — the poll bar's colours. Required, not optional
	 * with an empty default: a screen missing them renders five grey dashes, which
	 * looks like a fresh gate rather than like a bug.
	 */
	pollOutcomes: readonly AnswerOutcome[];
	pollsPerGate: number;
	selectedOptionIds?: readonly string[];
	disabledOptionIds?: readonly string[];
	/** Set once the answer is in: the options go inert, and the score reads out
	 * below them as the chip equation. */
	reveal?: AnswerReveal;
	/** Lint and peek, whole: both hang off the row of the config that sells them. */
	paidActions?: PaidActions;
	/** False while the run is mid-request or sitting on the reveal — a paid action
	 * the engine would refuse must not offer itself. */
	interactive?: boolean;
	/** The bought split for this poll — absent until the peek is paid for. */
	split?: PollSplitView;
	/** Correct answers this gate's polls hold (.length) — absent when nothing counts. */
	correctAnswersThisGate?: number;
	/** Prefetch's reveal; absent when no installed config reads the draw.
	 * "this gate" includes the poll on screen: it states what is left, not
	 * what is next. */
	upcoming?: UpcomingCategoriesProps;
	canSubmit: boolean;
	onSelect: (optionId: string) => void;
	onSubmit: () => void;
	/** Advances past the reveal to the next poll — the player triggers it, not a timer. */
	onNext: () => void;
	onLint?: () => void;
	onPeek?: () => void;
};

export const AnsweringScreen = ({
	configs,
	audits = [],
	offlineConfigs = [],
	mirroredPolls = false,
	clock,
	slots,
	poll,
	pollOutcomes,
	pollsPerGate,
	selectedOptionIds,
	disabledOptionIds,
	reveal,
	paidActions,
	interactive = true,
	split,
	correctAnswersThisGate,
	upcoming,
	canSubmit,
	onSelect,
	onSubmit,
	onNext,
	onLint,
	onPeek,
}: AnsweringScreenProps) => {
	// Both paid actions hang off the row of the config that sells them, so the
	// pipeline stays the one place a build's powers are read from.
	const useActionFor = (config: Config): RowUseAction | undefined => {
		if (!paidActions) return undefined;
		const { canLint, lintReady, linter, lintCost } = paidActions;
		if (canLint && linter && onLint && config.id === linter.id)
			return { cost: lintCost, ready: lintReady && interactive, onUse: onLint };
		const { canPeek, peekReady, peeker, peekCost } = paidActions;
		if (canPeek && peeker && onPeek && config.id === peeker.id)
			return { cost: peekCost, ready: peekReady && interactive, onUse: onPeek };
		return undefined;
	};

	// A suppressed audit is not in force, so its cue would be a lie the defeat
	// device already paid to remove.
	const cues = audits.filter(
		(audit) => audit.answerCue !== undefined && !audit.suppressed
	);
	const offlineNames = offlineConfigs.map((config) => config.label).join(", ");

	return (
		<div className="grid gap-6 lg:grid-cols-[20rem_minmax(0,1fr)] lg:items-start lg:gap-10">
			<div className="flex min-w-0 flex-col gap-6 lg:order-2">
				<span className="flex flex-col gap-2">
					<PollOutcomeBar outcomes={pollOutcomes} pollsPerGate={pollsPerGate} />
					<Paragraph as="span" size="xs" tone="muted">
						{pollOutcomes.length} of {pollsPerGate} polls
					</Paragraph>
				</span>
				{upcoming ? <UpcomingCategories {...upcoming} /> : null}
				{cues.length > 0 || offlineConfigs.length > 0 ? (
					<div className="flex items-start justify-between gap-3 rounded-lg border border-saffron/40 px-3 py-2">
						<span className="flex min-w-0 flex-col gap-1">
							{cues.map((audit) => (
								<Paragraph key={audit.id} as="span" size="sm" tone="saffron">
									{audit.answerCue}
								</Paragraph>
							))}
							{/* Named, not just announced: the cue says a dependency is down,
							    and the only useful next thought is *which* one. Re-read every
							    poll, since a flake and a rolling outage move. */}
							{offlineConfigs.length > 0 ? (
								<Paragraph as="span" size="sm" tone="muted">
									Offline right now:{" "}
									<Paragraph as="span" tone="cinnabar" className="font-bold">
										{offlineNames}
									</Paragraph>
								</Paragraph>
							) : null}
						</span>
						{clock ? <PollClock {...clock} /> : null}
					</div>
				) : null}
				<PollCard
					poll={poll}
					selectedOptionIds={selectedOptionIds}
					disabledOptionIds={disabledOptionIds}
					reveal={reveal}
					split={split}
					correctAnswersThisGate={correctAnswersThisGate}
					mirrored={mirroredPolls}
					onSelect={onSelect}
				/>
				{reveal?.score ? (
					<div className="flex flex-col gap-4">
						<hr className="border-theme border-t" />
						<ScoreEquationChips
							isCorrect={reveal.score.isCorrect}
							baseCoverage={reveal.score.baseCoverage}
							bonuses={scoreBonusRows(reveal.score, configs)}
							earnedCoverage={reveal.score.earnedCoverage}
							difficulty={reveal.score.difficulty}
							animated
							startDelayMs={REVEAL_SCORE_START_MS}
						/>
					</div>
				) : null}
				<div className="flex justify-end">
					{reveal ? (
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
			<div className="space-y-2 border-t border-edge pt-4 lg:order-1 lg:border-t-0 lg:border-r lg:pt-0 lg:pr-8">
				<header>
					<Title as="h3">Your pipeline</Title>
					{slots ? (
						<Subtitle>
							{configs.length} of {slots} slots used
						</Subtitle>
					) : null}
				</header>
				<RoleList
					rows={roleRows(configs)}
					getUseAction={useActionFor}
					offlineConfigIds={offlineConfigs.map((config) => config.id)}
					foldIdleRows
				/>
			</div>
		</div>
	);
};
