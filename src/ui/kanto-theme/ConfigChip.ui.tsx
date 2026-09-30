import { LOCKED_CONFIG } from "~/shared/lib/copy";
import { clsx } from "clsx";

import { Badge } from "./Badge.ui";
import { Button, type ButtonTone, type DetailReveal } from "./Button.ui";
import type { KantoColor } from "./colors";
import {
	ConfigEffect,
	ConfigMeta,
	type ConfigFactsProps,
} from "./ConfigFacts.ui";
import { ConfigUnlock, type ConfigUnlockPath } from "./ConfigUnlock.ui";
import { CountedFigure } from "./CountedFigure.ui";
import { Icon } from "./Icon.ui";
import { InstallScale, type InstallScaleProps } from "./InstallScale.ui";
import { Redaction, type Redactable } from "./Redaction.ui";
import {
	Upgrades,
	offeredRungOf,
	type UpgradeRung,
	type UpgradesProps,
} from "./Upgrades.ui";
import { Version } from "./Version.ui";
import { Pick, type PickProps } from "./Pick.ui";
import { Weight } from "./Weight.ui";

const COPY = {
	install: "Install",
	uninstall: "Uninstall",
	confirm: "Confirm",
	expand: "Expand",
	collapse: "Collapse",
} as const;

const WRAP = "group/info relative flex w-full";
const BARE_WRAP = "group/info relative inline-flex w-fit max-w-full";

export const CARD = "flex w-full flex-col rounded-xl border bg-theme/5 text-sm";

export const CARD_FLOW =
	"grid-cols-[repeat(auto-fill,minmax(20rem,1fr))] items-start";
const CHIP_SHAPE =
	"inline-flex items-center gap-1.5 rounded-lg border bg-theme/5 text-sm whitespace-nowrap";
export const CHIP = clsx(CHIP_SHAPE, "px-4 py-2");
const COMPACT_CHIP = clsx(CHIP_SHAPE, "px-1.5 py-1");
const BARE_WIDTH = "w-fit max-w-full";
export const EDGE = "border-theme-faint";
const EDGE_LIT = "border-theme";
const LOCKED_EDGE = "border-dashed border-theme-faint";
export const SKIPPED_CHIP = "opacity-60";
export const NAME = "text-theme-faint";
const LOST_NAME = "line-through text-theme-soft";
export const SKIPPED_NAME = "text-theme-muted";

const HEAD = "flex flex-col gap-2 px-4 py-3";
const HEAD_ROW = "flex flex-wrap items-center gap-2";
const CARD_NAME = "flex-1 font-extrabold";
const BARE_IDENTITY = "flex min-w-0 items-center gap-1.5";
const NAME_LIMIT = "break-words";
const TAG_LINE = "flex w-full flex-wrap items-center gap-1.5";
const DETAIL = "min-w-0 text-xs text-theme-muted";
const BARE_DETAIL = "min-w-0 flex-1 truncate text-xs text-theme-muted";
const PEEKED_NAME = "flex flex-1 flex-col";
const PEEKED_NAME_TEXT = "font-extrabold";
const PEEK = "w-0 min-w-full truncate text-xs text-theme-muted";
const TRAILING = "flex shrink-0 items-center gap-1.5";
const RULE = "border-t border-theme-faint";
const BODY = "flex flex-col gap-1.5 px-4 py-3";
const FOOT = "px-4 py-2";

const PANEL =
	"fixed inset-x-4 bottom-4 z-30 transition-opacity sm:absolute sm:inset-x-auto sm:top-full sm:bottom-auto sm:left-0 sm:mt-2";
const PANEL_SHUT =
	"pointer-events-none invisible opacity-0 group-hover/info:visible group-hover/info:opacity-100 group-has-[:focus-visible]/info:visible group-has-[:focus-visible]/info:opacity-100";
const PANEL_OPEN = "pointer-events-auto visible opacity-100";

const DISCLOSE_TONE: ButtonTone = "bare";
const DISCLOSE_GLYPH = "size-4 stroke-[2.5] transition-transform";
const DISCLOSE_OPEN = "rotate-90";
const UPGRADE_TONE: ButtonTone = "action";
const INSTALL_TONE: ButtonTone = "ambient";
const CONFIRM_TONE: ButtonTone = "commit";
const UNINSTALL_TONE: ButtonTone = "ambient";
const REFUND_COLOR: KantoColor = "viridian";
const REFUND_GLYPH = "size-3";
const GAIN_SIGN = "+";

const UPGRADE_GLYPH = "↑";
const HINT_SEPARATOR = " · ";

export type ConfigChipBadge =
	| {
			label: string;
			color: KantoColor;
			count?: number;
	  }
	| {
			label: string;
			onPress: () => void;
			armed?: boolean;
			disabled?: boolean;
			hint?: string;
	  };

export type ChipQuote = "install" | "upgrade" | "uninstall";

export type ChipInstall = {
	onPress?: () => void;
	label?: string;
	price?: string;
	disabled?: boolean;
	hint?: string;
	scale?: InstallScaleProps;
	armed?: boolean;
};

type ConfigChipSecrets = {
	name: string;
	badges: ConfigChipBadge[];
	pick?: PickProps;
	version?: number;
	detail?: string;
	lost?: boolean;
	skipped?: boolean;
	install?: ChipInstall;
	onUninstall?: () => void;
	info?: ConfigFactsProps;
	upgrades?: UpgradesProps;
	upgradesOpen?: boolean;
	onToggleUpgrades?: () => void;
	priceOn?: DetailReveal;
	highlighted?: boolean;
	credited?: boolean;
	onHover?: () => void;
	onLeave?: () => void;
	onQuote?: (quote?: ChipQuote) => void;
};

type ConfigChipStated = {
	compact?: boolean;
	slots?: number;
	unlock?: readonly ConfigUnlockPath[];
	infoOpen?: boolean;
	onToggleInfo?: () => void;
};

export type ConfigChipProps = Redactable<ConfigChipSecrets, ConfigChipStated>;

const nameStyleFor = (lost: boolean, skipped: boolean) => {
	if (lost) return LOST_NAME;
	if (skipped) return SKIPPED_NAME;
	return NAME;
};

const lastColorOf = (badges: ConfigChipBadge[]) => {
	const last = badges.at(-1);
	if (last === undefined || !("color" in last)) return undefined;
	return last.color;
};

const isPressable = (badge: ConfigChipBadge) => "onPress" in badge;

const upgradeHintOf = (name: string, { version, price }: UpgradeRung) => {
	const names = `Upgrade ${name} to v${version}`;
	return price === undefined ? names : `${names}${HINT_SEPARATOR}${price}`;
};

const installHintOf = (verb: string, name: string, price?: string) => {
	const names = `${verb} ${name}`;
	return price === undefined ? names : `${names}${HINT_SEPARATOR}${price}`;
};

const confirmHintOf = (name: string, price?: string) => {
	const names = `${COPY.confirm} installing ${name}`;
	return price === undefined ? names : `${names}${HINT_SEPARATOR}${price}`;
};

const uninstallHintOf = (name: string, refund?: string) => {
	const names = `${COPY.uninstall} ${name}`;
	return refund === undefined
		? names
		: `${names}${HINT_SEPARATOR}${gainOf(refund)}`;
};

const gainOf = (refund: string) => `${GAIN_SIGN}${refund}`;

type UninstallPressProps = {
	name: string;
	refund?: string;
	onPress: () => void;
	onHover?: () => void;
	onLeave?: () => void;
};

const UninstallPress = ({
	name,
	refund,
	onPress,
	onHover,
	onLeave,
}: UninstallPressProps) => {
	if (refund === undefined)
		return (
			<Button
				tone={UNINSTALL_TONE}
				label={COPY.uninstall}
				hint={uninstallHintOf(name)}
				onPress={onPress}
				onHover={onHover}
				onLeave={onLeave}
			/>
		);

	return (
		<Button
			tone={UNINSTALL_TONE}
			label={COPY.uninstall}
			cap={
				<>
					<Icon name="undo" className={REFUND_GLYPH} />
					{gainOf(refund)}
				</>
			}
			capAt="trail"
			capColor={REFUND_COLOR}
			hint={uninstallHintOf(name, refund)}
			onPress={onPress}
			onHover={onHover}
			onLeave={onLeave}
		/>
	);
};

const BadgeOf = ({ badge }: { badge: ConfigChipBadge }) => {
	if ("color" in badge) {
		return (
			<Badge color={badge.color}>
				{badge.count === undefined ? (
					badge.label
				) : (
					<CountedFigure value={badge.count} unit={badge.label} />
				)}
			</Badge>
		);
	}

	return (
		<Badge
			onPress={badge.onPress}
			armed={badge.armed}
			disabled={badge.disabled}
			hint={badge.hint}
		>
			{badge.label}
		</Badge>
	);
};

type DiscloseProps = {
	stated: boolean;
	name: string;
	onPress: () => void;
};

const Disclose = ({ stated, name, onPress }: DiscloseProps) => (
	<Button
		tone={DISCLOSE_TONE}
		glyph={
			<Icon
				name="chevron"
				className={clsx(DISCLOSE_GLYPH, stated && DISCLOSE_OPEN)}
			/>
		}
		label={`${stated ? COPY.collapse : COPY.expand} ${name}`}
		expanded={stated}
		onPress={onPress}
	/>
);

const LockedCard = ({
	slots,
	unlock,
	infoOpen = false,
	onToggleInfo,
}: ConfigChipStated) => {
	const foldable = onToggleInfo !== undefined;
	const stated = foldable ? infoOpen : true;

	return (
		<div className={clsx(CARD, LOCKED_EDGE)}>
			<div className={HEAD}>
				<div className={HEAD_ROW}>
					{onToggleInfo === undefined ? null : (
						<Disclose
							stated={stated}
							name={LOCKED_CONFIG}
							onPress={onToggleInfo}
						/>
					)}
					{slots === undefined ? null : <Weight slots={slots} />}
					<span className={clsx(NAME, CARD_NAME)}>
						<Redaction label={LOCKED_CONFIG} />
					</span>
				</div>
			</div>

			{!stated || unlock === undefined ? null : (
				<>
					<div className={RULE} />

					<div className={BODY}>
						<ConfigUnlock paths={unlock} />
					</div>
				</>
			)}
		</div>
	);
};

export const ConfigChip = (props: ConfigChipProps) => {
	if (props.locked) {
		if (props.slots === undefined && props.unlock === undefined) {
			return (
				<span
					className={clsx(
						props.compact === true ? COMPACT_CHIP : CHIP,
						BARE_WIDTH,
						EDGE
					)}
				>
					<span className={NAME}>
						<Redaction label={LOCKED_CONFIG} />
					</span>
				</span>
			);
		}

		return <LockedCard {...props} />;
	}

	const {
		name,
		badges,
		pick,
		slots,
		version,
		detail,
		lost = false,
		skipped = false,
		install,
		onUninstall,
		info,
		unlock,
		infoOpen = false,
		onToggleInfo,
		upgrades,
		upgradesOpen = false,
		onToggleUpgrades,
		priceOn,
		highlighted = false,
		credited = false,
		onHover,
		onLeave,
		onQuote,
		compact = false,
	} = props;

	const offered =
		upgrades === undefined ? undefined : offeredRungOf(upgrades.rungs);

	const foldable = onToggleInfo !== undefined;
	const stated = foldable ? infoOpen : true;

	const arming = install?.armed === true ? install.scale : undefined;
	const upgrading = upgradesOpen && upgrades !== undefined;
	const panel =
		arming !== undefined ? (
			<InstallScale {...arming} />
		) : upgrading ? (
			<Upgrades {...upgrades} onClose={onToggleUpgrades} />
		) : null;
	const pinned = arming !== undefined || upgrading;

	const decorative = badges.filter((badge) => !isPressable(badge));
	const controls = badges.filter(isPressable);

	const sellPrice = onUninstall === undefined ? info?.sellPrice : undefined;

	const headBadges = stated ? [] : decorative;

	const peek = stated ? undefined : info?.description;

	const footerVersion = info?.version ?? version;
	const footerStated =
		footerVersion !== undefined ||
		sellPrice !== undefined ||
		decorative.length > 0;

	const nameSeated = (seat?: string) => (
		<span
			data-screen-theme={lost ? lastColorOf(badges) : undefined}
			className={clsx(nameStyleFor(lost, skipped), NAME_LIMIT, seat)}
		>
			{name}
		</span>
	);

	const quoting = (quote: ChipQuote) => ({
		onHover: onQuote === undefined ? undefined : () => onQuote(quote),
		onLeave: onQuote === undefined ? undefined : () => onQuote(),
	});

	const trailing = (
		<span className={TRAILING}>
			{controls.map((badge) => (
				<BadgeOf key={badge.label} badge={badge} />
			))}
			{offered === undefined ? null : (
				<Button
					tone={UPGRADE_TONE}
					cap={UPGRADE_GLYPH}
					label={`v${offered.version}`}
					detail={offered.price}
					detailOn={priceOn}
					hint={upgradeHintOf(name, offered)}
					expanded={upgradesOpen}
					onPress={onToggleUpgrades}
					{...quoting("upgrade")}
				/>
			)}
			{install === undefined ? null : (
				<Button
					tone={arming === undefined ? INSTALL_TONE : CONFIRM_TONE}
					label={
						arming === undefined
							? (install.label ?? COPY.install)
							: COPY.confirm
					}
					cap={install.price}
					capAt="trail"
					hint={
						arming === undefined
							? (install.hint ??
								installHintOf(
									install.label ?? COPY.install,
									name,
									install.price
								))
							: confirmHintOf(name, install.price)
					}
					disabled={install.disabled ?? install.onPress === undefined}
					pressed={arming !== undefined}
					onPress={install.onPress}
					{...quoting("install")}
				/>
			)}
			{onUninstall === undefined ? null : (
				<UninstallPress
					name={name}
					refund={info?.sellPrice}
					onPress={onUninstall}
					{...quoting("uninstall")}
				/>
			)}
		</span>
	);

	const edge = highlighted ? EDGE_LIT : EDGE;
	const hovers = {
		onMouseEnter: onHover,
		onMouseLeave: onLeave,
		onFocus: onHover,
		onBlur: onLeave,
	};
	const credit = credited ? "true" : undefined;

	const sheet = (
		<span
			aria-hidden={!pinned}
			className={clsx(PANEL, pinned ? PANEL_OPEN : PANEL_SHUT)}
		>
			{panel}
		</span>
	);

	if (info === undefined && unlock === undefined) {
		const bare = (
			<span
				data-config={name}
				data-credited={credit}
				{...hovers}
				className={clsx(
					compact ? COMPACT_CHIP : CHIP,
					BARE_WIDTH,
					edge,
					skipped && SKIPPED_CHIP
				)}
			>
				{pick === undefined ? null : <Pick {...pick} />}
				{slots === undefined ? null : <Weight slots={slots} />}
				<span className={BARE_IDENTITY}>
					{nameSeated()}
					{version === undefined ? null : <Version version={version} />}
					{decorative.map((badge) => (
						<BadgeOf key={badge.label} badge={badge} />
					))}
					{detail === undefined ? null : (
						<span className={BARE_DETAIL}>{detail}</span>
					)}
				</span>
				{trailing}
			</span>
		);

		if (panel === null) return bare;

		return (
			<span className={BARE_WRAP}>
				{bare}
				{sheet}
			</span>
		);
	}

	const card = (
		<div
			data-config={name}
			data-credited={credit}
			{...hovers}
			className={clsx(CARD, edge, skipped && SKIPPED_CHIP)}
		>
			<div className={HEAD}>
				<div className={HEAD_ROW}>
					{onToggleInfo === undefined ? null : (
						<Disclose stated={stated} name={name} onPress={onToggleInfo} />
					)}
					{pick === undefined ? null : <Pick {...pick} />}
					{slots === undefined ? null : <Weight slots={slots} />}
					{peek === undefined ? (
						nameSeated(CARD_NAME)
					) : (
						<span className={PEEKED_NAME}>
							{nameSeated(PEEKED_NAME_TEXT)}
							<span className={PEEK}>{peek}</span>
						</span>
					)}
					{trailing}
				</div>

				{headBadges.length === 0 && detail === undefined ? null : (
					<div className={TAG_LINE}>
						{headBadges.map((badge) => (
							<BadgeOf key={badge.label} badge={badge} />
						))}
						{detail === undefined ? null : (
							<span className={DETAIL}>{detail}</span>
						)}
					</div>
				)}
			</div>

			{!stated ? null : (
				<>
					<div className={RULE} />

					<div className={BODY}>
						{info === undefined ? null : (
							<ConfigEffect description={info.description} note={info.note} />
						)}
						{unlock === undefined ? null : <ConfigUnlock paths={unlock} />}
					</div>

					{!footerStated ? null : (
						<>
							<div className={RULE} />

							<div className={FOOT}>
								<ConfigMeta
									sellPrice={sellPrice}
									version={footerVersion}
									badges={decorative.map((badge) => (
										<BadgeOf key={badge.label} badge={badge} />
									))}
								/>
							</div>
						</>
					)}
				</>
			)}
		</div>
	);

	if (panel === null) return card;

	return (
		<div className={WRAP}>
			{card}
			{sheet}
		</div>
	);
};
