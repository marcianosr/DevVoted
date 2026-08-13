import { clsx } from "clsx";

/**
 * The filled track every bar in the app is made of: a rounded, clipped rail
 * whose segments fill left to right toward a cap.
 *
 * It owns the percentage as well as the markup, because the three bars that
 * predate it each declared their own `percentOf` and one of them quietly
 * disagreed: it never clamped, so a value over its cap overflowed the rail.
 * Segments carry their own fill class rather than a tone enum — the colour is
 * the caller's meaning (viridian for a gain, saffron for a banked share), not
 * the track's.
 */
export type MeterSegment = {
	/** How much of `cap` this segment fills. */
	readonly value: number;
	/** The fill's own classes, e.g. `bg-viridian`. */
	readonly className: string;
};

type MeterProps = {
	segments: readonly MeterSegment[];
	cap: number;
	/** Spoken name. Given one, the track reports itself as a progressbar. */
	label?: string;
	/** aria-valuenow, when the reported value is not the segments' sum. */
	value?: number;
	/** Height and radius. Defaults to the slim rounded rail. */
	trackClassName?: string;
};

/** A value's share of a cap, clamped to the track's 0-100. */
export const percentOfCap = (value: number, cap: number): number =>
	cap <= 0 ? 0 : Math.max(0, Math.min(100, (value / cap) * 100));

export const Meter = ({
	segments,
	cap,
	label,
	value,
	trackClassName = "h-1.5 rounded-full",
}: MeterProps) => {
	const filled =
		value ?? segments.reduce((sum, segment) => sum + segment.value, 0);

	return (
		<span
			role={label ? "progressbar" : undefined}
			aria-label={label}
			aria-valuenow={label ? filled : undefined}
			aria-valuemin={label ? 0 : undefined}
			aria-valuemax={label ? cap : undefined}
			className={clsx(
				"flex w-full overflow-hidden bg-surface-raised",
				trackClassName
			)}
		>
			{segments.map((segment, index) => (
				<span
					key={index}
					className={clsx("block h-full", segment.className)}
					style={{ width: `${percentOfCap(segment.value, cap)}%` }}
				/>
			))}
		</span>
	);
};
