import type { Meta, StoryObj } from "@storybook/react";

import { ReviewScreen } from "./ReviewScreen.ui";

const noop = () => {};

const meta: Meta<typeof ReviewScreen> = {
	component: ReviewScreen,
	title: "Terminal/Screens/Review",
	parameters: { layout: "fullscreen" },
	decorators: [
		(Story) => (
			<div className="min-h-screen bg-zinc-900 p-6">
				<Story />
			</div>
		),
	],
};
export default meta;
type Story = StoryObj<typeof ReviewScreen>;

export const AfterLavender: Story = {
	args: {
		title: "Review · Lavender",
		meta: "2 passed · 3 failed · 5 polls",
		failed: {
			meta: "3",
			rows: [
				{
					id: "lav-poll-2",
					category: "TypeScript",
					question: "Which type means 'any value except null/undefined'?",
					pollLabel: "poll 2",
					expected: "NonNullable<T>",
					picked: "Partial<T>",
					cost: "−3.8% · streak lost",
				},
				{
					id: "lav-poll-4",
					category: "CSS",
					question: "Which property creates a stacking context?",
					pollLabel: "poll 4",
					expected: "isolation: isolate",
					picked: "overflow: hidden",
				},
				{
					id: "lav-poll-5",
					category: "CSS",
					question: "What does contain: layout do?",
					pollLabel: "poll 5",
				},
			],
		},
		passed: {
			meta: "2",
			rows: [
				{
					id: "lav-poll-1",
					category: "JavaScript",
					question: "Which method returns the last element of an array?",
					gain: "+3.1%",
				},
				{
					id: "lav-poll-3",
					category: "Git",
					question: "Which undoes a commit but keeps changes staged?",
					gain: "+2.4%",
				},
			],
		},
		backLabel: "Back →",
		onBack: noop,
	},
};

export const Mobile: Story = {
	...AfterLavender,
	decorators: [
		(Story) => (
			<div className="mx-auto w-full max-w-[390px]">
				<Story />
			</div>
		),
	],
};

export const AfterElite: Story = {
	args: {
		title: "Review · Elite",
		meta: "3 passed · 2 failed · 5 polls",
		failed: {
			meta: "2",
			rows: [
				{
					id: "elite-poll-3",
					category: "TypeScript",
					question:
						"Which utility type builds an object type from unions of keys and values?",
					pollLabel: "poll 3",
					expected: "Record<K, V>",
					picked: "Map<K, V>",
					cost: "−5.2% · streak lost",
				},
				{
					id: "elite-poll-5",
					category: "Java",
					question:
						"Which collection keeps insertion order and rejects duplicates?",
					pollLabel: "poll 5",
					expected: "LinkedHashSet",
					picked: "TreeSet",
					cost: "−4.8% · 507 Insufficient Storage −64 KB",
				},
			],
		},
		passed: {
			meta: "3",
			rows: [
				{
					id: "elite-poll-1",
					category: "CSS",
					question: "Which property creates a new stacking context on its own?",
					gain: "+8.7%",
				},
				{
					id: "elite-poll-2",
					category: "JavaScript",
					question:
						"What does Array.prototype.at(−1) return on an empty array?",
					gain: "+6.1%",
				},
				{
					id: "elite-poll-4",
					category: "Git",
					question:
						"Which command rewrites the last commit without changing its message?",
					gain: "+5.4%",
				},
			],
		},
		backLabel: "Back →",
		onBack: noop,
	},
};

export const AfterEliteMobile: Story = {
	...AfterElite,
	decorators: [
		(Story) => (
			<div className="mx-auto w-full max-w-[390px]">
				<Story />
			</div>
		),
	],
};
