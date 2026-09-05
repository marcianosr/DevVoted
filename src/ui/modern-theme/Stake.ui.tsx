import { Chip } from "./Chip.ui";
import { Delta } from "./Delta.ui";
import { Dot } from "./Dot.ui";
import { Entry } from "./Entry.ui";
import { Row } from "./Row.ui";
import { Text } from "./Text.ui";
import { plural } from "./format";

// Flat, not a Fold: what a gate takes is the one thing on these screens a player
// must not be able to put away, and a caret invites exactly that.
const STAKE = "border-b border-edge last:border-b-0";
const LIST = "flex flex-col gap-1";

const BULLET = <Dot tone="muted" />;

export type StakeProps = {
	/** Configs a missed gate peels off the build (ADR-037). */
	removeOnMiss: number;
	/** Signed, so the row reads like its opposite number under Rewards. */
	coveragePerWrong: number;
	/** The peel takes the whole build, so the miss is the run. */
	missIsFatal?: boolean;
};

/**
 * What this gate takes, laid out as the mirror of the Rewards fold: a per-answer
 * row above a per-gate row, in the same order, so the two lists can be read
 * against each other rather than one at a time.
 */
export const Stake = ({
	removeOnMiss,
	coveragePerWrong,
	missIsFatal = false,
}: StakeProps) => (
	<section className={STAKE}>
		<Row spacing="compact">
			<Text size="body">Stake</Text>
		</Row>
		<ul className={LIST}>
			<li>
				<Entry
					leading={BULLET}
					label="Wrong answer"
					notes={<Delta coverage={coveragePerWrong} />}
				/>
			</li>
			<li>
				<Entry
					leading={BULLET}
					label="Gate missed"
					// The figure rides on the label's line, and the warning after it —
					// pushed to the far edge, the peel read as a column heading rather
					// than as what this row costs.
					notes={
						<>
							{removeOnMiss === 0 ? (
								<Chip tone="celadon">costs nothing</Chip>
							) : (
								<Chip tone="cinnabar">
									remove {plural(removeOnMiss, "config")}
								</Chip>
							)}
							{missIsFatal ? (
								<Text size="meta" tone="cinnabar">
									your whole build — the run ends here
								</Text>
							) : null}
						</>
					}
				/>
			</li>
		</ul>
	</section>
);
