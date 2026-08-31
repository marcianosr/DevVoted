import type { Meta, StoryObj } from "@storybook/react";

import type { StatusBadgeVariant } from "~/ui/StatusBadge.ui";
import type { TextTone } from "~/ui/typography/textTone";
import { FoldCaret } from "./FoldCaret.ui";
import { StatusLine } from "./StatusLine.ui";

const meta: Meta<typeof StatusLine> = {
	component: StatusLine,
	title: "Run/StatusLine",
};
export default meta;

type Story = StoryObj<typeof StatusLine>;

type VariantExample = {
	badge: StatusBadgeVariant;
	line: string;
	lineTone?: TextTone;
	value: string;
	valueClass: string;
};

// One representative row per badge state — mirrors how each variant reads in a real
// reporter (a settled pass/fail/part, a live RUN, a dormant SKIP, an always-on PERK).
const VARIANTS: readonly VariantExample[] = [
	{
		badge: "pass",
		line: "toBe(2) — adds two numbers",
		value: "+12%",
		valueClass: "text-viridian",
	},
	{
		badge: "part",
		line: "partial credit — some answers correct",
		lineTone: "saffron",
		value: "+5%",
		valueClass: "text-saffron",
	},
	{
		badge: "fail",
		line: "expected coverage ≥ 80%",
		lineTone: "cinnabar",
		value: "0%",
		valueClass: "text-cinnabar",
	},
	{
		badge: "skip",
		line: "dormant conditional — never ran",
		lineTone: "muted",
		value: "—",
		valueClass: "text-zinc-400",
	},
	{
		badge: "run",
		line: "requirement in flight",
		value: "running",
		valueClass: "text-saffron",
	},
	{
		badge: "skip",
		line: "always-on bonus — no check to clear",
		lineTone: "muted",
		value: "+1",
		valueClass: "text-lavender",
	},
];

const value = (children: string, tone: string) => (
	<span className={`shrink-0 text-right font-bold tabular-nums ${tone}`}>
		{children}
	</span>
);

export const AllVariants: Story = {
	render: () => (
		<div className="flex flex-col font-mono">
			{VARIANTS.map((v) => (
				<StatusLine
					key={v.badge}
					badge={v.badge}
					line={v.line}
					lineTone={v.lineTone}
					lineSize="sm"
					trailing={value(v.value, v.valueClass)}
				/>
			))}
		</div>
	),
};

export const Pass: Story = {
	args: {
		badge: "pass",
		line: "toBe(2) — adds two numbers",
		lineSize: "sm",
		trailing: value("+12%", "text-viridian"),
	},
};

export const Part: Story = {
	args: {
		badge: "part",
		line: "partial credit — some answers correct",
		lineTone: "saffron",
		lineSize: "sm",
		trailing: value("+5%", "text-saffron"),
	},
};

export const Fail: Story = {
	args: {
		badge: "fail",
		line: "expected coverage ≥ 80%",
		lineTone: "cinnabar",
		lineSize: "sm",
		trailing: value("0%", "text-cinnabar"),
	},
};

export const Skip: Story = {
	args: {
		badge: "skip",
		line: "dormant conditional — never ran",
		lineTone: "muted",
		lineSize: "sm",
		trailing: value("—", "text-zinc-400"),
	},
};

export const Run: Story = {
	args: {
		badge: "run",
		line: "requirement in flight",
		lineSize: "sm",
		trailing: value("running", "text-saffron"),
	},
};

export const Perk: Story = {
	args: {
		badge: "skip",
		line: "always-on bonus — no check to clear",
		lineTone: "muted",
		lineSize: "sm",
		trailing: value("+1", "text-lavender"),
	},
};

// The leading slot — a source config chip between the badge and the line.
export const WithLeadingChip: Story = {
	args: {
		badge: "run",
		line: "requires a passing unit test",
		lineSize: "sm",
		leading: (
			<span className="rounded bg-zinc-700 px-2 py-0.5 text-xs">
				unit-tests
			</span>
		),
		trailing: value("running", "text-saffron"),
	},
};

// The collapsible reporter row — rendered as a <summary> inside a <details>.
export const CollapsibleSummary: Story = {
	render: () => (
		<details open className="group">
			<StatusLine
				as="summary"
				badge="pass"
				line="typeof null? — click to collapse"
				className="cursor-pointer list-none rounded hover:bg-surface-raised/40 [&::-webkit-details-marker]:hidden"
				trailing={<FoldCaret />}
			/>
			<p className="pl-7 pt-1 text-sm text-zinc-400">
				the expanded body lives here
			</p>
		</details>
	),
};

// The whole row becomes a keyboard-activatable button (Enter/Space) via onActivate —
// the shop/build's click-to-remove row.
export const Removable: Story = {
	args: {
		badge: "pass",
		line: "click or press Enter to remove this row",
		lineSize: "sm",
		onActivate: () => {},
		trailing: <span className="shrink-0 font-bold text-cinnabar">✕</span>,
	},
};
