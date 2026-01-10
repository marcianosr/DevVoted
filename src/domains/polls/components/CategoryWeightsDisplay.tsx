import { useQuery } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";

import { getCategoryWeightsHandler } from "~/domains/polls/api/handlers";
import {
	CategoryCode,
	CATEGORY_CODES,
	getCategoryMetadata,
} from "~/domains/shared/categories";

const getCategoryWeights = createServerFn({ method: "GET" }).handler(
	async () => {
		const result = await getCategoryWeightsHandler();

		if (!result || !result.success) {
			throw new Error("Failed to get category weights");
		}

		return result.data;
	}
);

type CategoryWeightItem = {
	code: CategoryCode;
	name: string;
	weight: number;
	percentage: number;
};

/**
 * Converts raw weights to percentages showing probability of each category
 */
const calculatePercentages = (
	weights: Record<CategoryCode, number>
): CategoryWeightItem[] => {
	const totalWeight = Object.values(weights).reduce(
		(sum, weight) => sum + weight,
		0
	);

	return CATEGORY_CODES.map((code) => ({
		code,
		name: getCategoryMetadata(code).name,
		weight: weights[code],
		percentage: totalWeight > 0 ? (weights[code] / totalWeight) * 100 : 0,
	})).sort((a, b) => b.percentage - a.percentage);
};

const CategoryWeightsDisplay = () => {
	const { data: weights, isLoading } = useQuery({
		queryKey: ["categoryWeights"],
		queryFn: () => getCategoryWeights(),
	});

	if (isLoading) {
		return (
			<div className="animate-pulse">
				<div className="h-6 bg-gray-700 rounded w-48 mb-4" />
				<div className="space-y-2">
					{[...Array(5)].map((_, i) => (
						<div key={i} className="h-4 bg-gray-700 rounded w-full" />
					))}
				</div>
			</div>
		);
	}

	if (!weights) {
		return null;
	}

	const categoryItems = calculatePercentages(weights);
	const highestWeight = categoryItems[0];

	return (
		<section className="mt-8 py-8 border-t border-gray-700">
			<h3 className="text-2xl mb-4">Tomorrow&apos;s Category Chances</h3>
			<p className="text-gray-400 text-sm mb-4">
				Based on all active configs across the community
			</p>
			<div className="space-y-3">
				{categoryItems.map((item) => (
					<div
						key={item.code}
						data-category-theme={item.code}
						className="flex items-center gap-3"
					>
						<span className="text-theme w-32 truncate text-sm">
							{item.name}
						</span>
						<div className="flex-1 h-4 bg-gray-800 rounded overflow-hidden">
							<div
								className="h-full bg-theme transition-all duration-300"
								style={{ width: `${item.percentage}%` }}
							/>
						</div>
						<span className="text-gray-300 w-14 text-right text-sm">
							{item.percentage.toFixed(1)}%
						</span>
					</div>
				))}
			</div>
			{highestWeight && highestWeight.percentage > 10 && (
				<p className="mt-4 text-sm text-gray-400">
					<span
						data-category-theme={highestWeight.code}
						className="text-theme font-semibold"
					>
						{highestWeight.name}
					</span>{" "}
					has the highest chance of appearing tomorrow
				</p>
			)}
		</section>
	);
};

export default CategoryWeightsDisplay;
