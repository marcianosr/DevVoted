import type { ReactNode } from "react";

import type { SwatchTheme } from "~/modules/run/gate/domain/swatch.model";

import { clsx } from "clsx";

import { Screen } from "../Screen.ui";
import { Action } from "../Action.ui";
import { Choice, type ChoiceProps } from "../Choice.ui";
import { Byline, type BylineProps } from "../Byline.ui";
import { Code } from "../Code.ui";
import { GateHeader, type GateHeaderProps } from "../GateHeader.ui";
import { Glyph } from "../Glyph.ui";
import { optionLetter } from "../format";
import { Question, type QuestionCategory } from "../Question.ui";
import { Text } from "../Text.ui";
import { Tooltip } from "../Tooltip.ui";
import { Trail, type TrailItem } from "../Trail.ui";

const BODY = "flex flex-col lg:flex-row lg:items-stretch";
const MAIN = "flex min-w-0 flex-1 flex-col gap-6 px-5 py-6 lg:px-8";
const RAIL =
	"flex flex-col gap-1 border-t border-edge px-2 py-4 lg:order-first lg:shrink-0 lg:border-t-0 lg:border-r";
const RAIL_WIDTH = { open: "lg:w-80", folded: "lg:w-auto" };

const TOGGLE_ROW = "flex justify-end lg:-mr-6";
const TOGGLE =
	"inline-flex size-8 cursor-pointer items-center justify-center rounded-full border border-control-edge bg-surface-raised text-zinc-400 transition-colors hover:border-theme hover:bg-theme-soft hover:text-theme focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cerulean";

const foldLabel = (railOpen: boolean) =>
	railOpen ? "Fold run info" : "Unfold run info";

const OPTIONS = "flex flex-col gap-2";

const FOOTER =
	"flex flex-wrap items-center justify-end gap-4 border-t border-edge px-5 py-4";

export type PollOption = Omit<ChoiceProps, "letter"> & { id: string };

export type PollScreenProps = {
	gate: GateHeaderProps;
	trail: readonly TrailItem[];
	trailLabel: string;
	question: ReactNode;
	category?: QuestionCategory;
	meta?: readonly string[];
	byline?: BylineProps;
	code?: readonly ReactNode[];
	options: readonly PollOption[];
	reveal?: ReactNode;
	rail?: ReactNode;
	onToggleRail?: () => void;
	railOpen?: boolean;
	onSubmit?: () => void;
	submitLabel?: string;
	submitLock?: string;
	submitNote?: string;
	theme?: SwatchTheme;
};

export const PollScreen = ({
	gate,
	trail,
	trailLabel,
	question,
	category,
	meta,
	byline,
	code,
	options,
	reveal,
	rail,
	onToggleRail,
	railOpen = true,
	onSubmit,
	submitLabel = "Submit answer →",
	submitLock,
	submitNote,
	theme,
}: PollScreenProps) => {
	const railFolded = Boolean(onToggleRail) && !railOpen;

	return (
		<Screen theme={theme}>
			<GateHeader {...gate} />

			<div className={BODY}>
				<div className={MAIN}>
					<Trail items={trail} label={trailLabel} />

					<Question category={category} meta={meta}>
						{question}
					</Question>

					{code?.length ? <Code lines={code} /> : null}

					<ul className={OPTIONS}>
						{options.map(({ id, ...option }, index) => (
							<li key={id}>
								<Choice {...option} letter={optionLetter(index)} />
							</li>
						))}
					</ul>

					{reveal}

					{byline ? <Byline {...byline} /> : null}
				</div>

				{rail ? (
					<aside
						className={clsx(RAIL, RAIL_WIDTH[railFolded ? "folded" : "open"])}
					>
						{onToggleRail ? (
							<div className={TOGGLE_ROW}>
								<Tooltip hint={foldLabel(railOpen)}>
									<button
										type="button"
										className={TOGGLE}
										aria-expanded={railOpen}
										aria-label={foldLabel(railOpen)}
										onClick={onToggleRail}
									>
										<Glyph name="fold" />
									</button>
								</Tooltip>
							</div>
						) : null}
						{railFolded ? null : rail}
					</aside>
				) : null}
			</div>

			{onSubmit ? (
				<div className={FOOTER}>
					{submitNote ? (
						<Text size="meta" tone="muted">
							{submitNote}
						</Text>
					) : null}
					<Action
						label={submitLock ?? submitLabel}
						size="lg"
						emphasis="loud"
						disabled={submitLock !== undefined}
						onUse={onSubmit}
					/>
				</div>
			) : null}
		</Screen>
	);
};
