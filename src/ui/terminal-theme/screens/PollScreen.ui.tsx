import type { SwatchTheme } from "~/modules/run/gate/domain/swatch.model";

import { Audits, type AuditNote } from "../Audits.ui";
import { Badge } from "../Badge.ui";
import { BuildList, type BuildListRow } from "../BuildList.ui";
import { Button } from "../Button.ui";
import { Choice } from "../Choice.ui";
import { Legend } from "../Legend.ui";
import { Panel } from "../Panel.ui";
import { RunHeader, type RunHeaderProps } from "../RunHeader.ui";
import { Section } from "../Section.ui";
import { Text } from "../Text.ui";
import { Trail, type TrailProps } from "../Trail.ui";

const COLUMNS =
	"grid grid-cols-[1fr_15rem] items-start gap-6 @max-md:grid-cols-1 @max-md:gap-4";
const QUESTION_COLUMN = "flex flex-col gap-3 py-1";
const SIDEBAR =
	"@container border-l border-edge pl-4 @max-md:border-l-0 @max-md:border-t @max-md:pt-3 @max-md:pl-0";

export type PollScreenProps = {
	run: RunHeaderProps;
	theme?: SwatchTheme;
	build: {
		meta: string;
		rows: readonly BuildListRow[];
		total: { label: string; value: string };
	};
	audits?: readonly AuditNote[];
	trail: TrailProps;
	category: string;
	question: string;
	choices: readonly { letter: string; label: string }[];
	onPick?: (letter: string) => void;
	pickLabel: string;
};

export const PollScreen = ({
	run,
	theme,
	build,
	audits = [],
	trail,
	category,
	question,
	choices,
	onPick,
	pickLabel,
}: PollScreenProps) => (
	<Panel theme={theme}>
		<RunHeader {...run} />

		<div className={COLUMNS}>
			<div className={QUESTION_COLUMN}>
				<Trail {...trail} />

				<Audits rows={audits} />

				<Badge tone="celadon" className="self-start">
					{category}
				</Badge>

				<Text as="p" size="score" className="leading-snug font-bold">
					{question}
				</Text>

				<div className="flex flex-col gap-2">
					{choices.map((choice) => (
						<Choice
							key={choice.letter}
							letter={choice.letter}
							label={choice.label}
							onPick={
								onPick === undefined ? undefined : () => onPick(choice.letter)
							}
						/>
					))}
				</div>

				<Button label={pickLabel} disabled className="w-full" />
			</div>

			<div className={SIDEBAR}>
				<Section label="Build" meta={build.meta}>
					<Legend
						variants={build.rows.map((row) => row.dot)}
						className="pb-2"
					/>
					<BuildList rows={build.rows} total={build.total} />
				</Section>
			</div>
		</div>
	</Panel>
);
