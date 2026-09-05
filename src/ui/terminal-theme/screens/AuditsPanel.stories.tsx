import type { Meta, StoryObj } from "@storybook/react";

import { Panel } from "../Panel.ui";
import { AuditsPanel, type DexAuditClass } from "./AuditsPanel.ui";

/** One plausible day's draw below gate 9 (ADR-056): 402 is fixed at gate 3, then
 * gates 4 to 7 draw one each from pool A and gate 8 draws two from pool B. An
 * account standing at gate 8 has faced seven, which is why the tab reads 7/15. */
export const dexAudits: readonly DexAuditClass[] = [
	{
		code: "4xx",
		label: "client",
		audits: [
			{
				code: 402,
				name: "Payment Required",
				rule: "every paid action costs ×2",
				faced: 7,
				beaten: 5,
			},
			{
				code: 404,
				name: "Not Found",
				rule: "no poll says which category it is",
				faced: 4,
				beaten: 2,
			},
			{
				code: 405,
				name: "Method Not Allowed",
				rule: "the shop before this gate is read-only",
				faced: 3,
				beaten: 1,
			},
			{
				code: 408,
				name: "Request Timeout",
				rule: "the window's first polls run on a clock",
				faced: 1,
				beaten: 0,
			},
			{
				code: 424,
				name: "Failed Dependency",
				rule: "one config is offline all attempt",
				faced: 5,
				beaten: 3,
			},
		],
		unseen: 6,
	},
	{
		code: "5xx",
		label: "server",
		audits: [
			{
				code: 502,
				name: "Bad Gateway",
				rule: "one config flakes out on every poll",
				faced: 1,
				beaten: 0,
			},
		],
		unseen: 2,
		note: "the rest of the server faults wait at gate 9",
	},
	{
		code: "3xx",
		label: "redirect",
		audits: [
			{
				code: 300,
				name: "Multiple Choices",
				rule: "every poll asks for the wrong options instead",
				faced: 2,
				beaten: 0,
			},
		],
		unseen: 0,
	},
];

const meta: Meta<typeof AuditsPanel> = {
	component: AuditsPanel,
	title: "Terminal/Screens/Dex/Audits",
	// Storybook reads every named export as a story, so the data other story
	// files import has to be named here or it renders as a story with no args.
	excludeStories: ["dexAudits"],
	parameters: { layout: "fullscreen" },
	decorators: [
		(Story) => (
			<div className="min-h-screen bg-zinc-900 p-6">
				<Panel>
					<Story />
				</Panel>
			</div>
		),
	],
};
export default meta;
type Story = StoryObj<typeof AuditsPanel>;

export const StandingAtGateEight: Story = { args: { classes: dexAudits } };

/** Nothing faced yet: three classes of pure shape, and the notes carry the only
 * information on the page. */
export const FirstRun: Story = {
	args: {
		classes: [
			{
				code: "4xx",
				label: "client",
				audits: [],
				unseen: 11,
				note: "client faults start at gate 3",
			},
			{
				code: "5xx",
				label: "server",
				audits: [],
				unseen: 3,
				note: "server faults start at gate 8",
			},
			{
				code: "3xx",
				label: "redirect",
				audits: [],
				unseen: 1,
				note: "the mirror waits at gate 7",
			},
		],
	},
};

export const Mobile: Story = {
	...StandingAtGateEight,
	decorators: [
		(Story) => (
			<div className="mx-auto w-full max-w-[390px] bg-zinc-900 p-3">
				<Panel>
					<Story />
				</Panel>
			</div>
		),
	],
};
