import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";

import { Entry } from "../Entry.ui";
import { ShopScreen, type ShopScreenProps } from "./ShopScreen.ui";

const props: ShopScreenProps = {
	gate: {
		title: "Lavender shop",
		nextGate: "gate 4",
		storage: { plan: "Free tier", used: 216, cap: 512 },
	},
	offers: [
		{
			id: "Stylelint",
			content: (
				<Entry
					leading={<span />}
					label="Stylelint"
					actions={[{ cost: "32 KB", on: "Stylelint", onUse: () => {} }]}
				/>
			),
		},
	],
	offerCount: "5 offers",
	pipeline: [{ id: ".git", content: <Entry mark="pass" label=".git" /> }],
	slots: "3 of 6 slots",
	theme: "lavender",
};

describe("ShopScreen", () => {
	it("puts the shelf and the build on one screen under the shop header", () => {
		render(<ShopScreen {...props} />);

		expect(
			screen.getByRole("heading", { name: "Lavender shop" })
		).toBeInTheDocument();
		expect(screen.getByText("Draft")).toBeInTheDocument();
		expect(screen.getByText("Your pipeline")).toBeInTheDocument();
	});

	it("counts the shelf and the slots beside their own headings", () => {
		render(<ShopScreen {...props} />);

		expect(screen.getByText("5 offers")).toBeInTheDocument();
		expect(screen.getByText("3 of 6 slots")).toBeInTheDocument();
	});

	it("orders the draft before the pipeline, so a stacked screen reads what is for sale first", () => {
		const { container } = render(<ShopScreen {...props} />);

		const [first] = Array.from(container.querySelectorAll("section"));
		expect(within(first as HTMLElement).getByText("Draft")).toBeInTheDocument();
	});

	it("divides the columns at lg and stacks them below it", () => {
		const { container } = render(<ShopScreen {...props} />);

		const [draft] = Array.from(container.querySelectorAll("section"));
		expect(draft).toHaveClass("border-b", "lg:border-b-0", "lg:border-r");
	});

	it("sits on ground tinted by the gate its exit leads to", () => {
		const { container } = render(<ShopScreen {...props} />);

		expect(container.firstElementChild).toHaveAttribute(
			"data-gate-theme",
			"lavender"
		);
		expect(container.firstElementChild).toHaveClass("bg-theme-faint");
	});

	it("carries the shelf's own controls under the draft", () => {
		render(<ShopScreen {...props} controls={<button>rebuild</button>} />);

		expect(screen.getByRole("button", { name: "rebuild" })).toBeInTheDocument();
	});

	it("carries the shelf's own rebuild beside the offer count", () => {
		render(<ShopScreen {...props} draftAction={<button>rebuild</button>} />);

		expect(screen.getByRole("button", { name: "rebuild" })).toBeInTheDocument();
	});

	it("reports the shelf's state under its heading", () => {
		render(<ShopScreen {...props} draftNote="next rebuild 8 KB" />);

		expect(screen.getByText("next rebuild 8 KB")).toBeInTheDocument();
	});

	it("carries the storage ladder in the draft column", () => {
		render(
			<ShopScreen
				{...props}
				storagePlans={{
					plans: [
						{ id: "tier-5", locked: true, opensAt: "opens when gate 6 clears" },
					],
					nextBillKb: 16,
				}}
			/>
		);

		expect(screen.getByText("Storage plan")).toBeInTheDocument();
		expect(screen.getByText("next gate bills")).toBeInTheDocument();
	});

	it("leaves the ladder out entirely when no plans are given", () => {
		render(<ShopScreen {...props} />);

		expect(screen.queryByText("Storage plan")).not.toBeInTheDocument();
		expect(screen.queryByText("next gate bills")).not.toBeInTheDocument();
	});
});
