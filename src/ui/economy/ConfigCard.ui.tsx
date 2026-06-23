import { clsx } from "clsx";

export type Rarity = "common" | "uncommon" | "rare" | "legendary";

export const RARITY_COLORS: Record<
	Rarity,
	{ border: string; text: string; bg: string }
> = {
	common: {
		border: "border-cerulean",
		text: "text-cerulean",
		bg: "bg-cerulean/15",
	},
	uncommon: {
		border: "border-celadon",
		text: "text-celadon",
		bg: "bg-celadon/15",
	},
	rare: {
		border: "border-cinnabar",
		text: "text-cinnabar",
		bg: "bg-cinnabar/15",
	},
	legendary: {
		border: "border-indigo",
		text: "text-indigo",
		bg: "bg-indigo/15",
	},
};

export type ConfigCardProps = {
	name: string;
	cost: string;
	refund: string;
	rarity: Rarity;
	description: string;
	size?: "small" | "large";
	disabled?: boolean;
};

export const ConfigCard = ({
	name,
	cost,
	refund,
	rarity,
	description,
	size = "large",
	disabled = false,
}: ConfigCardProps) => {
	const colors = RARITY_COLORS[rarity];

	if (size === "small") {
		return (
			<article
				className={clsx("border p-2 min-w-40", colors.border, colors.bg)}
			>
				<span className={`text-xs ${colors.text}`}>({rarity})</span>
				<h3 className={clsx("text-md", colors.text)}>{name}</h3>
			</article>
		);
	}

	return (
		<article
			className={clsx(
				"border p-4 w-52 min-h-52",
				colors.border,
				colors.bg,
				disabled && "opacity-50 cursor-not-allowed"
			)}
		>
			<h3 className={clsx("text-2xl", colors.text)}>{name}</h3>
			<p>Cost: {cost}</p>
			<p>Refund: {refund}</p>
			<p>
				Rarity: <span className={colors.text}>{rarity}</span>
			</p>
			<p className="border-t border-t-white mt-2 pt-2">{description}</p>
		</article>
	);
};
