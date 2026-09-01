import { describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Entry } from "../Entry.ui";
import type { StoragePlanProps } from "../StoragePlan.ui";
import { ShopScreen, type ShopScreenProps } from "./ShopScreen.ui";

const STORAGE_PLAN: StoragePlanProps = {
	cap: "1 MB",
	terms: "32 KB a gate",
	rows: [
		{
			id: "plan-2",
			label: "1 MB",
			terms: "32 KB a gate",
			held: true,
			pick: { onUse: () => {} },
		},
	],
};

const props: ShopScreenProps = {
	gate: {
		title: "Lavender shop",
		nextGate: "gate 4",
		storage: { balanceKb: 216 },
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
	build: [{ id: ".git", content: <Entry mark="pass" label=".git" /> }],
	slots: "3 of 6 slots",
	theme: "lavender",
};

describe("ShopScreen", () => {
	it("puts the shelf and the build on one screen under the shop header", () => {
		render(<ShopScreen {...props} />);

		expect(
			screen.getByRole("heading", { name: "Lavender shop" })
		).toBeInTheDocument();
		expect(screen.getByText("New configs")).toBeInTheDocument();
		expect(screen.getByText("Your build")).toBeInTheDocument();
	});

	it("counts the shelf and the slots beside their own headings", () => {
		render(<ShopScreen {...props} />);

		expect(screen.getByText("5 offers")).toBeInTheDocument();
		expect(screen.getByText("3 of 6 slots")).toBeInTheDocument();
	});

	it("draws the build's room under its heading", () => {
		render(<ShopScreen {...props} track={<span>the track</span>} />);

		expect(screen.getByText("the track")).toBeInTheDocument();
	});

	it("gives the offer and build headings no way to collapse the list", () => {
		render(<ShopScreen {...props} />);

		expect(screen.getByText("New configs").closest("summary")).toBeNull();
		expect(screen.getByText("Your build").closest("summary")).toBeNull();
	});

	it("orders the draft before the build, so a stacked screen reads what is for sale first", () => {
		const { container } = render(<ShopScreen {...props} />);

		const [first] = Array.from(container.querySelectorAll("section"));
		expect(
			within(first as HTMLElement).getByText("New configs")
		).toBeInTheDocument();
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

	it("orders the column from this shop outwards", () => {
		render(
			<ShopScreen
				{...props}
				storagePlan={STORAGE_PLAN}
				controls={<button>git tag</button>}
			/>
		);

		const draft = screen.getByText("New configs");
		const plan = screen.getByText("Storage plan");
		const tag = screen.getByRole("button", { name: "git tag" });

		expect(draft.compareDocumentPosition(plan)).toBe(
			Node.DOCUMENT_POSITION_FOLLOWING
		);
		expect(plan.compareDocumentPosition(tag)).toBe(
			Node.DOCUMENT_POSITION_FOLLOWING
		);
	});

	it("puts the rebuild press below the shelf it replaces, beside its next price", () => {
		render(
			<ShopScreen
				{...props}
				offers={[{ id: "stylelint", content: <span>Stylelint</span> }]}
				draftAction={<button>rebuild</button>}
				draftNote={<span>next 8 KB</span>}
			/>
		);

		const rebuild = screen.getByRole("button", { name: "rebuild" });
		expect(rebuild.parentElement).toHaveTextContent("next 8 KB");
		expect(screen.getByText("Stylelint").compareDocumentPosition(rebuild)).toBe(
			Node.DOCUMENT_POSITION_FOLLOWING
		);
	});

	it("carries the shelf's own rebuild beside the offer count", () => {
		render(<ShopScreen {...props} draftAction={<button>rebuild</button>} />);

		expect(screen.getByRole("button", { name: "rebuild" })).toBeInTheDocument();
	});

	it("reports the shelf's state under its heading", () => {
		render(<ShopScreen {...props} draftNote="next rebuild 8 KB" />);

		expect(screen.getByText("next rebuild 8 KB")).toBeInTheDocument();
	});

	it("leaves the storage plan out entirely when no plan is given", () => {
		render(<ShopScreen {...props} />);

		expect(screen.queryByText("Storage plan")).not.toBeInTheDocument();
	});

	it("offers no way out until a handler says where out is", () => {
		render(<ShopScreen {...props} />);

		expect(
			screen.queryByRole("button", { name: /Continue/ })
		).not.toBeInTheDocument();
	});

	it("leaves the shop from the footer", async () => {
		const onContinue = vi.fn();
		render(<ShopScreen {...props} onContinue={onContinue} />);

		await userEvent.click(screen.getByRole("button", { name: "Continue →" }));

		expect(onContinue).toHaveBeenCalledOnce();
	});

	it("states across the whole screen why nothing on it can be acted on", () => {
		render(
			<ShopScreen
				{...props}
				notice="Shop closed. 405 Method Not Allowed audits the build you already have."
			/>
		);

		expect(screen.getByText(/^Shop closed\./)).toBeInTheDocument();
	});

	it("says nothing at a shop that can be shopped", () => {
		render(<ShopScreen {...props} />);

		expect(screen.queryByText(/Shop closed/)).not.toBeInTheDocument();
	});

	it("shuts the exit without taking the verb off it", () => {
		render(
			<ShopScreen
				{...props}
				onContinue={() => {}}
				exitLock="Over capacity by 4 slots. Minify, uninstall, or rent more room."
			/>
		);

		expect(
			screen.getByRole("button", {
				name: "Continue →, Over capacity by 4 slots. Minify, uninstall, or rent more room.",
			})
		).toBeDisabled();
		expect(screen.getByText("Continue →")).toBeInTheDocument();
	});

	it("leaves the exit live and unexplained when the build can climb", () => {
		render(<ShopScreen {...props} onContinue={() => {}} />);

		expect(screen.getByRole("button", { name: "Continue →" })).toBeEnabled();
	});
});
