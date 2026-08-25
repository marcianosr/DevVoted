import type { ReactNode } from "react";

import { clsx } from "clsx";

import { Caret } from "./Caret.ui";
import { Disclosure, DISCLOSURE_SUMMARY } from "./Disclosure.ui";
import { Chip, type ChipTone } from "./Chip.ui";
import { Code } from "./Code.ui";
import { Delta } from "./Delta.ui";
import { Letter, type LetterTone } from "./Letter.ui";
import { Text } from "./Text.ui";
import type { CrumbVerdict } from "./Trail.ui";
import { optionLetter, plural } from "./format";

const HEAD = `${DISCLOSURE_SUMMARY} flex items-baseline gap-3 px-5 py-4 hover:bg-zinc-100/5`;
const ASK = "min-w-0 flex-1";

const DETAIL =
	"grid grid-cols-[7rem_1fr] items-center gap-x-3 gap-y-2 px-5 pb-4";
const FULL = "col-span-2";
const SECOND = "col-start-2";
const PICKS = "flex flex-wrap items-center gap-2";

const MORE_SUMMARY = `${DISCLOSURE_SUMMARY} inline-flex items-center gap-1.5 rounded`;
const MORE_LIST = "flex flex-col gap-2 pt-2";

const ANSWER = "inline-flex items-center gap-2";

export type AnswerShape = "plain" | "pill";

const SHAPE = {
	plain: "",
	pill: "rounded-lg border px-2 py-1",
} satisfies Record<AnswerShape, string>;

const PILL_TONE = {
	muted: "border-edge-strong",
	celadon: "border-celadon/40 bg-celadon/10",
	cinnabar: "border-cinnabar/40 bg-cinnabar/10",
} satisfies Record<LetterTone, string>;

export type AnswerProps = {
	letter: string;
	label: ReactNode;
	tone?: LetterTone;
	shape?: AnswerShape;
};

export const Answer = ({
	letter,
	label,
	tone = "muted",
	shape = "plain",
}: AnswerProps) => (
	<span
		className={clsx(ANSWER, SHAPE[shape], shape === "pill" && PILL_TONE[tone])}
	>
		<Letter letter={letter} tone={tone} />
		<Text size="body" tone={tone}>
			{label}
		</Text>
	</span>
);

const BADGE = {
	correct: { label: "PASS", tone: "celadon" },
	partial: { label: "PART", tone: "saffron" },
	wrong: { label: "FAIL", tone: "cinnabar" },
} as const satisfies Record<CrumbVerdict, { label: string; tone: ChipTone }>;

export type AnswerOption = {
	id: string;
	label: ReactNode;
	expected?: boolean;
	received?: boolean;
};

export type VerdictProps = {
	outcome: CrumbVerdict;
	question: ReactNode;
	score: number;
	options: readonly AnswerOption[];
	code?: readonly ReactNode[];
	explainer?: ReactNode;
};

const toneFor = (option: AnswerOption): LetterTone =>
	option.expected ? "celadon" : "cinnabar";

export const Verdict = ({
	outcome,
	question,
	score,
	options,
	code,
	explainer,
}: VerdictProps) => {
	const lettered = options.map((option, index) => ({
		...option,
		letter: optionLetter(index),
	}));

	const expected = lettered.filter((option) => option.expected);
	const received = lettered.filter((option) => option.received);
	const others = lettered.filter(
		(option) => !option.expected && !option.received
	);

	const multi = expected.length > 1;
	const shape = multi ? "pill" : "plain";

	const caught = received.filter((option) => option.expected).length;
	const tally = [
		{ count: caught, text: `${caught} caught`, tone: "celadon" },
		{
			count: expected.length - caught,
			text: `${expected.length - caught} missed`,
			tone: "saffron",
		},
		{
			count: received.length - caught,
			text: plural(received.length - caught, "wrong pick"),
			tone: "cinnabar",
		},
	] as const;
	const scored = tally.filter((part) => part.count > 0);

	const badge = BADGE[outcome];
	const settled = outcome === "correct";

	return (
		// Every poll opens, including the ones you passed: the explanation is the
		// reason to come here, and a right answer for the wrong reason still wants
		// reading. Only the default differs — a miss is what you came back for.
		<Disclosure scope="row" defaultOpen={!settled}>
			<summary className={HEAD}>
				<Caret scope="row" />
				<Chip tone={badge.tone}>{badge.label}</Chip>
				<Text size="body" tone={settled ? "muted" : "default"} className={ASK}>
					{question}
				</Text>
				{multi ? (
					<Text size="meta" tone="muted">
						multi
					</Text>
				) : null}
				<Delta coverage={score} />
			</summary>

			<div className={DETAIL}>
				{code?.length ? (
					<div className={FULL}>
						<Code lines={code} />
					</div>
				) : null}

				<Text size="meta" tone="muted">
					Expected
				</Text>
				<span className={PICKS}>
					{expected.map((option) => (
						<Answer
							key={option.id}
							letter={option.letter}
							label={option.label}
							tone="celadon"
							shape={shape}
						/>
					))}
				</span>

				<Text size="meta" tone="muted">
					Received
				</Text>
				<span className={PICKS}>
					{received.length ? (
						received.map((option) => (
							<Answer
								key={option.id}
								letter={option.letter}
								label={option.label}
								tone={toneFor(option)}
								shape={shape}
							/>
						))
					) : (
						<Text size="body" tone="muted">
							— nothing picked
						</Text>
					)}
				</span>

				{scored.length || others.length ? (
					<div className={clsx(SECOND, PICKS)}>
						{multi
							? scored.map((part) => (
									<Text key={part.text} size="meta" tone={part.tone}>
										{part.text}
									</Text>
								))
							: null}
						{others.length ? (
							<Disclosure>
								<summary className={MORE_SUMMARY}>
									<Caret />
									<Text size="meta" tone="muted">
										{plural(others.length, "other option")}
									</Text>
								</summary>
								<ul className={MORE_LIST}>
									{others.map((option) => (
										<li key={option.id}>
											<Answer
												letter={option.letter}
												label={option.label}
												shape={shape}
											/>
										</li>
									))}
								</ul>
							</Disclosure>
						) : null}
					</div>
				) : null}

				{explainer ? (
					<Text as="p" size="meta" className={FULL}>
						{explainer}
					</Text>
				) : null}
			</div>
		</Disclosure>
	);
};
