import { useState } from "react";

import type { Meta, StoryObj } from "@storybook/react";

import { storagePlanFor } from "~/modules/run/run/domain/rules.model";

import { Action } from "../Action.ui";
import { planLadderAt } from "../Plan.stories";
import { Delta } from "../Delta.ui";
import { Glyph } from "../Glyph.ui";
import { Entry } from "../Entry.ui";
import { Fold, type FoldItem } from "../Fold.ui";
import { Lock } from "../Lock.ui";
import { Mark } from "../Mark.ui";
import { PriceTag, type PriceTagState } from "../PriceTag.ui";
import { Slot } from "../Slot.ui";
import { Text } from "../Text.ui";
import { ShopScreen, type ShopScreenProps } from "./ShopScreen.ui";

const meta: Meta<typeof ShopScreen> = {
	component: ShopScreen,
	title: "Modern/Screens/Shop",
	parameters: { layout: "fullscreen" },
};
export default meta;

type Story = StoryObj<typeof ShopScreen>;

const noop = () => {};

type Offer = {
	id: string;
	label: string;
	kb: number;
	owned?: boolean;
	lockable: boolean;
	gives?: number;
	multiplier?: number;
	tag?: PriceTagState;
	summary?: string;
	explainer?: string;
	defaultOpen?: boolean;
};

const OFFERS: readonly Offer[] = [
	{ id: "Stylelint", label: "Stylelint", lockable: true, kb: 32 },
	{
		id: "Deprecated",
		label: "Deprecated",
		lockable: true,
		kb: 128,
		multiplier: 3,
		summary: "Rare",
		explainer:
			"All coverage earns ×3, fading ×0.5 each gate clear. Deletes itself at ×1.",
		defaultOpen: true,
	},
	{ id: "Freemium", label: "Freemium", lockable: true, kb: 0, gives: -128 },
	{
		id: ".length",
		label: ".length",
		lockable: true,
		kb: 64,
		gives: 16,
		owned: true,
		tag: "owned",
	},
	{
		id: "WTFPL",
		label: "WTFPL",
		lockable: false,
		kb: 512,
		tag: "unaffordable",
	},
];

const installed = [
	{
		id: ".git",
		label: ".git",
		upgradable: true,
	},
	{
		id: ".vue",
		label: ".vue",
		needs: "needs 5% Vue",
		summary: (
			<>
				Common · v1 ·{" "}
				<Text size="xxs" tone="saffron">
					L2 needs 5% Vue coverage, you have 3.2%
				</Text>
			</>
		),
		explainer: "Vue polls reward ×1.25 coverage. Deinstall refunds +16 KB.",
		defaultOpen: true,
	},
	{ id: ".java", label: ".java", needs: "needs 64 KB" },
];

const slotRows = (open: readonly number[], nextGate: number): FoldItem[] => [
	...open.map((slot) => ({ id: `slot-${slot}`, content: <Slot /> })),
	{ id: "slot-next", content: <Slot gate={nextGate} /> },
];

const GATES_CLEARED = 4;
const USED_KB = 216;

const Shelf = (overrides: Partial<ShopScreenProps>) => {
	const [held, setHeld] = useState<string | null>("Freemium");
	const [tier, setTier] = useState(1);

	const offers: FoldItem[] = OFFERS.map((offer) => ({
		id: offer.id,
		content: (
			<Entry
				label={offer.label}
				defaultOpen={offer.defaultOpen}
				summary={offer.summary}
				explainer={offer.explainer}
				leading={
					offer.owned ? (
						<Mark variant="pass" />
					) : offer.lockable ? (
						<Lock
							on={offer.label}
							{...(held === offer.id
								? { state: "locked" as const }
								: { state: "unlocked" as const, cost: "16 KB" })}
							onToggle={() =>
								setHeld((current) => (current === offer.id ? null : offer.id))
							}
						/>
					) : (
						<Lock on={offer.label} state="unavailable" />
					)
				}
				notes={
					<>
						{offer.multiplier ? <Delta multiplier={offer.multiplier} /> : null}
						{offer.gives !== undefined ? <Delta kb={offer.gives} /> : null}
					</>
				}
				value={
					<PriceTag
						kb={offer.kb}
						on={offer.label}
						state={offer.tag}
						onUse={noop}
					/>
				}
			/>
		),
	}));

	const pipeline: FoldItem[] = installed.map((config) => ({
		id: config.id,
		content: (
			<Entry
				mark="pass"
				label={config.label}
				defaultOpen={config.defaultOpen}
				summary={config.summary}
				explainer={config.explainer}
				notes={
					<>
						<Delta multiplier={1.25} />
						{config.needs ? (
							<Text size="meta" tone="cinnabar">
								{config.needs}
							</Text>
						) : null}
					</>
				}
				actions={[
					...(config.upgradable
						? [
								{
									label: "Upgrade",
									on: config.label,
									emphasis: "prismatic" as const,
									onUse: noop,
								},
							]
						: []),
					{
						label: "Uninstall",
						on: config.label,
						icon: <Glyph name="uninstall" />,
						cost: "+16 KB",
						emphasis: "danger" as const,
						onUse: noop,
					},
				]}
			/>
		),
	}));

	const withSlots: FoldItem[] = [...pipeline, ...slotRows([4, 5, 6], 4)];

	return (
		<ShopScreen
			theme="lavender"
			gate={{
				title: "Lavender shop",
				nextGate: "gate 4",
				storage: { plan: "Free tier", used: 216, cap: 512 },
			}}
			offers={[
				...offers,
				{
					id: "extend",
					content: (
						<Entry
							leading={<Glyph name="extend" framed />}
							label={
								<Text size="meta" tone="muted">
									one more offer, here and every shop after · 2 left
								</Text>
							}
							value={
								<PriceTag
									kb={48}
									on="a sixth offer"
									label="extend"
									state="ready"
									onUse={noop}
								/>
							}
						/>
					),
				},
			]}
			offerCount="5 offers · 1 locked"
			storagePlans={{
				plans: planLadderAt(GATES_CLEARED, tier, USED_KB, (id) =>
					setTier(Number(id.replace("tier-", "")))
				),
				nextBillKb: storagePlanFor(tier).billKb,
			}}
			draftAction={
				<Action
					label="rebuild"
					cost="4 KB"
					icon={<Glyph name="rebuild" />}
					onUse={noop}
				/>
			}
			draftNote={
				<Text size="meta" tone="muted">
					next rebuild 8 KB · Freemium is locked and stays
				</Text>
			}
			controls={
				<Fold
					title="git tag"
					subtitle="next run"
					icon={<Glyph name="tag" />}
					defaultOpen={false}
					value={
						<Text size="meta" tone="muted">
							not tagged · 128 KB
						</Text>
					}
				>
					<div className="flex flex-wrap items-center justify-between gap-3">
						<Text as="p" size="meta" tone="muted">
							If this run dies, the next one checks out at{" "}
							<Text size="meta" tone="theme">
								gate 4
							</Text>{" "}
							instead of gate 1. One per run.
						</Text>
						<PriceTag kb={128} on="a git tag" label="buy" onUse={noop} />
					</div>
				</Fold>
			}
			pipeline={withSlots}
			slots="3 of 6 slots"
			onContinue={noop}
			{...overrides}
		/>
	);
};

export const MidRun: Story = { render: () => <Shelf /> };

/** ADR-027: a build under the coming gate's width is turned away at the door. */
export const UnderWidth: Story = {
	render: () => <Shelf exitLock="Fill 4 slots to continue" />,
};

export const Broke: Story = {
	render: () => (
		<Shelf
			gate={{
				title: "Lavender shop",
				nextGate: "gate 4",
				storage: { plan: "Free tier", used: 512, cap: 512 },
			}}
		/>
	),
};

/** ADR-038: Read-only shuts the till for the coming gate. The shelves stay
 * legible on purpose — what you cannot buy today is how the gate after this one
 * gets planned — so the band is the only thing saying the presses are dead. */
export const ShutByReadOnly: Story = {
	render: () => (
		<Shelf notice="Shop closed. Read-only audits the build you already have, so nothing can be bought, sold or switched before gate 5." />
	),
};

export const EmptyPipeline: Story = {
	render: () => (
		<Shelf pipeline={slotRows([1, 2, 3, 4, 5, 6], 4)} slots="0 of 6 slots" />
	),
};
