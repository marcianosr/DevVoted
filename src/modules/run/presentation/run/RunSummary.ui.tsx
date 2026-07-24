import type { AnsweredPoll } from "~/modules/run/climb/run.model";
import type { Config } from "~/modules/run/configs/config.model";
import {
	deriveGateLadder,
	type GateOutcome,
	type GateOutcomeStatus,
} from "~/modules/run/gate/gateLadder.model";
import { storageCreditRate } from "~/modules/run/rules.model";
import { MetaStorageBar } from "~/ui/runs/MetaStorageBar.ui";
import { StatusLine } from "~/ui/runs/StatusLine.ui";
import { type StatusBadgeVariant } from "~/ui/StatusBadge.ui";
import {
	Paragraph,
	type ParagraphTone,
} from "~/ui/typography/Paragraph.component";
import { Subtitle } from "~/ui/typography/Subtitle.component";
import { Title } from "~/ui/typography/Title.component";
import { ConfigChip } from "../configs/ConfigChip.ui";
import { ReviewAnswers } from "./ReviewAnswers.ui";

type RunSummaryProps = {
	won: boolean;
	gatesCleared: number;
	victoryGate: number;
	coverage: number;
	storage: number;
	/** Configs the run ended with, shown beside the pipeline ladder. */
	configs?: readonly Config[];
	/** Every poll answered across the run, for the fold-out review. */
	answered?: readonly AnsweredPoll[];
};

const STATUS_BADGE: Record<GateOutcomeStatus, StatusBadgeVariant> = {
	pass: "pass",
	fail: "fail",
	skip: "skip",
};

// The stall gate reads red, cleared gates default, unreached ones muted.
const STATUS_TONE: Record<GateOutcomeStatus, ParagraphTone> = {
	pass: "default",
	fail: "cinnabar",
	skip: "muted",
};

const gateLabel = ({ gate, status }: GateOutcome): string => {
	if (status === "pass") return `Gate ${gate} cleared`;
	if (status === "fail") return `Gate ${gate} — pipeline broke here`;
	return `Gate ${gate} — not reached`;
};

export const RunSummary = ({
	won,
	gatesCleared,
	victoryGate,
	coverage,
	storage,
	configs,
	answered,
}: RunSummaryProps) => {
	const ladder = deriveGateLadder(gatesCleared, won, victoryGate);
	const creditRate = storageCreditRate(won ? "victory" : "dead", gatesCleared);
	const carriedKb = storage * creditRate;
	const bankedPct = Math.round(creditRate * 100);

	return (
		<div className="flex flex-col gap-6">
			<header>
				{won ? (
					<Title tone="gradient">And now it&apos;s green!</Title>
				) : (
					<Title tone="cinnabar">Build broke!</Title>
				)}
				<Subtitle>
					{won
						? "You cleared every gate with your build intact."
						: "Your pipeline was stripped bare and broke."}
				</Subtitle>
			</header>

			<section className="flex flex-col">
				<Title size="md">Results</Title>
				<Subtitle>Pipeline run</Subtitle>
				<Paragraph as="div" size="sm" className="flex gap-2">
					<Paragraph as="span" size="sm" tone="viridian">
						{gatesCleared} cleared
					</Paragraph>
					<span className="text-zinc-300">·</span>
					<Paragraph as="span" size="sm" tone={won ? "viridian" : "cinnabar"}>
						{won ? "summit reached" : `stalled at gate ${gatesCleared + 1}`}
					</Paragraph>
				</Paragraph>
				<div>
					{ladder.map((outcome) => (
						<StatusLine
							key={outcome.gate}
							badge={STATUS_BADGE[outcome.status]}
							line={gateLabel(outcome)}
							lineTone={STATUS_TONE[outcome.status]}
							lineSize="sm"
						/>
					))}
				</div>
				<Paragraph size="sm" className="mt-1">
					<span className="text-zinc-400">Coverage score</span>{" "}
					<span className="font-extrabold text-gradient-green">
						{coverage}%
					</span>
				</Paragraph>
			</section>

			{configs && configs.length > 0 && (
				<section className="flex flex-col gap-2">
					<Subtitle>Configs installed</Subtitle>
					<ul className="flex flex-wrap gap-2">
						{configs.map((config) => (
							<li key={config.id}>
								<ConfigChip config={config} noTooltip />
							</li>
						))}
					</ul>
				</section>
			)}

			<section className="flex flex-col gap-2">
				<Title size="md">Rewards</Title>
				<Paragraph size="sm" tone="muted">
					{won
						? `You summited — all ${storage}KB of your run storage banks into meta.`
						: `You built up ${storage}KB this run, but breaking at gate ${
								gatesCleared + 1
							} banks only ${bankedPct}% into meta — the rest is lost.`}
				</Paragraph>

				<MetaStorageBar carriedKb={carriedKb} totalKb={storage} />
			</section>

			{answered && answered.length > 0 && <ReviewAnswers answered={answered} />}
		</div>
	);
};
