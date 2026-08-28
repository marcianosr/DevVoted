import { describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Entry } from "../Entry.ui";
import type { ExtraSpotsProps } from "../ExtraSpots.ui";
import { ShopScreen, type ShopScreenProps } from "./ShopScreen.ui";

const NO_EXTRAS: ExtraSpotsProps = { steps: [], renting: 0, perGateKb: 0 };

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
	pipeline: [{ id: ".git", content: <Entry mark="pass" label=".git" /> }],
	slots: "3 of 6 spots",
	theme: "lavender",
};

describe("ShopScreen", () => {
	it("puts the shelf and the build on one screen under the shop header", () => {
		render(<ShopScreen {...props} />);

		expect(
			screen.getByRole("heading", { name: "Lavender shop" })
		).toBeInTheDocument();
		expect(screen.getByText("New configs")).toBeInTheDocument();
		expect(screen.getByText("Your pipeline")).toBeInTheDocument();
	});

	it("counts the shelf and the slots beside their own headings", () => {
		render(<ShopScreen {...props} />);

		expect(screen.getByText("5 offers")).toBeInTheDocument();
		expect(screen.getByText("3 of 6 spots")).toBeInTheDocument();
	});

	it("draws the pipeline's room under its heading", () => {
		render(<ShopScreen {...props} track={<span>the track</span>} />);

		expect(screen.getByText("the track")).toBeInTheDocument();
	});

	it("gives the offer and pipeline headings no way to collapse the list", () => {
		render(<ShopScreen {...props} />);

		expect(screen.getByText("New configs").closest("summary")).toBeNull();
		expect(screen.getByText("Your pipeline").closest("summary")).toBeNull();
	});

	it("orders the draft before the pipeline, so a stacked screen reads what is for sale first", () => {
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
				extraSpots={NO_EXTRAS}
				controls={<button>git tag</button>}
			/>
		);

		const draft = screen.getByText("New configs");
		const capacity = screen.getByText("Extra spots");
		const tag = screen.getByRole("button", { name: "git tag" });

		expect(draft.compareDocumentPosition(capacity)).toBe(
			Node.DOCUMENT_POSITION_FOLLOWING
		);
		expect(capacity.compareDocumentPosition(tag)).toBe(
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

	it("carries the extra-spot ladder in the draft column", () => {
		render(
			<ShopScreen
				{...props}
				extraSpots={{
					...NO_EXTRAS,
					steps: [
						{
							id: "extra-0",
							label: "none",
							makes: "makes 4",
							terms: "free",
							held: true,
							pick: { onUse: () => {} },
						},
					],
				}}
			/>
		);

		expect(screen.getByText("Extra spots")).toBeInTheDocument();
		expect(screen.getByText("makes 4")).toBeInTheDocument();
	});

	it("leaves the ladder out entirely when no capacity is given", () => {
		render(<ShopScreen {...props} />);

		expect(screen.queryByText("Extra spots")).not.toBeInTheDocument();
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
				notice="Shop closed. Read-only audits the build you already have."
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
				exitLock="Over capacity by 4 spots. Minify, uninstall, or rent more room."
			/>
		);

		expect(
			screen.getByRole("button", {
				name: "Continue →, Over capacity by 4 spots. Minify, uninstall, or rent more room.",
			})
		).toBeDisabled();
		expect(screen.getByText("Continue →")).toBeInTheDocument();
	});

	it("leaves the exit live and unexplained when the build can climb", () => {
		render(<ShopScreen {...props} onContinue={() => {}} />);

		expect(screen.getByRole("button", { name: "Continue →" })).toBeEnabled();
	});
});
