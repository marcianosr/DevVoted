import { clsx } from "clsx";

import type { ConfigFamily } from "~/modules/run/config/domain/config.model";
import type { SwatchTheme } from "~/modules/run/gate/domain/swatch.model";

import { Button } from "../Button.ui";
import { BuyLine, type BuyLineProps } from "../BuyLine.ui";
import { Change, type ChangeStep } from "../Change.ui";
import { GitTagIcon } from "../GitTagIcon.ui";
import { Header, type HeaderProps } from "../Header.ui";
import { IconButton } from "../IconButton.ui";
import { LockIcon } from "../LockIcon.ui";
import { Panel } from "../Panel.ui";
import { PriceTag } from "../PriceTag.ui";
import { Row } from "../Row.ui";
import { Section } from "../Section.ui";
import { Slots } from "../Slots.ui";
import { StoragePlan, type StoragePlanProps } from "../StoragePlan.ui";
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

export type OfferLock = {
	pinned: boolean;
	label: string;
	onToggle?: () => void;
};

export type ShopOfferRow = {
	family: ConfigFamily;
	name: string;
	detail: string;
	slots: number;
	price?: string;
	buyLabel: string;
	onBuy?: () => void;
	refused?: boolean;
	lock?: OfferLock;
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

const actionHint = (name: string, label: string, price?: string) =>
	[name, label, price].filter((part) => part !== undefined).join(" · ");

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
			hint={actionHint(row.name, row.upgrade.label, row.upgrade.price)}
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
	<Row
		className={clsx(row.armed !== undefined && ARMED_ROW)}
		name={row.name}
		tag={buildTag(row)}
		detail={row.armed?.note ?? row.detail}
		trailing={<BuildTrailing row={row} />}
	/>
);

const REBUILD_ICON = "↻";
const SLOT_ICON = "+";
const CASH_SLOT_ICON = "−";

export type ShopScreenProps = {
	header: HeaderProps;
	theme?: SwatchTheme;
	notice?: string;
	storage: {
		meta: string;
	};
	build: {
		meta: string;
		rows: readonly ShopBuildRow[];
		buySlot?: BuyLineProps;
		cashSlot?: BuyLineProps;
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
}: ShopScreenProps) => (
	<Panel theme={theme}>
		<Header {...header} />

		{notice === undefined ? null : (
			<Text as="p" size="caption" className={NOTICE}>
				{notice}
			</Text>
		)}

		{/* The storage plan below owns the only bar on this screen, so the slot
		    band collapses to its reading. */}
		<Section label="Build storage">
			<Text as="p" tone="muted">
				{storage.meta}
			</Text>
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
					{build.cashSlot === undefined ? null : (
						<BuyLine icon={CASH_SLOT_ICON} {...build.cashSlot} />
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
										hint={actionHint(row.name, row.buyLabel, row.price)}
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
			<Button
				label={continueLock ?? continueLabel}
				variant="primary"
				disabled={continueLock !== undefined || onContinue === undefined}
				className="@max-md:flex-1"
				onUse={onContinue}
			/>
		</footer>
	</Panel>
);
