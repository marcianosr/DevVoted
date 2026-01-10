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
				<div className="h-6 bg-gray-700 w-48 mb-4" />
				<div className="h-6 bg-gray-700 w-full" />
			</div>
		);
	}

	if (!weights) {
		return null;
	}

	const categoryItems = calculatePercentages(weights);

	return (
		<section className="mt-8 py-8 border-t border-gray-700">
			<h3 className="text-2xl mb-4">Tomorrow&apos;s Category Chances</h3>

			{/* Stacked bar */}
			<div className="flex h-6 w-full overflow-hidden">
				{categoryItems.map((item) => (
					<div
						key={item.code}
						data-category-theme={item.code}
						className="h-full bg-theme"
						style={{ width: `${item.percentage}%` }}
						title={`${item.name}: ${item.percentage.toFixed(1)}%`}
					/>
				))}
			</div>

			{/* Legend */}
			<div className="flex flex-wrap gap-x-4 gap-y-2 mt-4">
				{categoryItems.map((item) => (
					<div
						key={item.code}
						data-category-theme={item.code}
						className="flex items-center gap-1.5 text-sm"
					>
						<span className="w-3 h-3 bg-theme inline-block" />
						<span className="text-theme">{item.name}</span>
						<span className="text-gray-400">{item.percentage.toFixed(1)}%</span>
					</div>
				))}
			</div>
		</section>
	);
};

export default CategoryWeightsDisplay;
