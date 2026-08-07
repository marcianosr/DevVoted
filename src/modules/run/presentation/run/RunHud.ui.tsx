import { clsx } from "clsx";

import { getCategories } from "~/domains/shared/categories";
import { Popover } from "~/ui/Popover.component";
import { STORAGE_CAP_KB } from "../../rules.model";
import { Paragraph } from "~/ui/typography/Paragraph.component";
import {
	ALL_SWATCHES,
	hasThemeColor,
	swatchForGate,
} from "~/modules/run/gate/swatch.model";
import { swatchNameClass } from "~/ui/SwatchMark.component";
import { swatchTheme } from "~/ui/theme/swatchTheme";
import type { AnswerOutcome } from "~/modules/run/climb/run.model";
import { GateSegmentBar } from "./GateSegmentBar.ui";
import { PollOutcomeBar } from "./PollOutcomeBar.ui";
import { StorageGauge } from "./StorageGauge.ui";
import { SummaryDropdown } from "./SummaryDropdown.ui";

type RunHudProps = {
	storage: number;
	gatesCleared: number;
	victoryGate: number;
	pollsAnswered: number;
	pollsPerGate: number;
	/**
	 * This gate's answers so far — the poll bar's colours. Required, not optional
	 * with an empty default: a HUD missing them renders five grey dashes, which
	 * looks like a fresh gate rather than like a bug, and that is exactly how the
	 * prototype route shipped without them.
	 */
	pollOutcomes: readonly AnswerOutcome[];
	coverage: number;
	coverageByCategory: Readonly<Record<string, number>>;
};

const CoverageSummary = ({
	coverage,
	coverageByCategory,
}: Pick<RunHudProps, "coverage" | "coverageByCategory">) => {
	const all = getCategories().map(({ code, name }) => ({
		code,
		name,
		pct: coverageByCategory[code] ?? 0,
	}));
	const coveredCount = all.filter(({ pct }) => pct > 0).length;

	if (coveredCount === 0)
		return (
			<span className="flex items-baseline gap-2">
				<Paragraph as="span" size="xs" tone="pewter">
					Coverage
				</Paragraph>
				<Paragraph as="span" size="xs" tone="theme">
					{coverage}%
				</Paragraph>
			</span>
		);

	return (
		<SummaryDropdown
			trigger={
				<span className="flex flex-col items-start">
					<span className="flex items-baseline gap-1.5">
						<Paragraph as="span" size="xs" tone="pewter">
							Coverage
						</Paragraph>
						<Paragraph as="span" size="xs" tone="theme">
							{coverage}%
						</Paragraph>
					</span>
					<Paragraph as="span" size="xs" tone="pewter">
						across {coveredCount} categor{coveredCount === 1 ? "y" : "ies"}
					</Paragraph>
				</span>
			}
			panelClassName="flex min-w-max flex-col gap-1.5"
		>
			{all.map(({ code, name, pct }) => (
				<span key={code} className="flex items-center gap-3">
					<Paragraph as="span" size="xs">
						{name}
					</Paragraph>
					<Paragraph as="span" size="xs" tone="muted" className="ml-auto">
						{pct}%
					</Paragraph>
				</span>
			))}
		</SummaryDropdown>
	);
};

/** The ⓘ that sits beside a HUD number, opening its explanation on hover or tap. */
const HudHint = ({
	label,
	children,
}: {
	label: string;
	children: React.ReactNode;
}) => (
	<Popover
		ariaLabel={label}
		content={
			<Paragraph size="xs" className="max-w-xs">
				{children}
			</Paragraph>
		}
	>
		<span className="text-pewter" aria-hidden>
			ⓘ
		</span>
	</Popover>
);

const GateName = ({ gate }: { gate: number }) => {
	const swatch = swatchForGate(gate);
	if (!swatch) return null;
	return (
		<span {...(hasThemeColor(swatch) ? swatchTheme(swatch.theme) : {})}>
			<Paragraph
				as="span"
				size="xs"
				className={clsx("font-bold", swatchNameClass(swatch.finish))}
			>
				{swatch.gateName}
			</Paragraph>
		</span>
	);
};

export const RunHud = ({
	storage,
	gatesCleared,
	victoryGate,
	pollsAnswered,
	pollsPerGate,
	pollOutcomes,
	coverage,
	coverageByCategory,
}: RunHudProps) => (
	<div className="border-b border-zinc-800 pb-3 text-sm">
		<div className="flex flex-col gap-2 sm:hidden">
			<div className="flex items-center justify-between gap-3">
				<StorageGauge usedKb={storage} capKb={STORAGE_CAP_KB} />
				<span className="flex items-center gap-2">
					<PollOutcomeBar outcomes={pollOutcomes} pollsPerGate={pollsPerGate} />
					<Paragraph as="span" size="xs" tone="pewter">
						{pollsAnswered} of {pollsPerGate} polls
					</Paragraph>
				</span>
			</div>
			<span className="flex flex-col gap-1">
				<GateSegmentBar
					swatches={ALL_SWATCHES}
					gatesCleared={gatesCleared}
					pollsAnswered={pollsAnswered}
					pollsPerGate={pollsPerGate}
					label={`gate ladder: gate ${gatesCleared} of ${victoryGate}`}
				/>
			</span>
		</div>

		<div className="hidden items-center gap-6 sm:flex">
			<span className="flex shrink-0 items-start gap-1.5">
				<StorageGauge usedKb={storage} capKb={STORAGE_CAP_KB} />
				<HudHint label="How storage works">
					Storage caps at {STORAGE_CAP_KB}KB. Clear gates and answer correctly
					to earn KB — income beyond the cap is discarded.
				</HudHint>
			</span>
			<span className="flex shrink-0 items-start gap-1.5">
				<span className="flex w-56 flex-col gap-1">
					<Paragraph as="span" size="xs" tone="pewter">
						<GateName gate={gatesCleared} /> gate · {gatesCleared} /{" "}
						{victoryGate}
					</Paragraph>
					<GateSegmentBar
						swatches={ALL_SWATCHES}
						gatesCleared={gatesCleared}
						pollsAnswered={pollsAnswered}
						pollsPerGate={pollsPerGate}
						label={`gate ${gatesCleared} of ${victoryGate}`}
					/>
				</span>
				<HudHint label="How gates work">
					Each gate is {pollsPerGate} polls judged against the checks in your
					pipeline. Clear one to earn its swatch and its payout; break one and
					it peels configs off your build. Gate {victoryGate} ends the climb.
				</HudHint>
			</span>
			<span className="flex shrink-0 items-center gap-2">
				<PollOutcomeBar outcomes={pollOutcomes} pollsPerGate={pollsPerGate} />
				<Paragraph as="span" size="xs" tone="pewter">
					{pollsAnswered} of {pollsPerGate} polls
				</Paragraph>
			</span>
			<div className="ml-auto flex shrink-0 items-center gap-6">
				<CoverageSummary
					coverage={coverage}
					coverageByCategory={coverageByCategory}
				/>
			</div>
		</div>
	</div>
);
