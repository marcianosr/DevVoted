import { LOCKED_CONFIG } from "~/shared/lib/copy";
import { clsx } from "clsx";

import { Badge } from "./Badge.ui";
import { Button, type ButtonTone, type DetailReveal } from "./Button.ui";
import type { KantoColor } from "./colors";
import { ConfigInfo, type ConfigInfoProps } from "./ConfigInfo.ui";
import { InstallScale, type InstallScaleProps } from "./InstallScale.ui";
import { Redaction, type Redactable } from "./Redaction.ui";
import {
	Upgrades,
	offeredRungOf,
	type UpgradeRung,
	type UpgradesProps,
} from "./Upgrades.ui";
import { Version } from "./Version.ui";
import { Weight } from "./Weight.ui";

const COPY = {
	install: "Install",
	confirm: "Confirm",
} as const;

const WRAP = "group/info relative inline-flex";
export const CHIP =
	"inline-flex items-center gap-1.5 rounded-lg border bg-theme/5 px-4 py-2 text-sm whitespace-nowrap";
export const EDGE = "border-theme-faint";
const EDGE_LIT = "border-theme";
export const SKIPPED_CHIP = "opacity-60";
export const NAME = "text-theme-faint";
const LOST_NAME = "line-through text-theme-soft";
export const SKIPPED_NAME = "text-theme-muted";

const IDENTITY = "flex min-w-0 items-center gap-1.5";
const IDENTITY_FIXED = "flex-1";
const NAME_LIMIT = "truncate";
const DETAIL = "min-w-0 flex-1 truncate text-xs text-theme-muted";
const TRAILING = "flex shrink-0 items-center gap-1.5";

const FIT_WIDTH = "w-fit max-w-full";
const FIXED_WIDTH = "w-82";
const FULL_WIDTH = "w-full";

export type ChipWidth = "fit" | "fixed" | "full";

const WIDTH = {
	fit: FIT_WIDTH,
	fixed: FIXED_WIDTH,
	full: FULL_WIDTH,
} satisfies Record<ChipWidth, string>;

/**
 * A phone gets a sheet, not a popup: the panel is wider than the gap between a
 * chip and the screen's edge, so anchoring it to the trigger put half of it
 * past the viewport with nothing to scroll it back. Fixed to the bottom of the
 * screen it fits by construction. From `sm` there is room to anchor it again,
 * which keeps the panel beside the thing it explains.
 */
const PANEL =
	"fixed inset-x-4 bottom-4 z-30 transition-opacity sm:absolute sm:inset-x-auto sm:top-full sm:bottom-auto sm:left-0 sm:mt-2";
const PANEL_SHUT =
	"pointer-events-none invisible opacity-0 group-hover/info:visible group-hover/info:opacity-100 group-has-[:focus-visible]/info:visible group-has-[:focus-visible]/info:opacity-100";
const PANEL_OPEN = "pointer-events-auto visible opacity-100";

const INFO_TONE: ButtonTone = "ambient";
const UPGRADE_TONE: ButtonTone = "action";
const INSTALL_TONE: ButtonTone = "action";
const CONFIRM_TONE: ButtonTone = "commit";
const UNINSTALL_TONE: ButtonTone = "danger";

const INFO_GLYPH = "i";
const UNINSTALL_GLYPH = "×";
const UPGRADE_GLYPH = "↑";
const HINT_SEPARATOR = " · ";

export type ConfigChipBadge =
	| { label: string; color: KantoColor }
	| {
			label: string;
			onPress: () => void;
			armed?: boolean;
			disabled?: boolean;
			hint?: string;
	  };

export type ChipInstall = {
	onPress?: () => void;
	price?: string;
	disabled?: boolean;
	hint?: string;
	/**
	 * What this install would do to the standing bill, when it crosses a rung
	 * (ADR-098). Its presence is what makes the press arm: an install inside the
	 * rung already rented stays a single press.
	 */
	scale?: InstallScaleProps;
	armed?: boolean;
};

export type ConfigChipProps = Redactable<{
	name: string;
	badges: ConfigChipBadge[];
	slots?: number;
	version?: number;
	detail?: string;
	width?: ChipWidth;
	lost?: boolean;
	skipped?: boolean;
	install?: ChipInstall;
	onUninstall?: () => void;
	info?: ConfigInfoProps;
	infoOpen?: boolean;
	onToggleInfo?: () => void;
	upgrades?: UpgradesProps;
	upgradesOpen?: boolean;
	onToggleUpgrades?: () => void;
	priceOn?: DetailReveal;
	highlighted?: boolean;
	credited?: boolean;
	onHover?: () => void;
	onLeave?: () => void;
}>;

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

const upgradeHintOf = (name: string, { version, price }: UpgradeRung) => {
	const names = `Upgrade ${name} to v${version}`;
	return price === undefined ? names : `${names}${HINT_SEPARATOR}${price}`;
};

const installHintOf = (name: string, price?: string) => {
	const names = `${COPY.install} ${name}`;
	return price === undefined ? names : `${names}${HINT_SEPARATOR}${price}`;
};

const confirmHintOf = (name: string, price?: string) => {
	const names = `${COPY.confirm} installing ${name}`;
	return price === undefined ? names : `${names}${HINT_SEPARATOR}${price}`;
};

const BadgeOf = ({ badge }: { badge: ConfigChipBadge }) => {
	if ("color" in badge) {
		return <Badge color={badge.color}>{badge.label}</Badge>;
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

export const ConfigChip = (props: ConfigChipProps) => {
	if (props.locked) {
		return (
			<span className={clsx(CHIP, EDGE, FIT_WIDTH)}>
				<span className={NAME}>
					<Redaction label={LOCKED_CONFIG} />
				</span>
			</span>
		);
	}

	const {
		name,
		badges,
		slots,
		version,
		detail,
		width = "fit",
		lost = false,
		skipped = false,
		install,
		onUninstall,
		info,
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
	} = props;

	const fixed = width !== "fit";
	const offered =
		upgrades === undefined ? undefined : offeredRungOf(upgrades.rungs);

	// An armed install outranks both: it is the only panel the player is mid-way
	// through answering, and it goes away the moment they answer it.
	const arming = install?.armed === true ? install.scale : undefined;
	const upgrading = upgradesOpen && upgrades !== undefined;
	const panel =
		arming !== undefined ? (
			<InstallScale {...arming} />
		) : upgrading ? (
			<Upgrades {...upgrades} onClose={onToggleUpgrades} />
		) : info === undefined ? null : (
			<ConfigInfo {...info} />
		);
	const pinned = arming !== undefined || upgrading || infoOpen;

	const chip = (
		<span
			data-credited={credited ? "true" : undefined}
			onMouseEnter={onHover}
			onMouseLeave={onLeave}
			className={clsx(
				CHIP,
				highlighted ? EDGE_LIT : EDGE,
				WIDTH[width],
				skipped && SKIPPED_CHIP
			)}
		>
			{slots === undefined ? null : <Weight slots={slots} />}
			<span className={clsx(IDENTITY, fixed && IDENTITY_FIXED)}>
				<span
					data-screen-theme={lost ? lastColorOf(badges) : undefined}
					className={clsx(nameStyleFor(lost, skipped), NAME_LIMIT)}
				>
					{name}
				</span>
				{version === undefined ? null : <Version version={version} />}
				{detail === undefined ? null : <span className={DETAIL}>{detail}</span>}
			</span>
			<span className={TRAILING}>
				{badges.map((badge) => (
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
					/>
				)}
				{install === undefined ? null : (
					<Button
						tone={arming === undefined ? INSTALL_TONE : CONFIRM_TONE}
						label={arming === undefined ? COPY.install : COPY.confirm}
						detail={install.price}
						detailOn={priceOn}
						hint={
							arming === undefined
								? (install.hint ?? installHintOf(name, install.price))
								: confirmHintOf(name, install.price)
						}
						disabled={install.disabled ?? install.onPress === undefined}
						pressed={arming !== undefined}
						onPress={install.onPress}
					/>
				)}
				{info === undefined ? null : (
					<Button
						tone={INFO_TONE}
						glyph={INFO_GLYPH}
						label={`About ${name}`}
						expanded={infoOpen}
						onPress={onToggleInfo}
					/>
				)}
				{onUninstall === undefined ? null : (
					<Button
						tone={UNINSTALL_TONE}
						glyph={UNINSTALL_GLYPH}
						label={`Uninstall ${name}`}
						onPress={onUninstall}
					/>
				)}
			</span>
		</span>
	);

	if (panel === null) return chip;

	return (
		<span className={clsx(WRAP, WIDTH[width])}>
			{chip}
			<span
				aria-hidden={!pinned}
				className={clsx(PANEL, pinned ? PANEL_OPEN : PANEL_SHUT)}
			>
				{panel}
			</span>
		</span>
	);
};
