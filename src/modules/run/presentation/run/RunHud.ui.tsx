import { type CategoryCode, getCategories } from "~/domains/shared/categories";
import { Popover } from "~/ui/Popover.component";
import { Swatch } from "~/ui/Swatch.component";
import { categoryTheme } from "~/ui/theme/categoryTheme";
import { STORAGE_CAP_KB } from "../../rules.model";
import { Paragraph } from "~/ui/typography/Paragraph.component";
import { ALL_SWATCHES } from "~/modules/run/gate/swatch.model";
import { GateSegmentBar } from "./GateSegmentBar.ui";
import { StorageGauge } from "./StorageGauge.ui";
import { SummaryDropdown } from "./SummaryDropdown.ui";

type RunHudProps = {
	storage: number;
	gatesCleared: number;
	victoryGate: number;
	pollsAnswered: number;
	pollsPerGate: number;
	category?: CategoryCode;
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
				<Paragraph as="span" size="sm" tone="pewter">
					Coverage
				</Paragraph>
				<Paragraph as="span" size="sm" tone="theme">
					{coverage}%
				</Paragraph>
			</span>
		);

	return (
		<SummaryDropdown
			trigger={
				<span className="flex flex-col items-start">
					<span className="flex items-baseline gap-1.5">
						<Paragraph as="span" size="sm" tone="pewter">
							Coverage
						</Paragraph>
						<Paragraph as="span" size="sm" tone="theme">
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
				<span
					key={code}
					{...categoryTheme(code)}
					className="flex items-center gap-3"
				>
					<Swatch size="sm" />
					<Paragraph as="span" size="sm" tone="theme">
						{name}
					</Paragraph>
					<Paragraph as="span" size="sm" tone="muted" className="ml-auto">
						{pct}%
					</Paragraph>
				</span>
			))}
		</SummaryDropdown>
	);
};

export const RunHud = ({
	storage,
	gatesCleared,
	victoryGate,
	pollsAnswered,
	pollsPerGate,
	category,
	coverage,
	coverageByCategory,
}: RunHudProps) => (
	<div
		className="border-b border-zinc-800 pb-3 text-sm "
		{...(category ? categoryTheme(category) : {})}
	>
		<div className="flex flex-col gap-2 sm:hidden">
			<div className="flex items-center justify-between gap-3">
				<StorageGauge usedKb={storage} capKb={STORAGE_CAP_KB} />
				<span className="flex items-baseline gap-2">
					<Paragraph as="span" size="sm" tone="pewter">
						{pollsAnswered}/{pollsPerGate} polls
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
				<Popover
					ariaLabel="How storage works"
					content={
						<p className="max-w-xs text-sm">
							Storage caps at {STORAGE_CAP_KB}KB. Clear gates and answer
							correctly to earn KB — income beyond the cap is discarded.
						</p>
					}
				>
					<span className="text-pewter" aria-hidden>
						ⓘ
					</span>
				</Popover>
			</span>
			<span className="flex w-56 shrink-0 flex-col gap-1">
				<Paragraph as="span" size="sm" tone="pewter">
					gate <span className="text-theme">{gatesCleared}</span> /{" "}
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
			<span className="flex shrink-0 items-baseline gap-1.5">
				<Paragraph as="span" size="sm" tone="theme">
					{pollsAnswered} / {pollsPerGate}
				</Paragraph>
				<Paragraph as="span" size="sm" tone="pewter">
					polls
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
