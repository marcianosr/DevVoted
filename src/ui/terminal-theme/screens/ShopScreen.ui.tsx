import { clsx } from "clsx";

import type { ConfigFamily } from "~/modules/run/config/domain/config.model";
import type { SwatchTheme } from "~/modules/run/gate/domain/swatch.model";

import { Button } from "../Button.ui";
import { BuyLine, type BuyLineProps } from "../BuyLine.ui";
import { Change, type ChangeStep } from "../Change.ui";
import { GitTagIcon } from "../GitTagIcon.ui";
import { Header, type HeaderProps } from "../Header.ui";
import { IconButton } from "../IconButton.ui";
import { Panel } from "../Panel.ui";
import { PriceTag } from "../PriceTag.ui";
import { Row } from "../Row.ui";
import { Section } from "../Section.ui";
import { SlotTrack, type SlotSegment } from "../SlotTrack.ui";
import { Slots } from "../Slots.ui";
import { Text } from "../Text.ui";
import { Version } from "../Version.ui";

const FOOTER =
	"flex flex-wrap items-center justify-end gap-3 border-t border-edge pt-4";

const COLUMNS =
	"grid grid-cols-2 items-start gap-x-6 @max-md:grid-cols-1 @max-md:gap-y-2";
const ARMED_ROW = "-mx-2 rounded-lg bg-zinc-100/5 px-2";
const UPGRADE_ICON = "↑";
const REMOVE_ICON = "✕";
const MAXED_LABEL = "maxed";
const MAXED = "shrink-0 whitespace-nowrap";
const CONFIRM_ICON = "✓";
const CANCEL_ICON = "✕";
const BUY_ICON = "⤓";
const FREE_RATE = "free";

const EXTEND_ROW =
	"flex flex-wrap items-center gap-3 rounded-lg border border-dashed border-edge-strong px-3 py-2";
const EXTEND_MARK =
	"flex size-5 shrink-0 items-center justify-center rounded-full border border-dashed border-edge-strong text-zinc-500";
const EXTEND_ICON = "+";

const PLAN_ROW =
	"flex w-full items-center gap-3 rounded-lg border px-3 py-1.5 text-left";
const RADIO =
	"flex size-4 shrink-0 items-center justify-center rounded-full border";

const segmentsOf = (
	rows: readonly { family: ConfigFamily; slots: number }[]
): readonly SlotSegment[] =>
	rows.map((row) => ({ family: row.family, slots: row.slots }));

export type ArmedAction = {
	action: "upgrade" | "remove";
	confirmLabel: string;
	cancelLabel: string;
	note?: string;
	onConfirm?: () => void;
	onCancel?: () => void;
};

export type ShopBuildRow = {
	family: ConfigFamily;
	name: string;
	detail: string;
	slots: number;
	version?: string;
	maxed?: boolean;
	upgrade?: {
		version?: string;
		changes: readonly ChangeStep[];
		price: string;
		label: string;
		onArm?: () => void;
	};
	remove: {
		label: string;
		value?: string;
		onArm?: () => void;
	};
	armed?: ArmedAction;
};

export type ExtendOffer = {
	note: string;
	label: string;
	price: string;
	onExtend?: () => void;
};

export type ShopOfferRow = {
	family: ConfigFamily;
	name: string;
	detail: string;
	slots: number;
	price?: string;
	buyLabel: string;
	onBuy?: () => void;
	locked?: boolean;
};

const versionTag = (row: ShopBuildRow) => {
	if (row.version === undefined) return null;
	if (row.armed?.action !== "upgrade" || row.upgrade?.version === undefined) {
		return <Version label={row.version} />;
	}
	return <Change from={row.version} to={row.upgrade.version} />;
};

// Version and size sit with the name rather than out on the right rail: both
// answer "what is this", while the rail is where you act on it.
const buildTag = (row: ShopBuildRow) => (
	<>
		{versionTag(row)}
		<Slots family={row.family} slots={row.slots} />
	</>
);

const priceHint = (label: string, price: string) => `${label} for ${price}`;

const armedPrice = (row: ShopBuildRow, armed: ArmedAction) => {
	if (armed.action === "upgrade") {
		return row.upgrade === undefined ? null : (
			<PriceTag label={row.upgrade.price} />
		);
	}
	if (row.remove.value === undefined) return null;
	return <PriceTag label={row.remove.value} variant="receive" />;
};

const ArmedTrailing = ({
	row,
	armed,
}: {
	row: ShopBuildRow;
	armed: ArmedAction;
}) => (
	<>
		{armed.action === "remove" || row.upgrade === undefined
			? null
			: row.upgrade.changes.map((change) => (
					<Change
						key={`${change.from}${change.to}`}
						from={change.from}
						to={change.to}
						projected
					/>
				))}
		{armedPrice(row, armed)}
		<IconButton
			icon={CONFIRM_ICON}
			label={armed.confirmLabel}
			armed
			onUse={armed.onConfirm}
		/>
		<IconButton
			icon={CANCEL_ICON}
			label={armed.cancelLabel}
			tone="cinnabar"
			onUse={armed.onCancel}
		/>
	</>
);

const UpgradeSlot = ({ row }: { row: ShopBuildRow }) => {
	if (row.maxed === true) {
		return (
			<Text tone="faint" size="caption" className={MAXED}>
				{MAXED_LABEL}
			</Text>
		);
	}
	if (row.upgrade === undefined) return null;

	return (
		<IconButton
			icon={UPGRADE_ICON}
			label={row.upgrade.label}
			hint={priceHint(row.upgrade.label, row.upgrade.price)}
			tone="legendary"
			onUse={row.upgrade.onArm}
		/>
	);
};

const BuildTrailing = ({ row }: { row: ShopBuildRow }) => {
	if (row.armed !== undefined) {
		return <ArmedTrailing row={row} armed={row.armed} />;
	}

	return (
		<>
			<UpgradeSlot row={row} />
			<IconButton
				icon={REMOVE_ICON}
				label={row.remove.label}
				hint={
					row.remove.value === undefined
						? undefined
						: priceHint(row.remove.label, row.remove.value)
				}
				tone="cinnabar"
				onUse={row.remove.onArm}
			/>
		</>
	);
};

const BuildRow = ({ row }: { row: ShopBuildRow }) => (
	<Row
		className={clsx(row.armed !== undefined && ARMED_ROW)}
		name={row.name}
		tag={buildTag(row)}
		detail={row.armed?.note ?? row.detail}
		trailing={<BuildTrailing row={row} />}
	/>
);

export type PlanTier = {
	cap: string;
	rate: string;
	current?: boolean;
	onPick?: () => void;
};

const REBUILD_ICON = "↻";
const SLOT_ICON = "+";

const PlanRow = ({ tier }: { tier: PlanTier }) => {
	const body = (
		<>
			<span
				className={clsx(
					RADIO,
					tier.current ? "border-zinc-300" : "border-zinc-600"
				)}
			>
				{tier.current ? (
					<span className="size-2 rounded-full bg-zinc-300" />
				) : null}
			</span>
			<Text className="w-20 shrink-0 font-bold">{tier.cap}</Text>
			{tier.rate === FREE_RATE ? (
				<Text tone="viridian">{tier.rate}</Text>
			) : (
				<PriceTag label={tier.rate} variant="recurring" />
			)}
		</>
	);

	if (tier.onPick === undefined) {
		return <div className={clsx(PLAN_ROW, "border-edge-strong")}>{body}</div>;
	}

	return (
		<button
			type="button"
			onClick={tier.onPick}
			className={clsx(
				PLAN_ROW,
				"border-edge transition-colors hover:border-zinc-500"
			)}
		>
			{body}
		</button>
	);
};

export type ShopScreenProps = {
	header: HeaderProps;
	theme?: SwatchTheme;
	storage: {
		meta: string;
		slots: number;
	};
	build: {
		meta: string;
		rows: readonly ShopBuildRow[];
		buySlot?: BuyLineProps;
	};
	offers: {
		meta: string;
		rows: readonly ShopOfferRow[];
		extend?: ExtendOffer;
		rebuild: BuyLineProps;
	};
	plan: {
		meta: string;
		note: string;
		tiers: readonly PlanTier[];
	};
	gitTag?: BuyLineProps;
	continueLabel: string;
	onContinue?: () => void;
};

export const ShopScreen = ({
	header,
	theme,
	storage,
	build,
	offers,
	plan,
	gitTag,
	continueLabel,
	onContinue,
}: ShopScreenProps) => (
	<Panel theme={theme}>
		<Header {...header} />

		<Section label="Build storage" meta={storage.meta}>
			<SlotTrack
				segments={segmentsOf(build.rows)}
				slots={storage.slots}
				numbered
			/>
		</Section>

		<div className={COLUMNS}>
			<div className="@container">
				<Section label="Build" meta={build.meta}>
					<div className="divide-y divide-edge">
						{build.rows.map((row) => (
							<BuildRow key={row.name} row={row} />
						))}
					</div>
					{build.buySlot === undefined ? null : (
						<BuyLine icon={SLOT_ICON} {...build.buySlot} />
					)}
				</Section>
			</div>

			<div className="@container">
				<Section label="Offers" meta={offers.meta} divided>
					{offers.rows.map((row) => (
						<Row
							key={row.name}
							name={row.name}
							tag={<Slots family={row.family} slots={row.slots} />}
							detail={row.detail}
							dimmed={row.locked}
							trailing={
								<>
									{row.price === undefined ? null : (
										<PriceTag
											label={row.price}
											variant={row.locked === true ? "short" : "pay"}
										/>
									)}
									<IconButton
										icon={BUY_ICON}
										label={row.buyLabel}
										disabled={row.locked}
										onUse={row.onBuy}
									/>
								</>
							}
						/>
					))}
					{offers.extend === undefined ? null : (
						<div className={EXTEND_ROW}>
							<span aria-hidden className={EXTEND_MARK}>
								{EXTEND_ICON}
							</span>
							<Text tone="faint" size="caption" className="min-w-0 flex-1">
								{offers.extend.note}
							</Text>
							<PriceTag
								label={`${offers.extend.label} · ${offers.extend.price}`}
								onUse={offers.extend.onExtend}
							/>
						</div>
					)}
					<BuyLine icon={REBUILD_ICON} {...offers.rebuild} />
				</Section>
			</div>
		</div>

		{/* The plan is the one thing here that outlives the visit, so it gets a
		    rule between it and the shelves you are picking from now. */}
		<div className="border-t border-edge">
			<Section label="Storage plan" meta={plan.meta} defaultOpen={false}>
				<div className="flex flex-col gap-2 pt-1 pb-2">
					<Text as="p" tone="muted">
						{plan.note}
					</Text>
					{plan.tiers.map((tier) => (
						<PlanRow key={tier.cap} tier={tier} />
					))}
				</div>
			</Section>
		</div>

		{gitTag === undefined ? null : (
			<div className="border-t border-edge">
				<BuyLine icon={<GitTagIcon className="text-celadon" />} {...gitTag} />
			</div>
		)}

		<footer className={FOOTER}>
			<Button
				label={continueLabel}
				variant="primary"
				className="@max-md:flex-1"
				onUse={onContinue}
			/>
		</footer>
	</Panel>
);
