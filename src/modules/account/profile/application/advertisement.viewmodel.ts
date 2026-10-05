import {
	type Border,
	borders,
} from "~/modules/account/profile/domain/border.model";
import type {
	AdvertisementCardProps,
	AdvertisementVariant,
} from "~/modules/account/profile/presentation/AdvertisementCard.ui";
import { APPROVED_POLL_ARCHIVE_KB } from "~/modules/polls/poll/domain/poll.model";
import { SUGGEST_POLL_PATH } from "~/shared/lib/pollPath";
import { formatStorage, kbLabel } from "~/shared/lib/storage";

export const COPY = {
	suggestTitle: "Looking for poll editors",
	suggestText: (reward: string) =>
		`Approved polls earn ${reward} archived storage!`,
	suggestCta: "Suggest a poll",
	borderTitle: (name: string, price: string) => `${name} · ${price}`,
	borderCta: "Open market",
} as const;

export type AdvertisementPlacement =
	"hub" | "newRun" | "profile" | "community" | "poll" | "banner";

export type Advertisement =
	{ kind: "suggest" } | { kind: "border"; border: Border };

export type AdvertisementViewer = {
	isAdmin: boolean;
	ownedBorderIds: readonly string[];
};

export type AdvertisementRoll = { kind: number; border: number };

export type AdvertisementFace = { name: string; photoUrl?: string };

const BORDERS_TAB_SEARCH = "?tab=borders";

const SUGGEST: Advertisement = { kind: "suggest" };

export const bordersForSaleTo = (ownedBorderIds: readonly string[]): Border[] =>
	borders.filter(
		(border) => !border.earnedByVictory && !ownedBorderIds.includes(border.id)
	);

const borderAt = (forSale: readonly Border[], roll: number): Advertisement => ({
	kind: "border",
	border: forSale[Math.floor(roll * forSale.length)],
});

type AdvertisementEntry = {
	kind: Advertisement["kind"];
	weight: number;
	isEligible: (viewer: AdvertisementViewer) => boolean;
	pick: (viewer: AdvertisementViewer, roll: number) => Advertisement;
};

export const ADVERTISEMENTS: readonly AdvertisementEntry[] = [
	{
		kind: "suggest",
		weight: 1,
		isEligible: ({ isAdmin }) => !isAdmin,
		pick: () => SUGGEST,
	},
	{
		kind: "border",
		weight: 1,
		isEligible: ({ ownedBorderIds }) =>
			bordersForSaleTo(ownedBorderIds).length > 0,
		pick: ({ ownedBorderIds }, roll) =>
			borderAt(bordersForSaleTo(ownedBorderIds), roll),
	},
];

const weightOf = (entries: readonly AdvertisementEntry[]): number =>
	entries.reduce((total, entry) => total + entry.weight, 0);

const entryAt = (
	entries: readonly AdvertisementEntry[],
	roll: number
): AdvertisementEntry | undefined => {
	const target = roll * weightOf(entries);
	return entries.find(
		(_, index) => target < weightOf(entries.slice(0, index + 1))
	);
};

export const advertisementFor = (
	viewer: AdvertisementViewer,
	roll: AdvertisementRoll
): Advertisement | undefined => {
	const eligible = ADVERTISEMENTS.filter((entry) => entry.isEligible(viewer));
	return entryAt(eligible, roll.kind)?.pick(viewer, roll.border);
};

const PAGES_WITHOUT_BANNER = [
	"/run",
	"/profile",
	SUGGEST_POLL_PATH,
	"/login",
	"/sign-up",
	"/logout",
	"/auth",
	"/proto-run",
	"/presentation",
] as const;

const isOnPage = (pathname: string, page: string): boolean =>
	pathname === page || pathname.startsWith(`${page}/`);

export const isBannerPage = (pathname: string): boolean =>
	!PAGES_WITHOUT_BANNER.some((page) => isOnPage(pathname, page));

const VARIANT_AT: Partial<
	Record<AdvertisementPlacement, AdvertisementVariant>
> = { poll: "strip", banner: "banner" };

export const variantAt = (
	placement: AdvertisementPlacement
): AdvertisementVariant => VARIANT_AT[placement] ?? "card";

export const isDismissibleVariant = (variant: AdvertisementVariant): boolean =>
	variant !== "strip";

export const advertisementPropsFor = (
	advertisement: Advertisement,
	face: AdvertisementFace,
	profileHref: string
): AdvertisementCardProps =>
	advertisement.kind === "suggest"
		? {
				title: COPY.suggestTitle,
				text: COPY.suggestText(kbLabel(APPROVED_POLL_ARCHIVE_KB)),
				icon: { kind: "cookie" },
				cta: { label: COPY.suggestCta, href: SUGGEST_POLL_PATH },
			}
		: {
				title: COPY.borderTitle(
					advertisement.border.name,
					formatStorage(advertisement.border.cost)
				),
				text: advertisement.border.description,
				icon: {
					kind: "face",
					name: face.name,
					photoUrl: face.photoUrl,
					borderUrl: advertisement.border.image,
				},
				cta: { label: COPY.borderCta, href: profileHref + BORDERS_TAB_SEARCH },
			};
