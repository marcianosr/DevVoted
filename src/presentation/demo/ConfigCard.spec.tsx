import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ConfigCard } from "./ConfigCard.ui";

const CODE_COVERAGE = {
	name: "Code Coverage",
	rarity: "common",
	costLabel: "128 KB",
	refundLabel: "64 KB",
	description: "Adds 1% coverage per correct answer in this category.",
} as const;

describe("ConfigCard", () => {
	it("renders name and rarity only in the small size", () => {
		render(<ConfigCard {...CODE_COVERAGE} size="small" />);

		expect(screen.getByText("Code Coverage")).toBeInTheDocument();
		expect(screen.getByText("(common)")).toBeInTheDocument();
		expect(screen.queryByText(/Cost/)).not.toBeInTheDocument();
		expect(screen.queryByText(/Refund/)).not.toBeInTheDocument();
		expect(
			screen.queryByText(CODE_COVERAGE.description)
		).not.toBeInTheDocument();
	});

	it("renders cost, refund and description in the small size when details are shown", () => {
		render(<ConfigCard {...CODE_COVERAGE} size="small" showDetails />);

		expect(
			screen.getByText("Cost: 128 KB · Refund: 64 KB")
		).toBeInTheDocument();
		expect(screen.getByText(CODE_COVERAGE.description)).toBeInTheDocument();
	});

	it("omits the storage line in the small size when neither cost nor refund is known", () => {
		render(
			<ConfigCard
				name="Code Coverage"
				rarity="common"
				size="small"
				showDetails
				description={CODE_COVERAGE.description}
			/>
		);

		expect(screen.queryByText(/Cost/)).not.toBeInTheDocument();
		expect(screen.getByText(CODE_COVERAGE.description)).toBeInTheDocument();
	});

	it("renders cost, refund and description in the large size", () => {
		render(<ConfigCard {...CODE_COVERAGE} size="large" />);

		expect(screen.getByText("Cost: 128 KB")).toBeInTheDocument();
		expect(screen.getByText("Refund: 64 KB")).toBeInTheDocument();
		expect(screen.getByText(CODE_COVERAGE.description)).toBeInTheDocument();
	});
});
