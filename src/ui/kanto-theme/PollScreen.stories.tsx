import { useState } from "react";

import type { Meta, StoryObj } from "@storybook/react";

import { auditAt } from "~/modules/run/gate/domain/audit.model";
import {
	INSTALLED_CARDS_OPEN,
	disclosedIn,
	toggleDisclosure,
} from "~/shared/lib/disclosure";

import {
	BALANCE_WORD,
	fundsOf,
	createKantoBuildFooterProps,
	createKantoBuildProps,
	createKantoCoverageBarProps,
	createKantoHeaderProps,
	createKantoPollScreenProps,
	createKantoQuestionProps,
	kantoPollOptions,
	kantoAudits,
	kantoCoverageUnitsOf,
	kantoRunningConfigs,
} from "~/test/kantoPoll.factory";
import { gateRoster, gateSwatchAt, trackTo } from "~/test/swatchTrack.factory";

import type { AuditProps } from "./Audit.ui";
import type { ChoiceVerdict } from "./Choice.ui";
import type { FigureTone, LedgerRow } from "./LedgerRows.ui";
import type { PollScoresProps } from "./PollScores.ui";
import { PollScreen } from "./PollScreen.ui";
import { REDACTED } from "./Redaction.ui";
import type { QuestionOption } from "./Question.ui";

const LOCK_IN = "Lock in";
const NEXT_LABEL = "Next poll";
const ANSWERED_HELD = 62;
const QUIET: FigureTone = "quiet";
const GAIN = "viridian" as const;

const noop = () => {};

const LATE_GATE = 11;
const FIRST_GATE = 1;
const LEGAL_HOLD_GATE = 9;

const CODE = `
const settings = Object.freeze({
	theme: "kanto",
	retries: 3,
});

settings.retries = 5;`;

const HOLD = auditAt("legal-hold", LEGAL_HOLD_GATE);

const THREE_AUDITS = [
	...kantoAudits,
	{
		code: HOLD.code,
		name: HOLD.name,
		cue: "two answers are sealed · buy one back for 4 KB",
	},
] satisfies AuditProps[];

const LONG_ANSWERS = [
	{
		id: "option-1",
		letter: "A",
		label:
			"It freezes the object so later writes throw in strict mode, but nested objects stay mutable unless you walk them yourself",
	},
	{
		id: "option-2",
		letter: "B",
		label:
			"It copies every own enumerable property onto a fresh object, so the original is untouched and prototypes are not carried across",
	},
	{
		id: "option-3",
		letter: "C",
		label:
			"It does nothing at runtime; the check is erased when the code compiles",
	},
] satisfies QuestionOption[];

const SHORT_ANSWERS = [
	{ id: "option-1", letter: "A", label: "map" },
	{ id: "option-2", letter: "B", label: "flatMap" },
	{ id: "option-3", letter: "C", label: "reduce" },
	{ id: "option-4", letter: "D", label: "filter" },
] satisfies QuestionOption[];

const MULTIPLE_ANSWERS = [
	{ id: "option-1", letter: "A", label: "Partial" },
	{ id: "option-2", letter: "B", label: "Pick" },
	{ id: "option-3", letter: "C", label: "Banjo" },
] satisfies QuestionOption[];

const SEALED_ANSWERS = [
	{ id: "option-1", letter: "A", label: "Partial<T>" },
	{ id: "option-2", letter: "B", seal: { price: "4 KB" } },
	{ id: "option-3", letter: "C", seal: { price: "4 KB" } },
] satisfies QuestionOption[];

const meta: Meta<typeof PollScreen> = {
	component: PollScreen,
	title: "Kanto/Screens/PollScreen",
	argTypes: {
		width: { control: "inline-radio", options: ["narrow", "default"] },
	},
	args: createKantoPollScreenProps(),
	render: (args) => <PollScreen {...args} />,
};
export default meta;

type Story = StoryObj<typeof PollScreen>;

export const Default: Story = {};

export const SkippedUnfolded: Story = {
	args: {
		buildFooter: createKantoBuildFooterProps({
			build: createKantoBuildProps({ skippedOpen: true }),
			open: true,
		}),
	},
};

export const BuildFolded: Story = {
	args: { buildFooter: createKantoBuildFooterProps({ open: false }) },
};

export const NoAudits: Story = { args: { audits: [] } };

export const OneAudit: Story = { args: { audits: [kantoAudits[0]] } };

export const ThreeAudits: Story = { args: { audits: THREE_AUDITS } };

export const AnswerPicked: Story = {
	args: {
		question: createKantoQuestionProps({ pickedIds: ["option-1"] }),
	},
};

export const ShortAnswers: Story = {
	args: {
		question: createKantoQuestionProps({
			question: "Which array method flattens one level as it maps?",
			options: SHORT_ANSWERS,
		}),
	},
};

export const LongAnswers: Story = {
	args: {
		question: createKantoQuestionProps({
			question: "What does Object.freeze actually guarantee?",
			options: LONG_ANSWERS,
			pickedIds: ["option-2"],
		}),
	},
};

export const WithCode: Story = {
	args: {
		question: createKantoQuestionProps({
			question: "What happens on the last line?",
			codeBlock: CODE,
			options: SHORT_ANSWERS,
		}),
	},
};

export const SealedAnswers: Story = {
	args: {
		audits: THREE_AUDITS,
		question: createKantoQuestionProps({ options: SEALED_ANSWERS }),
		hint: "unseal an answer for 4 KB · press A, B or C to answer",
	},
};

export const FirstGate: Story = {
	args: {
		header: createKantoHeaderProps({
			swatch: gateSwatchAt(FIRST_GATE),
			swatches: trackTo(FIRST_GATE),
			funds: fundsOf(96, BALANCE_WORD),
		}),
		buildFooter: createKantoBuildFooterProps({
			build: createKantoBuildProps({
				configs: kantoRunningConfigs.slice(0, 2),
				skipped: [],
				skippedNote: undefined,
			}),
			counts: { ready: 0, applies: 2, offline: 0, changing: 0 },
		}),
		audits: [],
		wrongCost: undefined,
	},
};

export const LateRun: Story = {
	args: {
		header: createKantoHeaderProps({
			swatch: gateSwatchAt(LATE_GATE),
			swatches: trackTo(LATE_GATE),
			funds: fundsOf(12_408, BALANCE_WORD),
		}),
		wrongCost: "2.40",
	},
};

/** What a new player sees most: a poll nobody has measured and they have never met. */
export const FreshPoll: Story = {
	args: {
		facts: {
			difficulty: {
				badge: "untested",
				tone: "pewter",
				text: "too few first tries to say",
			},
		},
	},
};

/** A config or an audit withheld the band; the option count falls back to the header. */
export const FactsWithheld: Story = { args: { facts: undefined } };

export const NoHint: Story = { args: { hint: undefined } };

export const MultipleAnswers: Story = {
	args: {
		question: createKantoQuestionProps({
			question: "Which of these are TypeScript utility types?",
			answerType: "multiple",
			options: MULTIPLE_ANSWERS,
			pickedIds: ["option-1", "option-2"],
		}),
		wrongCost: undefined,
		footer: undefined,
		commit: {
			label: `${LOCK_IN} 2 answers`,
			note: "2 picked",
			onPress: noop,
		},
	},
};

export const NothingPicked: Story = {
	args: {
		question: createKantoQuestionProps({
			question: "Which of these are TypeScript utility types?",
			answerType: "multiple",
			options: MULTIPLE_ANSWERS,
			pickedIds: [],
		}),
		wrongCost: undefined,
		footer: undefined,
		commit: { label: LOCK_IN, note: "pick every answer that fits" },
	},
};

const ANSWER_RECEIPT = [
	{
		label: "right answer",
		detail: "base",
		figures: [{ label: "1.00", tone: QUIET }],
	},
	{
		label: ".ts",
		tags: [{ label: "×1.25" }],
		detail: "matches TypeScript",
		figures: [{ label: "+0.25", tone: QUIET }],
	},
	{
		label: "Code Coverage",
		figures: [{ label: "+0.10", tone: QUIET }],
	},
	{
		label: "paid",
		figures: [{ label: "1.35", color: GAIN }],
		total: true,
	},
] as const satisfies readonly LedgerRow[];

/** The answer that just landed, on the chip that paid it. */
const answeredPaidFor = (): PollScoresProps => {
	const { paid } = createKantoPollScreenProps().coverage;
	const [row] = paid?.rows ?? [];

	return {
		rows: [
			{
				...row,
				payouts: {
					total: "4.85",
					slots:
						row.payouts?.slots.map((slot, position) =>
							position === 3
								? {
										figure: "1.35",
										color: GAIN,
										receipt: ANSWER_RECEIPT,
									}
								: slot
						) ?? [],
				},
			},
		],
	};
};

const ANSWERED_VERDICTS: Record<string, ChoiceVerdict> = {
	"option-1": "right",
	"option-2": "wrong",
	"option-3": "missed",
};

export const Answered: Story = {
	args: {
		coverage: {
			...createKantoPollScreenProps().coverage,
			bar: createKantoCoverageBarProps({
				held: ANSWERED_HELD,
				pin: true,
				units: kantoCoverageUnitsOf(ANSWERED_HELD),
			}),
			paid: answeredPaidFor(),
		},
		question: createKantoQuestionProps({
			answerType: "multiple",
			pickedIds: ["option-1", "option-2"],
			options: kantoPollOptions.map((option) => ({
				...option,
				verdict: ANSWERED_VERDICTS[option.id],
			})),
		}),
		wrongCost: undefined,
		hint: "Partial<T> and Maybe<T> were the key; Optional<T> is not a built-in.",
		footer: {
			action: { label: NEXT_LABEL, icon: "gate", onPress: noop },
			note: "Or click ENTER",
		},
	},
};

export const AnsweredWithTheBuildFlashing: Story = {
	args: {
		...Answered.args,
		buildFooter: {
			...createKantoBuildFooterProps({ open: true }),
			flash: "answer-1",
			build: {
				...createKantoBuildProps(),
				configs: createKantoBuildProps().configs.map((config, index) =>
					index < 2 ? { ...config, credited: true } : config
				),
			},
		},
	},
};

export const HiddenCategory: Story = {
	args: { category: REDACTED, categoryColor: "pewter" },
};

export const Credited: Story = {
	args: {
		author: {
			handle: "marcianoschildmeijer",
			title: "Poll Author",
			photoUrl: "/editors/misty.png",
		},
	},
};

export const EveryGate: Story = {
	parameters: { controls: { disable: true } },
	render: () => (
		<div className="flex flex-col gap-6 [--screen-floor:32rem]">
			{gateRoster.map((swatch) => (
				<PollScreen
					key={swatch.id}
					{...createKantoPollScreenProps({
						header: createKantoHeaderProps({
							swatch,
							swatches: trackTo(swatch.gate),
						}),
					})}
				/>
			))}
		</div>
	),
};

const ScreenWithPanels = () => {
	const [flipped, setFlipped] = useState<ReadonlySet<string>>(new Set());
	const props = createKantoPollScreenProps();
	const names = props.buildFooter.build.configs.map(
		(config) => config.name ?? ""
	);

	return (
		<PollScreen
			{...props}
			buildFooter={{
				...props.buildFooter,
				open: true,
				build: {
					...props.buildFooter.build,
					openInfo: disclosedIn(names, flipped, INSTALLED_CARDS_OPEN),
					onToggleInfo: (name) => setFlipped(toggleDisclosure(flipped, name)),
				},
			}}
		/>
	);
};

export const ConfigPanels: Story = {
	parameters: { controls: { disable: true } },
	render: () => <ScreenWithPanels />,
};
