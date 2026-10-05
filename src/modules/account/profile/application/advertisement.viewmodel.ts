import {
	type Border,
	borders,
} from "~/modules/account/profile/domain/border.model";
import type { AdvertisementCardProps } from "~/modules/account/profile/presentation/AdvertisementCard.ui";
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
	"hub" | "newRun" | "profile" | "community" | "poll";

export type Advertisement =
	{ kind: "suggest" } | { kind: "border"; border: Border };

export type AdvertisementViewer = {
	isAdmin: boolean;
	ownedBorderIds: readonly string[];
};

export type AdvertisementRoll = { kind: number; border: number };

export type AdvertisementFace = { name: string; photoUrl?: string };

const SUGGEST_SHARE = 0.5;
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

export const advertisementFor = (
	{ isAdmin, ownedBorderIds }: AdvertisementViewer,
	roll: AdvertisementRoll
): Advertisement | undefined => {
	const forSale = bordersForSaleTo(ownedBorderIds);
	if (forSale.length === 0) return isAdmin ? undefined : SUGGEST;
	if (isAdmin || roll.kind >= SUGGEST_SHARE)
		return borderAt(forSale, roll.border);
	return SUGGEST;
};

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
