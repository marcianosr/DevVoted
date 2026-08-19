import { clsx } from "clsx";

import { RARITY_COLORS } from "~/ui/rarityColors";
import type { Rarity } from "~/ui/rarityColors";

type ConfigCardProps = {
	name: string;
	rarity: Rarity;
	size?: "small" | "large";
	disabled?: boolean;
	costLabel?: string;
	refundLabel?: string;
	description?: string;
	showDetails?: boolean;
};

export const ConfigCard = ({
	name,
	rarity,
	size = "large",
	disabled,
	costLabel,
	refundLabel,
	description,
	showDetails,
}: ConfigCardProps) => {
	const color = RARITY_COLORS[rarity];

	if (size === "small") {
		const storageLine = [
			costLabel && `Cost: ${costLabel}`,
			refundLabel && `Refund: ${refundLabel}`,
		]
			.filter(Boolean)
			.join(" · ");

		return (
			<article
				className={clsx(
					"border p-2 flex-1",
					showDetails ? "w-56" : "min-w-40",
					color.border,
					color.bg,
					disabled && "opacity-50 cursor-not-allowed"
				)}
			>
				<div className="flex gap-2 place-items-center">
					<h3 className={clsx("text-base", color.text)}>{name}</h3>
					<span className={clsx("text-xs", color.text)}>({rarity})</span>
				</div>
				{showDetails && storageLine && (
					<p className="text-sm mt-1">{storageLine}</p>
				)}
				{showDetails && description && (
					<p className="text-sm border-t border-t-white mt-2 pt-2">
						{description}
					</p>
				)}
			</article>
		);
	}

	return (
		<article
			className={clsx(
				"border p-4 w-52 flex-1 min-h-52",
				color.border,
				color.bg,
				disabled && "opacity-50 cursor-not-allowed"
			)}
		>
			<h3 className={clsx("text-2xl", color.text)}>{name}</h3>
			{costLabel && <p>Cost: {costLabel}</p>}
			{refundLabel && <p>Refund: {refundLabel}</p>}
			<p>
				Rarity: <span className={color.text}>{rarity}</span>
			</p>
			{description && (
				<p className="border-t border-t-white mt-2 pt-2">{description}</p>
			)}
		</article>
	);
};
