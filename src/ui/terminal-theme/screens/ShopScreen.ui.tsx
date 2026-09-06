import { useId } from "react";

import { clsx } from "clsx";

import type { SwatchTheme } from "~/modules/run/gate/domain/swatch.model";

import { Button } from "../Button.ui";
import { BuyLine, type BuyLineProps } from "../BuyLine.ui";
import { Change, type ChangeStep } from "../Change.ui";
import { DexChip } from "../DexChip.ui";
import { GitTagIcon } from "../GitTagIcon.ui";
import { Header, type HeaderProps } from "../Header.ui";
import { IconButton } from "../IconButton.ui";
import { LockIcon } from "../LockIcon.ui";
import { Panel } from "../Panel.ui";
import { PriceTag } from "../PriceTag.ui";
import { Row } from "../Row.ui";
import { Section } from "../Section.ui";
import { SlotDeal, type SlotDealRow } from "../SlotDeal.ui";
import { SlotTrack, type SlotSegment } from "../SlotTrack.ui";
import { StoragePlan, type StoragePlanProps } from "../StoragePlan.ui";
import { Text } from "../Text.ui";

const FOOTER =
	"flex flex-wrap items-center justify-end gap-3 border-t border-edge pt-4";
const FOOTER_ACTION =
	"flex flex-col items-end gap-1.5 @max-md:w-full @max-md:items-stretch";
const LOCK_NOTE = "text-right @max-md:text-left";

const COLUMNS =
	"grid grid-cols-2 items-start gap-x-6 @max-md:grid-cols-1 @max-md:gap-y-2";
const BUILD_TRACK = "border-b border-edge py-2";
const ARMED_ROW = "-mx-2 rounded-lg bg-zinc-100/5 px-2";
const ARMED_PRICE = "flex items-center gap-2 pb-1.5";
const UPGRADE_ICON = "↑";
const REMOVE_ICON = "✕";
const SWAP_ICON = "⇄";
const MAXED_LABEL = "maxed";
const MAXED = "shrink-0 whitespace-nowrap";
const CONFIRM_ICON = "✓";
const CANCEL_ICON = "✕";
const BUY_ICON = "⤓";
const LOCK_ICON = <LockIcon />;
const NOTICE =
	"rounded-lg border border-saffron/30 bg-saffron/5 px-3 py-2 text-saffron";

const EXTEND_ROW =
	"flex flex-wrap items-center gap-3 rounded-lg border border-dashed border-edge-strong px-3 py-2";
const EXTEND_MARK =
	"flex size-5 shrink-0 items-center justify-center rounded-full border border-dashed border-edge-strong text-zinc-500";
const EXTEND_ICON = "+";

export type ArmedAction = {
	action: "upgrade" | "remove";
	confirmLabel: string;
	cancelLabel: string;
	note?: string;
	onConfirm?: () => void;
	onCancel?: () => void;
};

export type ShopBuildRow = {
	name: string;
	detail: string;
	slots: number;
	version: number;
	maxVersion: number;
	maxed?: boolean;
	upgrade?: {
		version?: string;
		changes: readonly ChangeStep[];
		price: string;
		label: string;
		reason?: string;
		onArm?: () => void;
	};
	remove: {
		label: string;
		value?: string;
		onArm?: () => void;
	};
	swap?: {
		label: string;
		onUse?: () => void;
	};
	armed?: ArmedAction;
};

export type ExtendOffer = {
	note: string;
	label: string;
	price: string;
	onExtend?: () => void;
};

export type OfferLock = {
	pinned: boolean;
	label: string;
	onToggle?: () => void;
};

export type ShopOfferRow = {
	name: string;
	detail: string;
	slots: number;
	version: number;
	maxVersion: number;
	upgrades?: boolean;
	price?: string;
	buyLabel: string;
	onBuy?: () => void;
	refused?: boolean;
	refusal?: string;
	lock?: OfferLock;
};

const segmentsOf = (
	rows: readonly { slots: number }[]
): readonly SlotSegment[] => rows.map((row) => ({ slots: row.slots }));

// The chip already states the version, so the tag column carries only the bump
// an armed upgrade is about to make.
const buildTag = (row: ShopBuildRow) => {
	if (row.armed?.action !== "upgrade" || row.upgrade?.version === undefined)
		return null;
	return <Change from={`v${row.version}`} to={row.upgrade.version} />;
};

const configChip = (row: ShopBuildRow | ShopOfferRow) => (
	<DexChip
		slots={row.slots}
		label={row.name}
		version={row.version}
		maxVersion={row.maxVersion}
	/>
);

const actionHint = (...parts: readonly (string | undefined)[]) =>
	parts.filter((part) => part !== undefined).join(" · ");

const ArmedPrice = ({
	row,
	armed,
}: {
	row: ShopBuildRow;
	armed: ArmedAction;
}) => {
	if (armed.action === "upgrade") {
		return row.upgrade === undefined ? null : (
			<span className={ARMED_PRICE}>
				<Text tone="muted" size="caption" weight="thin">
					Upgrade price
				</Text>
				<PriceTag label={row.upgrade.price} />
			</span>
		);
	}
	if (row.remove.value === undefined) return null;
	return (
		<span className={ARMED_PRICE}>
			<Text tone="muted" size="caption" weight="thin">
				Uninstall price
			</Text>
			<PriceTag label={row.remove.value} variant="receive" />
		</span>
	);
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
		<IconButton
			icon={CONFIRM_ICON}
			label={armed.confirmLabel}
			hint={actionHint(row.name, armed.confirmLabel)}
			armed
			onUse={armed.onConfirm}
		/>
		<IconButton
			icon={CANCEL_ICON}
			label={armed.cancelLabel}
			hint={actionHint(row.name, armed.cancelLabel)}
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
			hint={actionHint(
				row.name,
				row.upgrade.label,
				row.upgrade.price,
				row.upgrade.reason
			)}
			tone="legendary"
			disabled={row.upgrade.onArm === undefined}
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
			{row.swap === undefined ? null : (
				<IconButton
					icon={SWAP_ICON}
					label={row.swap.label}
					hint={actionHint(row.name, row.swap.label)}
					disabled={row.swap.onUse === undefined}
					onUse={row.swap.onUse}
				/>
			)}
			<UpgradeSlot row={row} />
			<IconButton
				icon={REMOVE_ICON}
				label={row.remove.label}
				hint={actionHint(row.name, row.remove.label, row.remove.value)}
				tone="cinnabar"
				disabled={row.remove.onArm === undefined}
				onUse={row.remove.onArm}
			/>
		</>
	);
};

const BuildRow = ({ row }: { row: ShopBuildRow }) => (
	<div className={clsx(row.armed !== undefined && ARMED_ROW)}>
		<Row
			name={configChip(row)}
			tag={buildTag(row)}
			detail={row.armed?.note ?? row.detail}
			trailing={<BuildTrailing row={row} />}
		/>
		{row.armed === undefined ? null : (
			<ArmedPrice row={row} armed={row.armed} />
		)}
	</div>
);

const REBUILD_ICON = "↻";

export type ShopScreenProps = {
	header: HeaderProps;
	theme?: SwatchTheme;
	notice?: string;
	storage: {
		meta: string;
		slots: number;
	};
	build: {
		meta: string;
		rows: readonly ShopBuildRow[];
		slotRows: readonly SlotDealRow[];
	};
	offers: {
		meta: string;
		rows: readonly ShopOfferRow[];
		extend?: ExtendOffer;
		rebuild: BuyLineProps;
	};
	plan: StoragePlanProps;
	gitTag?: BuyLineProps;
	continueLabel: string;
	continueLock?: string;
	onContinue?: () => void;
};

export const ShopScreen = ({
	header,
	theme,
	notice,
	storage,
	build,
	offers,
	plan,
	gitTag,
	continueLabel,
	continueLock,
	onContinue,
}: ShopScreenProps) => {
	const lockId = useId();

	return (
		<Panel theme={theme}>
			<Header {...header} />

			{notice === undefined ? null : (
				<Text as="p" size="caption" className={NOTICE}>
					{notice}
				</Text>
			)}

			<div className={COLUMNS}>
				<div className="@container">
					<Section label="Build" meta={build.meta}>
						<div className={BUILD_TRACK}>
							<SlotTrack
								segments={segmentsOf(build.rows)}
								slots={storage.slots}
								reading={storage.meta}
							/>
						</div>
						<div className="divide-y divide-edge">
							{build.rows.map((row) => (
								<BuildRow key={row.name} row={row} />
							))}
							{build.slotRows.map((row) => (
								<SlotDeal key={row.label} row={row} />
							))}
						</div>
					</Section>
				</div>

				<div className="@container">
					<Section label="Offers" meta={offers.meta} divided>
						{offers.rows.map((row) => (
							<Row
								key={row.name}
								name={configChip(row)}
								detail={row.detail}
								dimmed={row.refused}
								trailing={
									<>
										{row.price === undefined ? null : (
											<PriceTag
												label={row.price}
												variant={row.refused === true ? "short" : "pay"}
											/>
										)}
										{row.lock === undefined ? null : (
											<IconButton
												icon={LOCK_ICON}
												label={row.lock.label}
												hint={actionHint(row.name, row.lock.label)}
												tone="theme"
												iconOnly
												armed={row.lock.pinned}
												disabled={row.lock.onToggle === undefined}
												onUse={row.lock.onToggle}
											/>
										)}
										<IconButton
											icon={BUY_ICON}
											label={row.buyLabel}
											hint={actionHint(
												row.name,
												row.buyLabel,
												row.price,
												row.refusal
											)}
											disabled={row.refused === true || row.onBuy === undefined}
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
			<div className="border-t border-edge pt-4">
				<StoragePlan {...plan} className="max-w-2xl" />
			</div>

			{gitTag === undefined ? null : (
				<div className="border-t border-edge">
					<BuyLine icon={<GitTagIcon className="text-celadon" />} {...gitTag} />
				</div>
			)}

			<footer className={FOOTER}>
				<div className={FOOTER_ACTION}>
					<Button
						label={continueLabel}
						variant="primary"
						disabled={continueLock !== undefined || onContinue === undefined}
						describedBy={continueLock === undefined ? undefined : lockId}
						onUse={onContinue}
					/>
					{continueLock === undefined ? null : (
						<p id={lockId} className={LOCK_NOTE}>
							<Text size="caption" tone="saffron">
								{continueLock}
							</Text>
						</p>
					)}
				</div>
			</footer>
		</Panel>
	);
};
