import { Action } from "../Action.ui";
import { Caret } from "../Caret.ui";
import { Chip } from "../Chip.ui";
import {
	Ledger,
	type LedgerEntry,
	ledgerTotal,
	ledgerTotalLabel,
} from "../Ledger.ui";
import { Swatch } from "../Swatch.ui";
import { SwatchTrack, type SwatchTrackItem } from "../SwatchTrack.ui";
import { Text } from "../Text.ui";
import type { CrumbVerdict } from "../Trail.ui";

const SCREEN = "flex flex-col bg-theme-faint";

const HERO = "flex flex-col items-center gap-5 px-5 py-10 text-center";
const NAMING = "flex flex-col items-center gap-1";
const FIGURES = "flex flex-wrap items-center justify-center gap-3 pt-2";

const REPORT = "border-t border-edge";

const DISCLOSURE = "flex px-5 pt-4";
const TOGGLE =
	"group/fold inline-flex items-center gap-1.5 rounded text-zinc-500 transition-colors hover:text-zinc-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cerulean";

const LEDGERS =
	"flex flex-col divide-y divide-edge lg:flex-row lg:items-stretch lg:divide-x lg:divide-y-0 max-w-4xl mx-auto";
const FOOTER =
	"flex flex-wrap items-center justify-between gap-4 border-t border-edge px-5 py-4";
const ONWARD = "flex flex-wrap items-center gap-4";

type Verdict =
	| {
			outcome: "cleared";
			clearedGate: number;
			spendableKb: number;
			onContinue?: () => void;
	  }
	| { outcome: "held"; peelCount: number; onChoosePeel?: () => void };

export type RewardScreenProps = {
	gateName: string;
	requiredCoverage: number;
	track: readonly SwatchTrackItem[];
	coverage: readonly LedgerEntry[];
	storage: readonly LedgerEntry[];
	outcomes: readonly CrumbVerdict[];
	detailShown: boolean;
	onToggleDetail: () => void;
	onReviewAnswers?: () => void;
	theme?: string;
} & Verdict;

export const RewardScreen = (props: RewardScreenProps) => {
	const {
		gateName,
		requiredCoverage,
		track,
		coverage,
		storage,
		outcomes,
		detailShown,
		onToggleDetail,
		onReviewAnswers,
		theme,
	} = props;

	const covered = ledgerTotal(coverage);
	const met = covered >= requiredCoverage;
	const correct = outcomes.filter((verdict) => verdict === "correct").length;
	const cleared = props.outcome === "cleared";

	return (
		<article data-gate-theme={theme} className={SCREEN}>
			<div className={HERO}>
				<Swatch size="award" state={cleared ? "earned" : "pending"} />

				<div className={NAMING}>
					<Text as="h1" size="ask">
						{gateName} Swatch
					</Text>
					{cleared ? (
						<Text as="p" size="meta" tone="muted">
							gate {props.clearedGate} cleared · yours across every run
						</Text>
					) : (
						<Text as="p" size="meta" tone="cinnabar">
							not earned · the gate holds
						</Text>
					)}
				</div>

				<SwatchTrack items={track} layout="stacked" counting="swatches" />

				<div className={FIGURES}>
					<Chip tone={met ? "raised" : "cinnabar"} size="lg">
						<Text size="body" tone={met ? "celadon" : "cinnabar"}>
							{covered}%
						</Text>{" "}
						<Text size="body" tone="muted">
							of {requiredCoverage}% needed
						</Text>
					</Chip>
					<Chip tone="raised" size="lg">
						{ledgerTotalLabel(storage, "KB")}
						{cleared ? null : " kept"}
					</Chip>
					<Chip tone="raised" size="lg">
						{correct} of {outcomes.length} correct
					</Chip>
				</div>
			</div>

			<div className={REPORT}>
				<div className={DISCLOSURE}>
					<button
						type="button"
						aria-expanded={detailShown}
						onClick={onToggleDetail}
						className={TOGGLE}
					>
						<Caret />
						<Text size="body" tone="inherit">
							{detailShown ? "Collapse details" : "Expand details"}
						</Text>
					</button>
				</div>

				<div className={LEDGERS}>
					<Ledger
						title="coverage"
						unit="%"
						entries={coverage}
						showDetail={detailShown}
						footer={
							cleared
								? undefined
								: {
										label: "short by",
										value: `${Math.round((requiredCoverage - covered) * 10) / 10}%`,
										tone: "cinnabar",
									}
						}
					/>
					<Ledger
						title="storage"
						unit="KB"
						entries={storage}
						showDetail={detailShown}
						footer={
							cleared
								? undefined
								: {
										label: "kept",
										value: ledgerTotalLabel(storage, "KB"),
									}
						}
					/>
				</div>

				<div className={FOOTER}>
					<div className={ONWARD}>
						{cleared ? (
							<>
								{props.onContinue ? (
									<Action
										label="Enter shop →"
										size="lg"
										emphasis="loud"
										onUse={props.onContinue}
									/>
								) : null}
								<Text size="body" tone="muted">
									{props.spendableKb} KB to spend
								</Text>
							</>
						) : (
							<>
								{props.onChoosePeel ? (
									<Action
										label={`Choose ${props.peelCount} to peel →`}
										size="lg"
										emphasis="danger"
										onUse={props.onChoosePeel}
									/>
								) : null}
								<Text size="body" tone="muted">
									You pick which configs go. Then the shop opens and {gateName}{" "}
									runs again on {outcomes.length} fresh polls.
								</Text>
							</>
						)}
					</div>
					{onReviewAnswers ? (
						<Action label="Review answers" onUse={onReviewAnswers} />
					) : null}
				</div>
			</div>
		</article>
	);
};
