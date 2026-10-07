import {
	type Border,
	borders,
} from "~/modules/account/profile/domain/border.model";
import type {
	AdvertisementCardProps,
	AdvertisementVariant,
} from "~/modules/account/profile/presentation/AdvertisementCard.ui";
import { APPROVED_POLL_ARCHIVE_KB } from "~/modules/polls/poll/domain/poll.model";
import {
	type CategoryBounty,
	isThinCategory,
} from "~/modules/polls/poll/domain/pollBounty.model";
import { CATEGORY_METADATA } from "~/shared/lib/categories";
import { SUGGEST_POLL_PATH } from "~/shared/lib/pollPath";
import { formatStorage, kbLabel } from "~/shared/lib/storage";

export const COPY = {
	suggestTitle: "Looking for poll editors",
	suggestText: (reward: string) =>
		`Approved polls earn ${reward} archived storage!`,
	suggestAdminText: "Every published poll widens the daily deal.",
	wantedTitle: (category: string) => `Looking for ${category} polls`,
	wantedCount: (category: string, published: number) =>
		`${category} holds only ${published} ${published === 1 ? "poll" : "polls"}.`,
	wantedReward: (reward: string) =>
		`An approved one earns ${reward} archived storage!`,
	suggestCta: "Suggest a poll",
	borderTitle: (name: string) => `${name} border`,
	borderCta: "Open market",
} as const;

export type AdvertisementPlacement =
	"hub" | "newRun" | "profile" | "community" | "poll" | "banner";

export type SuggestAdvertisement = {
	kind: "suggest";
	wanted?: CategoryBounty;
	paysReward: boolean;
};

export type Advertisement =
	SuggestAdvertisement | { kind: "border"; border: Border };

export type AdvertisementViewer = {
	isAdmin: boolean;
	ownedBorderIds: readonly string[];
	bounties: readonly CategoryBounty[];
};

export type AdvertisementRoll = { kind: number; item: number };

export type AdvertisementFace = { name: string; photoUrl?: string };

const BORDERS_TAB_SEARCH = "?tab=borders";

export const bordersForSaleTo = (ownedBorderIds: readonly string[]): Border[] =>
	borders.filter(
		(border) => !border.earnedByVictory && !ownedBorderIds.includes(border.id)
	);

const itemAt = <Item>(items: readonly Item[], roll: number): Item | undefined =>
	items[Math.floor(roll * items.length)];

const borderAt = (forSale: readonly Border[], roll: number): Advertisement => ({
	kind: "border",
	border: forSale[Math.floor(roll * forSale.length)],
});

const suggestFor = (
	{ isAdmin, bounties }: AdvertisementViewer,
	roll: number
): Advertisement => ({
	kind: "suggest",
	wanted: itemAt(bounties.filter(isThinCategory), roll),
	paysReward: !isAdmin,
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
		isEligible: () => true,
		pick: suggestFor,
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
	return entryAt(eligible, roll.kind)?.pick(viewer, roll.item);
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

export const suggestHrefFor = (wanted?: CategoryBounty): string =>
	wanted === undefined
		? SUGGEST_POLL_PATH
		: `${SUGGEST_POLL_PATH}?category=${wanted.code}`;

const wantedTextOf = (wanted: CategoryBounty, paysReward: boolean): string => {
	const count = COPY.wantedCount(
		CATEGORY_METADATA[wanted.code].name,
		wanted.published
	);
	return paysReward
		? `${count} ${COPY.wantedReward(kbLabel(wanted.bountyKb))}`
		: count;
};

const plainSuggestTextOf = (paysReward: boolean): string =>
	paysReward
		? COPY.suggestText(kbLabel(APPROVED_POLL_ARCHIVE_KB))
		: COPY.suggestAdminText;

const suggestPropsFor = ({
	wanted,
	paysReward,
}: SuggestAdvertisement): AdvertisementCardProps => ({
	title:
		wanted === undefined
			? COPY.suggestTitle
			: COPY.wantedTitle(CATEGORY_METADATA[wanted.code].name),
	...(wanted !== undefined && paysReward
		? { price: kbLabel(wanted.bountyKb) }
		: {}),
	text:
		wanted === undefined
			? plainSuggestTextOf(paysReward)
			: wantedTextOf(wanted, paysReward),
	icon: { kind: "cookie" },
	cta: { label: COPY.suggestCta, href: suggestHrefFor(wanted) },
});

export const advertisementPropsFor = (
	advertisement: Advertisement,
	face: AdvertisementFace,
	profileHref: string
): AdvertisementCardProps =>
	advertisement.kind === "suggest"
		? suggestPropsFor(advertisement)
		: {
				title: COPY.borderTitle(advertisement.border.name),
				price: formatStorage(advertisement.border.cost),
				text: advertisement.border.description,
				icon: {
					kind: "face",
					name: face.name,
					photoUrl: face.photoUrl,
					borderUrl: advertisement.border.image,
				},
				cta: { label: COPY.borderCta, href: profileHref + BORDERS_TAB_SEARCH },
			};
