import {
	BorderCard,
	type BorderCardProps,
} from "~/modules/account/profile/presentation/BorderCard.ui";

const COPY = {
	heading: "Border Shop",
	blurb: "Buy with archived storage. Equip to display on your profile.",
} as const;

export type BorderShopProps = {
	cards: readonly (BorderCardProps & { id: string })[];
	error?: string;
};

export const BorderShop = ({ cards, error }: BorderShopProps) => (
	<section id="border-shop" className="space-y-3 scroll-mt-8">
		<header className="space-y-2">
			<h2 className="text-4xl">{COPY.heading}</h2>
			<p className="text-lg">{COPY.blurb}</p>
		</header>

		<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
			{cards.map(({ id, ...card }) => (
				<BorderCard key={id} {...card} />
			))}
		</div>

		{error && <p className="text-cinnabar text-sm">{error}</p>}
	</section>
);
