import { clsx } from "clsx";

import type { GateRung } from "~/modules/run/pipeline/swatch.model";
import { roundToOneDecimal } from "~/modules/run/rules.model";
import { GainBar } from "~/ui/runs/GainBar.ui";
import { Swatch } from "~/ui/Swatch.component";
import { swatchTheme } from "~/ui/theme/swatchTheme";
import { Tooltip } from "~/ui/Tooltip.component";
import { Paragraph } from "~/ui/typography/Paragraph.component";

type GateSegmentBarProps = {
	/** One rung per gate, in ladder order — each carries the swatch that opens it. */
	rungs: readonly GateRung[];
	/** Gates banked. The gate being played is `gatesCleared + 1`. */
	gatesCleared: number;
	/** Total run coverage, so a pip can price its own gap. */
	coverage: number;
	label: string;
};

const clamp01 = (value: number): number =>
	Math.max(0, Math.min(1, Number.isFinite(value) ? value : 0));

/** Everything one pip needs to describe itself, held or not. */
type PipState = {
	readonly rung: GateRung;
	readonly held: boolean;
	readonly coverage: number;
	readonly progress: number;
	readonly toGo: number;
};

const pipStateOf = (
	rung: GateRung,
	gatesCleared: number,
	coverage: number
): PipState => {
	const required = rung.coverageRequired;
	return {
		rung,
		coverage,
		// You are standing on `gatesCleared`, so that pip is held like the rest.
		held: rung.gate <= gatesCleared,
		progress: required === undefined ? 1 : clamp01(coverage / required),
		toGo: required === undefined ? 0 : roundToOneDecimal(required - coverage),
	};
};

const spokenName = ({ rung, held, toGo }: PipState): string => {
	const name = rung.swatch?.name ?? `gate ${rung.gate}`;
	if (held) return `gate ${rung.gate}, ${name}, collected`;
	if (rung.coverageRequired === undefined)
		return `gate ${rung.gate}, ${name}, free`;
	if (toGo <= 0)
		return `gate ${rung.gate}, ${name}, ready to unlock at ${rung.coverageRequired}% coverage`;
	return `gate ${rung.gate}, ${name}, opens at ${rung.coverageRequired}% coverage, ${toGo}% to go`;
};

const PipDetail = ({ state }: { state: PipState }) => {
	const { rung, held, coverage, toGo } = state;
	const { swatch, gate, coverageRequired } = rung;
	return (
		<span
			{...(swatch && !swatch.legendary ? swatchTheme(swatch.theme) : {})}
			className="flex flex-col gap-1 p-1"
		>
			<Paragraph as="span" size="xs" tone="muted">
				gate {gate}
			</Paragraph>
			<span className="flex items-center gap-2">
				{swatch?.legendary ? (
					<span className="inline-block h-3.5 w-3.5 shrink-0 rounded legendary-ring" />
				) : swatch ? (
					<Swatch size="sm" />
				) : null}
				<Paragraph
					as="span"
					size="sm"
					className={clsx(
						"font-bold",
						swatch?.legendary ? "text-zinc-100" : "text-theme"
					)}
				>
					{swatch?.name ?? `Gate ${gate}`}
				</Paragraph>
			</span>

			{held ? (
				<Paragraph as="span" size="xs" tone="viridian">
					Collected
				</Paragraph>
			) : coverageRequired === undefined ? (
				<Paragraph as="span" size="xs" tone="muted">
					Free with your starting pipeline
				</Paragraph>
			) : (
				<>
					<Paragraph as="span" size="xs" tone="muted">
						Opens at{" "}
						<span className="font-bold text-zinc-100">{coverageRequired}%</span>{" "}
						coverage
					</Paragraph>
					<Paragraph as="span" size="xs" tone="faint">
						{toGo > 0 ? (
							<>
								you have{" "}
								<span className="font-bold text-viridian">{coverage}%</span>
								{" · "}
								<span className="font-bold">{toGo}%</span> to go
							</>
						) : (
							<span className="font-bold text-viridian">
								ready — unlock it in the shop
							</span>
						)}
					</Paragraph>
					<GainBar
						from={0}
						to={coverage}
						cap={coverageRequired}
						label={`coverage toward ${swatch?.name ?? `gate ${gate}`}`}
					/>
				</>
			)}
		</span>
	);
};

/**
 * The climb as one pip per gate, each wearing the colour of the swatch that opens
 * it — so the bar is the swatch ladder, not just a progress meter. Gates you hold
 * read solid; the rest sit dimmed as a preview of the collection ahead, the one
 * you are paying for filling as coverage accrues. Every pip is its own button, so
 * hover (or tap) reveals that gate's swatch, its price, and the gap left.
 */
export const GateSegmentBar = ({
	rungs,
	gatesCleared,
	coverage,
	label,
}: GateSegmentBarProps) => (
	<span role="group" aria-label={label} className="flex shrink-0 gap-1">
		{rungs.map((rung) => {
			const state = pipStateOf(rung, gatesCleared, coverage);
			const { swatch } = rung;
			const { held, progress } = state;
			const fill = swatch?.legendary
				? "bg-legendary"
				: swatch
					? "bg-theme"
					: "bg-zinc-400";
			return (
				<Tooltip key={rung.gate} compact content={<PipDetail state={state} />}>
					<button
						type="button"
						aria-label={spokenName(state)}
						{...(swatch && !swatch.legendary ? swatchTheme(swatch.theme) : {})}
						className="h-3 w-3 cursor-pointer overflow-hidden rounded-sm bg-zinc-800 transition hover:brightness-125"
					>
						<span
							className={clsx(
								"block h-full rounded-sm transition-all",
								fill,
								!held && "opacity-25"
							)}
							style={{
								width: held ? "100%" : `${roundToOneDecimal(progress * 100)}%`,
							}}
						/>
					</button>
				</Tooltip>
			);
		})}
	</span>
);
